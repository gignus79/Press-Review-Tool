/**
 * Espande il nome artista per ricerche più robuste (es. "Cinelli Brothers" ↔ "The Cinelli Brothers").
 */

const LEADING_ARTICLE_EN = /^(the|a|an)\s+/i;
const LEADING_ARTICLE_IT = /^(il|lo|la|i|gli|le|l')\s+/i;

export function normalizeWhitespace(s: string): string {
  return s.trim().replace(/\s+/g, ' ');
}

function stripArticles(name: string): string {
  return name.replace(LEADING_ARTICLE_EN, '').replace(LEADING_ARTICLE_IT, '').trim();
}

function titleCaseWords(s: string): string {
  return s
    .split(/\s+/)
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(' ');
}

/**
 * Genera varianti da provare in query (deduplicate, ordine stabile).
 */
export function expandArtistVariants(artist: string): string[] {
  const n = normalizeWhitespace(artist);
  if (!n) return [];

  const variants = new Set<string>();
  variants.add(n);

  const stripped = stripArticles(n);
  if (stripped && stripped !== n) {
    variants.add(stripped);
    variants.add(titleCaseWords(stripped));
  }

  const core = stripped || n;
  const titled = titleCaseWords(core);
  const wordCount = core.split(/\s+/).filter(Boolean).length;

  if (wordCount >= 2 && !/^the\s+/i.test(n) && titled.length > 0) {
    variants.add(`The ${titled}`);
    variants.add(`the ${titled}`);
  }

  if (titled !== n && titled !== stripped) {
    variants.add(titled);
  }

  return [...variants].filter(Boolean);
}
