/**
 * Re-ranking e pulizia leggera senza LLM aggiuntivo: allineamento query artista/album
 * su titolo, snippet e URL. Restituisce match_score 0–100 per ordinamento.
 */

import type { PressResultCore, RankedPressResult } from '@/lib/press-types';

export type { PressResultCore, RankedPressResult };

const STOP = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'of',
  'for',
  'to',
  'in',
  'on',
  'il',
  'lo',
  'la',
  'i',
  'gli',
  'le',
  'un',
  'una',
  'de',
  'del',
]);

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokensFromPhrase(phrase: string): string[] {
  const n = normalizeText(phrase);
  if (!n) return [];
  return n
    .split(' ')
    .filter((w) => w.length > 1 && !STOP.has(w));
}

/** Quanto il risultato è allineato alla query artista/album (0–100). */
export function computeMatchScore(
  row: { title: string; url: string; description: string; source?: string },
  artist: string,
  album: string
): number {
  const a = normalizeText(artist);
  const b = normalizeText(album);
  const hay = normalizeText(`${row.title} ${row.description} ${row.url} ${row.source ?? ''}`);
  if (!hay) return 0;

  let score = 0;
  const ta = tokensFromPhrase(artist);
  const tb = tokensFromPhrase(album);

  for (const t of ta) {
    if (hay.includes(t)) score += 9;
  }
  for (const t of tb) {
    if (hay.includes(t)) score += 11;
  }

  if (a.length > 3 && hay.includes(a)) score += 28;
  if (b.length > 3 && hay.includes(b)) score += 32;

  const combined = `${a} ${b}`.trim();
  if (combined.length > 6 && hay.includes(combined)) score += 40;

  /** Penalità leggera per aggregatori generici se la query è specifica. */
  const generic = /pinterest|facebook\.com\/groups|spam|torrent|cracked/i;
  if (generic.test(row.url)) score = Math.max(0, score - 25);

  return Math.min(100, Math.round(score));
}

/**
 * Ordina per match_score decrescente e rimuove risultati con score 0 solo se la query
 * ha token sufficienti e ci sono alternative migliori.
 */
export function rankPressSearchResults(
  results: PressResultCore[],
  artist: string,
  album: string
): RankedPressResult[] {
  const ranked: RankedPressResult[] = results.map((r) => ({
    ...r,
    match_score: computeMatchScore(r, artist, album),
  }));

  ranked.sort((x, y) => y.match_score - x.match_score);

  const qTokens = [...tokensFromPhrase(artist), ...tokensFromPhrase(album)];
  const hasQuery = qTokens.length > 0;

  if (!hasQuery || ranked.length <= 3) {
    return ranked;
  }

  const zeros = ranked.filter((r) => r.match_score === 0);
  const nonZero = ranked.filter((r) => r.match_score > 0);
  /** Se abbiamo abbastanza hit con score > 0, scarta i soli URL completamente fuori tema. */
  if (nonZero.length >= 4 && zeros.length > 0) {
    return nonZero;
  }

  return ranked;
}
