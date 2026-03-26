'use client';

import { useMemo, useState } from 'react';
import { ExportButtons } from './ExportButtons';
import { EmailPdfButton } from './EmailPdfButton';
import { useI18n } from '@/lib/i18n/context';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { parseResultDate } from '@/lib/date-result-filter';

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

type SortMode = 'rel-desc' | 'rel-asc' | 'date-desc' | 'date-asc';

/** Normalize API/model output (case, spacing, partial strings). */
function normalizeRelevance(rel: string): 'High' | 'Medium' | 'Low' {
  const s = (rel || '').trim().toLowerCase();
  if (s === 'high' || s === 'h') return 'High';
  if (s === 'low' || s === 'l') return 'Low';
  if (s === 'medium' || s === 'm') return 'Medium';
  if (s.includes('high')) return 'High';
  if (s.includes('low')) return 'Low';
  if (s.includes('medium')) return 'Medium';
  return 'Medium';
}

function relevanceScore(rel: string): number {
  const n = normalizeRelevance(rel);
  if (n === 'High') return 3;
  if (n === 'Medium') return 2;
  if (n === 'Low') return 1;
  return 0;
}

function titleTieBreak(a: Result, b: Result): number {
  return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
}

function compareByDate(a: Result, b: Result, order: 'desc' | 'asc'): number {
  const da = parseResultDate(a.date);
  const db = parseResultDate(b.date);
  if (!da && !db) return titleTieBreak(a, b);
  if (!da) return 1;
  if (!db) return -1;
  const ta = da.getTime();
  const tb = db.getTime();
  const primary = order === 'desc' ? tb - ta : ta - tb;
  if (primary !== 0) return primary;
  return titleTieBreak(a, b);
}

function sortPair(a: Result, b: Result, mode: SortMode): number {
  switch (mode) {
    case 'rel-desc': {
      const dr = relevanceScore(b.relevance) - relevanceScore(a.relevance);
      return dr !== 0 ? dr : compareByDate(a, b, 'desc');
    }
    case 'rel-asc': {
      const dr = relevanceScore(a.relevance) - relevanceScore(b.relevance);
      return dr !== 0 ? dr : compareByDate(a, b, 'asc');
    }
    case 'date-desc':
      return compareByDate(a, b, 'desc');
    case 'date-asc':
      return compareByDate(a, b, 'asc');
    default:
      return titleTieBreak(a, b);
  }
}

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
  const [sortMode, setSortMode] = useState<SortMode>('rel-desc');

  const relLabel = (rel: string) => {
    const n = normalizeRelevance(rel);
    if (n === 'High') return t.results.relHigh;
    if (n === 'Medium') return t.results.relMedium;
    return t.results.relLow;
  };

  const byType = useMemo(
    () =>
      TYPE_ORDER.reduce<Record<string, Result[]>>((acc, ty) => {
        const group = results.filter((r) => (r.content_type || 'Other') === ty);
        group.sort((a, b) => sortPair(a, b, sortMode));
        acc[ty] = group;
        return acc;
      }, {}),
    [results, sortMode]
  );

  return (
    <div className="bg-[var(--tosky-card)] p-6 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)] border border-[var(--tosky-card-border)]">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-[var(--tosky-border)] pb-3">
        <span className="text-base font-extrabold text-[var(--tosky-dark)] dark:text-zinc-200 sm:text-lg">
          {t.nav.brandLabel}
        </span>
        <span className="text-sm text-[var(--tosky-muted)]">{t.nav.productShort}</span>
      </div>
      <h2 className="text-xl font-bold text-[var(--tosky-dark)] mb-4">
        {t.results.title} ({results.length})
      </h2>

      <div className="flex flex-wrap items-center gap-3">
        <ExportButtons exportId={exportId} />
        <EmailPdfButton
          exportId={exportId}
          artist={query.artist}
          album={query.album}
          resultCount={results.length}
        />
        <div className="ml-auto flex items-center gap-2">
          <label htmlFor="results-sort" className="text-xs font-semibold text-[var(--tosky-text-gray)]">
            {t.results.sortLabel}
          </label>
          <select
            id="results-sort"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="max-w-[min(100vw-2rem,20rem)] cursor-pointer rounded-md border border-[var(--tosky-border)] bg-[var(--tosky-card)] px-2.5 py-1.5 text-xs font-semibold text-[var(--tosky-dark)] shadow-sm"
          >
            <option value="rel-desc">{t.results.sortRelDesc}</option>
            <option value="rel-asc">{t.results.sortRelAsc}</option>
            <option value="date-desc">{t.results.sortDateDesc}</option>
            <option value="date-asc">{t.results.sortDateAsc}</option>
          </select>
        </div>
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
                {items.map((r, i) => {
                  const relNorm = normalizeRelevance(r.relevance);
                  return (
                    <div
                      key={`${type}-${i}-${r.url}`}
                      className="p-4 bg-[var(--tosky-lighter-gray)] rounded-[4px] border-l-4 border-[var(--tosky-primary)]"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-[var(--tosky-dark)] flex-1">
                          {r.title}
                        </h4>
                        <span
                          className={`px-3 py-1 rounded text-xs font-semibold uppercase ${
                            relNorm === 'High'
                              ? 'border border-emerald-300 bg-emerald-100 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-200'
                              : relNorm === 'Medium'
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
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
