import {
  expandAlbumTitleVariants,
  expandArtistVariants,
  expandPressSearchArtists,
  normalizeWhitespace,
} from '@/lib/artist-variants';
import {
  capResultList,
  clampRawSearchHit,
  MAX_RESULTS_IN_PIPELINE,
} from '@/lib/result-size-limits';
import { sanitizePhraseForQuery } from '@/lib/search-input';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/search';

/** Tetto richieste Perplexity per query (Hobby / latenza). */
export const PERPLEXITY_MAX_RESULTS_PER_QUERY = 15;

export interface PerplexitySearchResult {
  title: string;
  url: string;
  snippet: string;
  date?: string;
  last_updated?: string;
}

export interface PerplexitySearchResponse {
  results: PerplexitySearchResult[];
  id?: string;
}

/** Ondata Perplexity: più query quando c’è album (rassegna sul titolo). */
const MAX_QUERIES_PER_WAVE = 8;
const PERPLEXITY_CONCURRENCY = 5;

async function fetchPerplexityForQuery(
  query: string,
  apiKey: string,
  options: { maxResults: number; language?: string; signal?: AbortSignal }
): Promise<PerplexitySearchResult[]> {
  const body: Record<string, unknown> = {
    query,
    max_results: Math.min(
      options.maxResults ?? 12,
      PERPLEXITY_MAX_RESULTS_PER_QUERY
    ),
  };

  if (options.language && options.language !== 'multi') {
    body.search_language_filter = [options.language];
  }

  const response = await fetch(PERPLEXITY_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: options.signal,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Perplexity API error: ${response.status} - ${err}`);
  }

  const data = (await response.json()) as PerplexitySearchResponse;
  if (!data.results?.length) return [];
  return data.results.map((r) => clampRawSearchHit(r));
}

export async function perplexitySearch(
  queries: string[],
  options: {
    maxResults?: number;
    language?: string;
    signal?: AbortSignal;
  } = {}
): Promise<PerplexitySearchResult[]> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY is not configured');
  }

  const maxResults = options.maxResults ?? 12;
  const language = options.language;
  const signal = options.signal;
  const queue = queries.slice(0, MAX_QUERIES_PER_WAVE);
  const allResults: PerplexitySearchResult[] = [];
  const seenUrls = new Set<string>();

  for (let i = 0; i < queue.length; i += PERPLEXITY_CONCURRENCY) {
    if (signal?.aborted) {
      const err = new Error('Search aborted');
      err.name = 'AbortError';
      throw err;
    }
    const chunk = queue.slice(i, i + PERPLEXITY_CONCURRENCY);
    const lists = await Promise.all(
      chunk.map((q) =>
        fetchPerplexityForQuery(q, apiKey, { maxResults, language, signal })
      )
    );
    for (const list of lists) {
      for (const r of list) {
        if (r.url && !seenUrls.has(r.url)) {
          seenUrls.add(r.url);
          allResults.push(r);
          if (allResults.length >= MAX_RESULTS_IN_PIPELINE) {
            return allResults;
          }
        }
      }
    }
  }

  return capResultList(allResults, MAX_RESULTS_IN_PIPELINE);
}

/** Con album/EP/single: più combinazioni (priorità rassegna su quel titolo). */
const MAX_PRIMARY_WITH_ALBUM = 14;
const MAX_PRIMARY_ARTIST_ONLY = 6;

/**
 * Query orientate alla copertura stampa dell’album indicato (recensioni, interviste, articoli).
 */
function pushArtistAlbumPressQueries(queries: string[], artist: string, album: string) {
  const a = sanitizePhraseForQuery(artist);
  const b = sanitizePhraseForQuery(album);
  if (!a || !b) return;
  const seq = [
    `"${a}" "${b}" review`,
    `"${a}" "${b}" album`,
    `"${b}" "${a}" review`,
    `${a} "${b}" album review`,
    `${a} "${b}" press`,
    `${a} "${b}" interview`,
    `${a} ${b} music magazine`,
    `${a} ${b} recensione album`,
    `${a} ${b} music critic`,
    `"${b}" ${a} album`,
    `${b} by ${a} review`,
    `${a} ${b} release coverage`,
  ];
  for (const q of seq) queries.push(q);
}

function pushArtistOnlyQueries(queries: string[], artist: string) {
  const a = sanitizePhraseForQuery(artist);
  queries.push(
    `"${a}" music review`,
    `${a} band news`,
    `${a} interview`,
    `${a} latest album`,
    `${a} musician press`,
    `${a} press coverage`
  );
}

function pushAlbumOnlyPressQueries(queries: string[], album: string) {
  const b = sanitizePhraseForQuery(album);
  queries.push(
    `"${b}" album review`,
    `"${b}" music album`,
    `${b} album press`,
    `${b} release review`,
    `${b} recensione album`,
    `${b} music press`
  );
}

export function buildSearchQueries(artist: string, album: string): string[] {
  const queries: string[] = [];
  const albumNorm = sanitizePhraseForQuery(normalizeWhitespace(album));

  if (artist.trim()) {
    if (albumNorm) {
      const artists = expandPressSearchArtists(artist).slice(0, 3);
      const albums = expandAlbumTitleVariants(albumNorm).slice(0, 2);
      for (const a of artists) {
        for (const b of albums) {
          pushArtistAlbumPressQueries(queries, a, b);
        }
      }
    } else {
      const variants = expandArtistVariants(artist).slice(0, 2);
      for (const a of variants) {
        pushArtistOnlyQueries(queries, a);
      }
    }
  } else if (albumNorm) {
    for (const b of expandAlbumTitleVariants(albumNorm).slice(0, 2)) {
      pushAlbumOnlyPressQueries(queries, b);
    }
  }

  const cap = albumNorm ? MAX_PRIMARY_WITH_ALBUM : MAX_PRIMARY_ARTIST_ONLY;
  return [...new Set(queries.filter(Boolean))].slice(0, cap);
}
