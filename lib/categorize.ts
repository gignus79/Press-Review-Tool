import Anthropic from '@anthropic-ai/sdk';
import {
  MAX_MODEL_ITEMS_PER_BATCH_FACTOR,
  MAX_RESULTS_IN_PIPELINE,
  MAX_RESULT_TITLE_LEN,
  MAX_RESULT_URL_LEN,
} from '@/lib/result-size-limits';
import type { ContentType, PressResultCore } from '@/lib/press-types';

export type { ContentType };
export type CategorizedResult = PressResultCore;

function extractHostname(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

const MAX_DESC_LEN = 4500;
const MAX_SOURCE_LEN = 200;
const MAX_LANG_LEN = 12;

function fallbackFromBatch(
  batch: Array<{ title: string; url: string; snippet: string; date?: string }>
): CategorizedResult[] {
  return batch.map((r) => ({
    title: r.title.slice(0, MAX_RESULT_TITLE_LEN),
    url: r.url.slice(0, MAX_RESULT_URL_LEN),
    description: r.snippet.slice(0, MAX_DESC_LEN),
    date: (r.date || 'N/A').slice(0, 32),
    content_type: 'Article' as ContentType,
    source: extractHostname(r.url).slice(0, MAX_SOURCE_LEN),
    language: 'EN',
  }));
}

function normalizeCategorizedRow(
  row: unknown,
  fallback: { title: string; url: string; snippet: string; date?: string }
): CategorizedResult {
  if (!row || typeof row !== 'object') {
    return fallbackFromBatch([fallback])[0]!;
  }
  const o = row as Record<string, unknown>;
  const title = String(o.title ?? fallback.title).slice(0, MAX_RESULT_TITLE_LEN);
  const url = String(o.url ?? fallback.url).slice(0, MAX_RESULT_URL_LEN);
  const description = String(o.description ?? fallback.snippet).slice(0, MAX_DESC_LEN);
  const dateRaw = o.date != null ? String(o.date) : fallback.date || 'N/A';
  const ct = [
    'Review',
    'Interview',
    'Article',
    'News',
    'Streaming',
    'Other',
  ].includes(String(o.content_type))
    ? (String(o.content_type) as ContentType)
    : ('Article' as ContentType);
  const source = String(o.source ?? extractHostname(url)).slice(0, MAX_SOURCE_LEN);
  const language = String(o.language ?? 'EN').slice(0, MAX_LANG_LEN);
  return {
    title,
    url,
    description,
    date: dateRaw.slice(0, 32),
    content_type: ct,
    source,
    language,
  };
}

type RawRow = { title: string; url: string; snippet: string; date?: string };

async function categorizeBatchWithAnthropic(
  anthropic: Anthropic,
  systemPrompt: string,
  keywords: string[],
  batch: RawRow[],
  signal?: AbortSignal
): Promise<CategorizedResult[]> {
  if (batch.length === 0) return [];

  const context = batch.map((r) => ({
    title: r.title.slice(0, 200),
    url: r.url.slice(0, MAX_RESULT_URL_LEN),
    description: r.snippet.slice(0, 400),
    date: r.date || 'N/A',
  }));

  try {
    const response = await anthropic.messages.create(
      {
        model: 'claude-sonnet-4-20250514',
        max_tokens: batch.length >= 20 ? 4200 : 2400,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Keywords: ${keywords.join(', ')}\n\nResults:\n${JSON.stringify(context)}`,
          },
        ],
      },
      { signal }
    );

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']') + 1;
    if (start >= 0 && end > start) {
      try {
        const parsed = JSON.parse(text.slice(start, end)) as unknown;
        if (
          Array.isArray(parsed) &&
          parsed.length <= batch.length * MAX_MODEL_ITEMS_PER_BATCH_FACTOR
        ) {
          const out: CategorizedResult[] = [];
          for (let j = 0; j < batch.length; j++) {
            out.push(normalizeCategorizedRow(parsed[j], batch[j]!));
          }
          return out;
        }
      } catch {
        // malformed JSON from model — use fallback for this batch
      }
    }
    return fallbackFromBatch(batch);
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw err;
    }
    const hint =
      err instanceof Error ? err.message : typeof err === 'string' ? err : JSON.stringify(err);
    console.error('[categorize] Anthropic request failed, using heuristic fallback:', hint);
    return fallbackFromBatch(batch);
  }
}

export async function categorizeResults(
  results: Array<{ title: string; url: string; snippet: string; date?: string }>,
  keywords: string[],
  options?: { signal?: AbortSignal }
): Promise<CategorizedResult[]> {
  const signal = options?.signal;
  const capped = results.slice(0, MAX_RESULTS_IN_PIPELINE);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return fallbackFromBatch(capped);
  }

  const anthropic = new Anthropic({ apiKey });

  const systemPrompt = `You are an expert music press analyst. Categorize each search result for a music press digest.

For each result, return a JSON object with:
- title: full title (max ~200 chars)
- url: full URL
- description: concise summary (max ~400 chars; do not paste long article bodies)
- date: YYYY-MM-DD or "N/A"
- content_type: "Review", "Interview", "Article", "News", "Streaming", or "Other"
- source: publication/site name
- language: ISO code (EN, IT, etc.)

Prefer types that reflect press coverage (reviews, interviews, articles) when the text supports it.

Return ONE JSON array with EXACTLY one object per input result, same order. No extra items. Return ONLY valid JSON, no other text.`;

  const ANTHROPIC_HEAD = 24;
  const head = capped.slice(0, ANTHROPIC_HEAD);
  const tail = capped.slice(ANTHROPIC_HEAD);
  const aiRows = await categorizeBatchWithAnthropic(
    anthropic,
    systemPrompt,
    keywords,
    head,
    signal
  );
  return [...aiRows, ...fallbackFromBatch(tail)];
}
