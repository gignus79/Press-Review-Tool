'use client';

import { ExportButtons } from './ExportButtons';

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

const TYPE_ORDER = ['Review', 'Interview', 'Article', 'News', 'Streaming', 'Other'];

export function ResultsList({ query, results, exportId }: ResultsListProps) {
  const byType = TYPE_ORDER.reduce<Record<string, Result[]>>((acc, t) => {
    acc[t] = results.filter((r) => (r.content_type || 'Other') === t);
    return acc;
  }, {});

  return (
    <div className="bg-white p-6 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)] border border-[var(--tosky-border)]">
      <h2 className="text-xl font-bold text-[var(--tosky-dark)] mb-4">
        Risultati ({results.length})
      </h2>

      <ExportButtons exportId={exportId} />

      <div className="mt-8 space-y-8">
        {TYPE_ORDER.map((type) => {
          const items = byType[type];
          if (!items?.length) return null;
          return (
            <section key={type}>
              <h3 className="text-lg font-bold text-[var(--tosky-dark)] border-b-2 border-[var(--tosky-primary)] pb-2 mb-4">
                {type} ({items.length})
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
                            ? 'bg-green-100 text-green-800'
                            : r.relevance === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {r.relevance}
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
                      Leggi articolo →
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
