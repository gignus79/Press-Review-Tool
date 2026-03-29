import { expandArtistVariants, normalizeWhitespace } from '@/lib/artist-variants';
import {
  capResultList,
  clampRawSearchHit,
  MAX_RESULTS_IN_PIPELINE,
} from '@/lib/result-size-limits';
import { sanitizePhraseForQuery } from '@/lib/search-input';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/search';

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

/** Allineato a MAX_PRIMARY_QUERIES: meno round HTTP sotto il tetto Hobby 60s. */
const MAX_QUERIES_PER_WAVE = 7;
/** Parallelo aggressivo ma limitato per non saturare Perplexity. */
const PERPLEXITY_CONCURRENCY = 5;

async function fetchPerplexityForQuery(
  query: string,
  apiKey: string,
  options: { maxResults: number; language?: string }
): Promise<PerplexitySearchResult[]> {
  const body: Record<string, unknown> = {
    query,
    max_results: Math.min(options.maxResults ?? 20, 20),
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
  } = {}
): Promise<PerplexitySearchResult[]> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY is not configured');
  }

  const maxResults = options.maxResults ?? 20;
  const language = options.language;
  const queue = queries.slice(0, MAX_QUERIES_PER_WAVE);
  const allResults: PerplexitySearchResult[] = [];
  const seenUrls = new Set<string>();

  for (let i = 0; i < queue.length; i += PERPLEXITY_CONCURRENCY) {
    const chunk = queue.slice(i, i + PERPLEXITY_CONCURRENCY);
    const lists = await Promise.all(
      chunk.map((q) => fetchPerplexityForQuery(q, apiKey, { maxResults, language }))
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

/** Meno varianti di query = meno latenza; qualità resta alta grazie al parallelo. */
const MAX_PRIMARY_QUERIES = 7;

function pushArtistAlbumQueries(queries: string[], artist: string, album: string) {
  const a = sanitizePhraseForQuery(artist);
  const b = sanitizePhraseForQuery(album);
  queries.push(
    `"${a}" "${b}" review`,
    `${a} ${b} music`,
    `${a} ${b} interview`,
    `${a} ${b} recensione`,
    `${a} ${b} press`
  );
}

function pushArtistOnlyQueries(queries: string[], artist: string) {
  const a = sanitizePhraseForQuery(artist);
  queries.push(
    `"${a}" music review`,
    `${a} band news`,
    `${a} interview`,
    `${a} latest album`,
    `${a} musician press`
  );
}

export function buildSearchQueries(artist: string, album: string): string[] {
  const queries: string[] = [];
  const albumNorm = sanitizePhraseForQuery(normalizeWhitespace(album));

  if (artist.trim()) {
    const variants = expandArtistVariants(artist);
    for (const a of variants) {
      if (albumNorm) {
        pushArtistAlbumQueries(queries, a, albumNorm);
      } else {
        pushArtistOnlyQueries(queries, a);
      }
    }
  } else if (albumNorm) {
    queries.push(
      `"${albumNorm}" album review`,
      `${albumNorm} music album`,
      `${albumNorm} recensione`
    );
  }

  return [...new Set(queries.filter(Boolean))].slice(0, MAX_PRIMARY_QUERIES);
}
