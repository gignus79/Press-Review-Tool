import { expandArtistVariants } from '@/lib/artist-variants';
import { perplexitySearch, type PerplexitySearchResult } from '@/lib/perplexity';
import { capResultList, MAX_RESULTS_IN_PIPELINE } from '@/lib/result-size-limits';
import { sanitizePhraseForQuery } from '@/lib/search-input';

/** Con almeno così tanti URL unici, saltiamo i fallback (risparmiamo ~15–30s). */
const MIN_RESULTS_BEFORE_FALLBACK = 7;

function mergeDedupe(
  primary: PerplexitySearchResult[],
  extra: PerplexitySearchResult[]
): PerplexitySearchResult[] {
  const seen = new Set(primary.map((r) => r.url).filter(Boolean));
  const out = [...primary];
  for (const r of extra) {
    if (r.url && !seen.has(r.url)) {
      seen.add(r.url);
      out.push(r);
    }
  }
  return out;
}

/** Query più larghe se quelle precise non restituiscono abbastanza risultati. */
export function buildFallbackSearchQueries(artist: string, album: string): string[] {
  const a = sanitizePhraseForQuery(artist.trim().replace(/\s+/g, ' '));
  const b = sanitizePhraseForQuery(album.trim().replace(/\s+/g, ' '));
  const out: string[] = [];

  if (a && b) {
    out.push(`${a} ${b} music`, `${a} ${b} release`, `${a} ${b} news`, `${b} by ${a}`);
  }
  if (a) {
    for (const variant of expandArtistVariants(a)) {
      if (variant !== a) {
        out.push(`${variant} music`, `${variant} band`);
      }
    }
    out.push(`${a} music`, `${a} musician interview`, `${a} band news`, `${a} discography`);
    const parts = a.split(' ').filter((p) => p.length > 1);
    if (parts.length > 1) {
      out.push(`${parts[0]} ${parts[parts.length - 1]} music`);
    }
    if (parts[0] && parts[0].length > 2) {
      out.push(`${parts[0]} artist`);
    }
  }
  if (b && !a) {
    out.push(`${b} album music`, `${b} record review`, `${b} album release`);
  }

  return [...new Set(out)].slice(0, 5);
}

/** Singola ondata “larga” senza filtro lingua. */
export function buildBroadQueries(artist: string, album: string): string[] {
  const a = sanitizePhraseForQuery(artist.trim());
  const b = sanitizePhraseForQuery(album.trim());
  if (a && b) return [`${a} ${b}`, `${a} ${b} music press`];
  if (a) return [`${a} music`, `${a}`];
  if (b) return [`${b} album`, `${b} music`];
  return [];
}

/**
 * Esegue Perplexity con query principali, poi fallback e infine ricerca multilingua se serve.
 */
export async function runPerplexityWithFallback(
  primaryQueries: string[],
  artist: string,
  album: string,
  options: { maxResults: number; language?: string }
): Promise<PerplexitySearchResult[]> {
  const { maxResults, language } = options;

  let raw = capResultList(
    await perplexitySearch(primaryQueries, {
      maxResults: Math.min(maxResults, 20),
      language,
    }),
    MAX_RESULTS_IN_PIPELINE
  );

  if (raw.length >= MIN_RESULTS_BEFORE_FALLBACK) {
    return raw;
  }

  const fallbackQs = buildFallbackSearchQueries(artist, album).filter(
    (q) => !primaryQueries.includes(q)
  );
  if (fallbackQs.length > 0) {
    const extra = await perplexitySearch(fallbackQs, {
      maxResults: Math.min(maxResults, 20),
      language: undefined,
    });
    raw = capResultList(mergeDedupe(raw, extra), MAX_RESULTS_IN_PIPELINE);
  }

  if (raw.length >= MIN_RESULTS_BEFORE_FALLBACK) {
    return raw;
  }

  /** Ultima rete di sicurezza solo se ancora pochi risultati (2 query, costo contenuto). */
  if (raw.length < 5) {
    const broad = buildBroadQueries(artist, album);
    if (broad.length > 0) {
      const extra2 = await perplexitySearch(broad, {
        maxResults: Math.min(maxResults, 20),
        language: undefined,
      });
      raw = capResultList(mergeDedupe(raw, extra2), MAX_RESULTS_IN_PIPELINE);
    }
  }

  return capResultList(raw, MAX_RESULTS_IN_PIPELINE);
}
