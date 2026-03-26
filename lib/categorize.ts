import Anthropic from '@anthropic-ai/sdk';

export type ContentType = 'Review' | 'Interview' | 'Article' | 'News' | 'Streaming' | 'Other';
export type Relevance = 'High' | 'Medium' | 'Low';

export interface CategorizedResult {
  title: string;
  url: string;
  description: string;
  date: string;
  relevance: Relevance;
  content_type: ContentType;
  source: string;
  language: string;
}

function extractHostname(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

function fallbackFromBatch(
  batch: Array<{ title: string; url: string; snippet: string; date?: string }>
): CategorizedResult[] {
  return batch.map((r) => ({
    title: r.title,
    url: r.url,
    description: r.snippet,
    date: r.date || 'N/A',
    relevance: 'Medium' as Relevance,
    content_type: 'Article' as ContentType,
    source: extractHostname(r.url),
    language: 'EN',
  }));
}

export async function categorizeResults(
  results: Array<{ title: string; url: string; snippet: string; date?: string }>,
  keywords: string[]
): Promise<CategorizedResult[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return fallbackFromBatch(results);
  }

  const anthropic = new Anthropic({ apiKey });

  const systemPrompt = `You are an expert music press analyst. Analyze these search results and categorize each one.

For each RELEVANT result, return a JSON object with:
- title: full title
- url: full URL
- description: detailed description (min 100 chars)
- date: YYYY-MM-DD or "N/A"
- relevance: "High", "Medium" or "Low"
- content_type: "Review", "Interview", "Article", "News", "Streaming", or "Other"
- source: publication/site name
- language: ISO code (EN, IT, etc.)

Be generous including results. Return ONLY a valid JSON array, no other text.`;

  const batchSize = 15;
  const categorized: CategorizedResult[] = [];

  for (let i = 0; i < results.length; i += batchSize) {
    const batch = results.slice(i, i + batchSize);
    const context = batch.map((r) => ({
      title: r.title.slice(0, 200),
      url: r.url,
      description: r.snippet.slice(0, 300),
      date: r.date || 'N/A',
    }));

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Keywords: ${keywords.join(', ')}\n\nResults:\n${JSON.stringify(context, null, 2)}`,
          },
        ],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const start = text.indexOf('[');
      const end = text.lastIndexOf(']') + 1;
      if (start >= 0 && end > start) {
        try {
          const parsed = JSON.parse(text.slice(start, end)) as CategorizedResult[];
          categorized.push(...parsed);
          continue;
        } catch {
          // malformed JSON from model — use fallback for this batch
        }
      }
      categorized.push(...fallbackFromBatch(batch));
    } catch (err) {
      const hint =
        err instanceof Error ? err.message : typeof err === 'string' ? err : JSON.stringify(err);
      console.error('[categorize] Anthropic request failed, using heuristic fallback:', hint);
      categorized.push(...fallbackFromBatch(batch));
    }
  }

  return categorized;
}
