/**
 * Limiti per evitare heap OOM: Perplexity può restituire snippet enormi;
 * molte query × molti risultati saturano memoria (JSON verso Claude e DB).
 */
export const MAX_RESULT_TITLE_LEN = 500;
export const MAX_RESULT_URL_LEN = 2048;
export const MAX_RESULT_SNIPPET_LEN = 3500;
/** Massimo risultati in pipeline (Hobby ~60s: meno classificazione = meno timeout). */
export const MAX_RESULTS_IN_PIPELINE = 48;
/** Anthropic: non accettare array modello molto più grande del batch. */
export const MAX_MODEL_ITEMS_PER_BATCH_FACTOR = 2;

export type RawSearchHit = {
  title: string;
  url: string;
  snippet: string;
  date?: string;
  last_updated?: string;
};

export function clampRawSearchHit(r: {
  title?: string;
  url?: string;
  snippet?: string;
  date?: string;
  last_updated?: string;
}): RawSearchHit {
  const date = r.date != null ? String(r.date).slice(0, 80) : undefined;
  const last_updated =
    r.last_updated != null ? String(r.last_updated).slice(0, 80) : undefined;
  return {
    title: (r.title ?? '').slice(0, MAX_RESULT_TITLE_LEN),
    url: (r.url ?? '').slice(0, MAX_RESULT_URL_LEN),
    snippet: (r.snippet ?? '').slice(0, MAX_RESULT_SNIPPET_LEN),
    ...(date ? { date } : {}),
    ...(last_updated ? { last_updated } : {}),
  };
}

export function capResultList<T extends { url?: string }>(items: T[], max: number): T[] {
  if (items.length <= max) return items;
  return items.slice(0, max);
}
