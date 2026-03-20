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

  const allResults: PerplexitySearchResult[] = [];
  const seenUrls = new Set<string>();

  for (const query of queries.slice(0, 5)) {
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
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Perplexity API error: ${response.status} - ${err}`);
    }

    const data = (await response.json()) as PerplexitySearchResponse;
    if (data.results) {
      for (const r of data.results) {
        if (r.url && !seenUrls.has(r.url)) {
          seenUrls.add(r.url);
          allResults.push({
            title: r.title || '',
            url: r.url,
            snippet: r.snippet || '',
            date: r.date,
            last_updated: r.last_updated,
          });
        }
      }
    }
  }

  return allResults;
}

export function buildSearchQueries(artist: string, album: string): string[] {
  const queries: string[] = [];

  if (artist && album) {
    queries.push(
      `"${artist}" "${album}" review`,
      `${artist} ${album} recensione`,
      `${artist} ${album} interview`,
      `${artist} ${album} music press`,
      `${artist} ${album} album news`
    );
  } else if (artist) {
    queries.push(
      `"${artist}" music review`,
      `${artist} latest album`,
      `${artist} interview`,
      `${artist} news press`
    );
  } else if (album) {
    queries.push(
      `"${album}" album review`,
      `${album} music`,
      `${album} recensione`
    );
  }

  return queries.filter(Boolean).slice(0, 5);
}
