import {
  expandAlbumTitleVariants,
  expandArtistVariants,
  expandPressSearchArtists,
} from '@/lib/artist-variants';
import {
  perplexitySearch,
  PERPLEXITY_MAX_RESULTS_PER_QUERY,
  type PerplexitySearchResult,
} from '@/lib/perplexity';
import { capResultList, MAX_RESULTS_IN_PIPELINE } from '@/lib/result-size-limits';
import { sanitizePhraseForQuery } from '@/lib/search-input';

const MIN_RESULTS_BEFORE_FALLBACK_DEFAULT = 6;
const MIN_RESULTS_BEFORE_FALLBACK_WITH_ALBUM = 4;

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
    const artists = expandPressSearchArtists(artist.trim()).slice(0, 2);
    const albums = expandAlbumTitleVariants(album.trim()).slice(0, 2);
    for (const av of artists) {
      for (const bv of albums) {
        out.push(
          `"${bv}" "${av}"`,
          `review "${bv}" ${av}`,
          `${av} ${bv} streaming interview`,
          `recensione "${bv}" ${av}`,
          `${bv} album ${av} news`
        );
      }
    }
    out.push(`${a} ${b} music`, `${a} ${b} release`, `${b} by ${a}`);
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
    out.push(`${b} album music`, `${b} record review`, `${b} album release`, `"${b}" press`);
  }

  return [...new Set(out)].slice(0, 5);
}

/**
 * Esegue Perplexity con query principali, poi fallback e infine ricerca multilingua se serve.
 */
export async function runPerplexityWithFallback(
  primaryQueries: string[],
  artist: string,
  album: string,
  options: { maxResults: number; language?: string; signal?: AbortSignal }
): Promise<PerplexitySearchResult[]> {
  const { maxResults, language, signal } = options;
  const albumProvided = Boolean(album.trim());
  const minBeforeFallback = albumProvided
    ? MIN_RESULTS_BEFORE_FALLBACK_WITH_ALBUM
    : MIN_RESULTS_BEFORE_FALLBACK_DEFAULT;

  let raw = capResultList(
    await perplexitySearch(primaryQueries, {
      maxResults: Math.min(maxResults, PERPLEXITY_MAX_RESULTS_PER_QUERY),
      language,
      signal,
    }),
    MAX_RESULTS_IN_PIPELINE
  );

  if (raw.length >= minBeforeFallback) {
    return raw;
  }

  const fallbackQs = buildFallbackSearchQueries(artist, album).filter(
    (q) => !primaryQueries.includes(q)
  );
  if (fallbackQs.length > 0) {
    const extra = await perplexitySearch(fallbackQs, {
      maxResults: Math.min(maxResults, PERPLEXITY_MAX_RESULTS_PER_QUERY),
      language: undefined,
      signal,
    });
    raw = capResultList(mergeDedupe(raw, extra), MAX_RESULTS_IN_PIPELINE);
  }

  return capResultList(raw, MAX_RESULTS_IN_PIPELINE);
}
