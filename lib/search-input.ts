import { normalizeWhitespace } from '@/lib/artist-variants';

/** Limite campo per payload DB e query esterne (Unicode consentito). */
export const MAX_SEARCH_FIELD_LENGTH = 600;

/**
 * Normalizza artista / album: stringa, senza NUL, newline → spazio, lunghezza massima.
 * Non rimuove accenti, simboli musicali, $, @, ecc.
 */
export function coerceSearchTextField(value: unknown, maxLen = MAX_SEARCH_FIELD_LENGTH): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/\u0000/g, '')
    .replace(/\r\n|\r|\n/g, ' ')
    .slice(0, maxLen)
    .trim();
}

/**
 * Per frasi tra virgolette nelle query Perplexity: le virgolette doppie romperebbero il literal.
 */
export function sanitizePhraseForQuery(s: string): string {
  return normalizeWhitespace(s.replace(/"/g, "'"));
}

export function coerceMaxResults(value: unknown, cap = 100): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return 12;
  return Math.min(Math.max(1, Math.floor(n)), cap);
}

const ALLOWED_FILTERS = new Set([
  'All',
  'Reviews Only',
  'Interviews Only',
  'News & Articles',
]);

export function coerceContentFilter(value: unknown): string {
  if (typeof value === 'string' && ALLOWED_FILTERS.has(value)) return value;
  return 'All';
}
