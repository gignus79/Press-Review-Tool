'use client';

import { ExportButtons } from './ExportButtons';
import { EmailPdfButton } from './EmailPdfButton';
import { useI18n } from '@/lib/i18n/context';
import type { Dictionary } from '@/lib/i18n/dictionaries';

interface Result {
  title: string;
  url: string;
  description: string;
  date: string;
  relevance: string;
  content_type: string;
  source: string;
  language: string;
}

interface ResultsListProps {
  query: { artist?: string; album?: string };
  results: Result[];
  exportId: string;
}

const TYPE_ORDER = ['Review', 'Interview', 'Article', 'News', 'Streaming', 'Other'] as const;

function labelForContentType(
  type: (typeof TYPE_ORDER)[number],
  tr: Dictionary['results']
): string {
  switch (type) {
    case 'Review':
      return tr.typeReview;
    case 'Interview':
      return tr.typeInterview;
    case 'Article':
      return tr.typeArticle;
    case 'News':
      return tr.typeNews;
    case 'Streaming':
      return tr.typeStreaming;
    default:
      return tr.typeOther;
  }
}

export function ResultsList({ query, results, exportId }: ResultsListProps) {
  const { t } = useI18n();

  const relLabel = (rel: string) => {
    if (rel === 'High') return t.results.relHigh;
    if (rel === 'Medium') return t.results.relMedium;
    return t.results.relLow;
  };

  const byType = TYPE_ORDER.reduce<Record<string, Result[]>>((acc, ty) => {
    acc[ty] = results.filter((r) => (r.content_type || 'Other') === ty);
    return acc;
  }, {});

  return (
    <div className="bg-[var(--tosky-card)] p-6 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)] border border-[var(--tosky-card-border)]">
      <h2 className="text-xl font-bold text-[var(--tosky-dark)] mb-4">
        {t.results.title} ({results.length})
      </h2>

      <div className="flex flex-wrap gap-3">
        <ExportButtons exportId={exportId} />
        <EmailPdfButton
          exportId={exportId}
          artist={query.artist}
          album={query.album}
          resultCount={results.length}
        />
      </div>

      <div className="mt-8 space-y-8">
        {TYPE_ORDER.map((type) => {
          const items = byType[type];
          if (!items?.length) return null;
          const typeLabel = labelForContentType(type, t.results);
          return (
            <section key={type}>
              <h3 className="text-lg font-bold text-[var(--tosky-dark)] border-b-2 border-[var(--tosky-primary)] pb-2 mb-4">
                {typeLabel} ({items.length})
              </h3>
              <div className="space-y-4">
                {items.map((r, i) => (
                  <div
                    key={`${r.url}-${i}`}
                    className="p-4 bg-[var(--tosky-lighter-gray)] rounded-[4px] border-l-4 border-[var(--tosky-primary)]"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-[var(--tosky-dark)] flex-1">
                        {r.title}
                      </h4>
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold uppercase ${
                          r.relevance === 'High'
                            ? 'border border-emerald-300 bg-emerald-100 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-200'
                            : r.relevance === 'Medium'
                              ? 'border border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-400/30 dark:bg-amber-500/20 dark:text-amber-200'
                              : 'border border-rose-300 bg-rose-100 text-rose-900 dark:border-rose-400/30 dark:bg-rose-500/20 dark:text-rose-200'
                        }`}
                      >
                        {relLabel(r.relevance)}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--tosky-text-gray)] mb-2">
                      {r.source} | {r.date} | {r.language}
                    </p>
                    <p className="text-sm text-[var(--tosky-base-text)] mb-2">
                      {r.description}
                    </p>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--tosky-primary)] font-semibold hover:underline"
                    >
                      {t.results.readArticle}
                    </a>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
