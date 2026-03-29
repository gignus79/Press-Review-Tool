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

/** Suffissi da ensemble (trio, band, …): utile anche per “Michel Rosciglione Trio” → “Michel Rosciglione”. */
const ENSEMBLE_SUFFIX = /\s+(trio|quartet|quartetto|band|group|orchestra)$/i;

/**
 * Varianti artista per rassegna stampa: articoli + nome senza suffisso ensemble.
 */
export function expandPressSearchArtists(artist: string): string[] {
  const base = expandArtistVariants(artist);
  const out = new Set<string>();
  for (const v of base) {
    out.add(v);
    const m = ENSEMBLE_SUFFIX.exec(v);
    if (m && m.index != null && m.index > 0) {
      const core = v.slice(0, m.index).trim();
      if (core.length > 2) {
        for (const u of expandArtistVariants(core)) {
          out.add(u);
        }
      }
    }
  }
  return [...out].filter(Boolean);
}

/**
 * Titolo album con e senza normalizzazione maiuscole (es. “moon and sand” / “Moon And Sand”).
 */
export function expandAlbumTitleVariants(album: string): string[] {
  const n = normalizeWhitespace(album);
  if (!n) return [];
  const out = new Set<string>();
  out.add(n);
  const stripped = stripArticles(n);
  if (stripped && stripped !== n) {
    out.add(stripped);
    out.add(titleCaseWords(stripped));
  }
  const titled = titleCaseWords(n);
  if (titled !== n) out.add(titled);
  return [...out].filter(Boolean);
}
