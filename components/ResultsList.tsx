'use client';

import { useMemo, useState } from 'react';
import { ExportButtons } from './ExportButtons';
import { EmailPdfButton } from './EmailPdfButton';
import { useI18n } from '@/lib/i18n/context';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { parseResultDate } from '@/lib/date-result-filter';
import { matchesResultTextFilter } from '@/lib/result-text-filter';

interface Result {
  title: string;
  url: string;
  description: string;
  date: string;
  content_type: string;
  source: string;
  language: string;
  match_score?: number;
}

interface ResultsListProps {
  query: { artist?: string; album?: string };
  results: Result[];
  exportId: string;
}

const TYPE_ORDER = ['Review', 'Interview', 'Article', 'News', 'Streaming', 'Other'] as const;

type SortMode = 'match-desc' | 'date-desc' | 'date-asc';

function matchScore(r: Result): number {
  return typeof r.match_score === 'number' ? r.match_score : 0;
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
    case 'match-desc': {
      const dm = matchScore(b) - matchScore(a);
      return dm !== 0 ? dm : compareByDate(a, b, 'desc');
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
  const [sortMode, setSortMode] = useState<SortMode>('match-desc');
  const [textFilter, setTextFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | (typeof TYPE_ORDER)[number]>('all');

  const filtered = useMemo(() => {
    return results.filter((r) => {
      if (typeFilter !== 'all' && (r.content_type || 'Other') !== typeFilter) {
        return false;
      }
      return matchesResultTextFilter(
        {
          title: r.title,
          description: r.description,
          source: r.source,
          url: r.url,
        },
        textFilter
      );
    });
  }, [results, textFilter, typeFilter]);

  const byType = useMemo(
    () =>
      TYPE_ORDER.reduce<Record<string, Result[]>>((acc, ty) => {
        const group = filtered.filter((r) => (r.content_type || 'Other') === ty);
        group.sort((a, b) => sortPair(a, b, sortMode));
        acc[ty] = group;
        return acc;
      }, {}),
    [filtered, sortMode]
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
        {t.results.title} ({filtered.length}
        {filtered.length !== results.length ? ` / ${results.length}` : ''})
      </h2>

      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-[var(--tosky-border)] bg-[var(--tosky-lighter-gray)] p-4 dark:bg-zinc-900/40">
        <div className="text-xs font-bold uppercase tracking-wide text-[var(--tosky-text-gray)]">
          {t.results.filterSection}
        </div>
        {filtered.length === 0 && results.length > 0 && (
          <div
            role="status"
            className="rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 text-sm text-amber-950 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-100"
          >
            <p className="leading-relaxed">{t.results.filterHidAll.replace('{count}', String(results.length))}</p>
            <button
              type="button"
              onClick={() => setTextFilter('')}
              className="mt-2 text-sm font-semibold text-[var(--tosky-primary)] underline underline-offset-2 hover:opacity-90"
            >
              {t.results.filterClearText}
            </button>
          </div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-0 flex-1">
            <label htmlFor="results-text-filter" className="mb-1 block text-xs font-semibold text-[var(--tosky-text-gray)]">
              {t.results.filterSearchLabel}
            </label>
            <input
              id="results-text-filter"
              type="text"
              autoComplete="off"
              value={textFilter}
              onChange={(e) => setTextFilter(e.target.value)}
              placeholder={t.results.filterSearchPlaceholder}
              className="w-full rounded-md border border-[var(--tosky-border)] bg-[var(--tosky-card)] px-3 py-2 text-sm text-[var(--tosky-dark)] placeholder:text-[var(--tosky-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--tosky-primary)]/30"
            />
          </div>
          <div className="w-full sm:w-auto sm:min-w-[11rem]">
            <label htmlFor="results-type-filter" className="mb-1 block text-xs font-semibold text-[var(--tosky-text-gray)]">
              {t.results.filterTypesLabel}
            </label>
            <select
              id="results-type-filter"
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as typeof typeFilter)
              }
              className="w-full cursor-pointer rounded-md border border-[var(--tosky-border)] bg-[var(--tosky-card)] px-3 py-2 text-sm font-medium text-[var(--tosky-dark)]"
            >
              <option value="all">{t.results.filterTypeAll}</option>
              {TYPE_ORDER.map((ty) => (
                <option key={ty} value={ty}>
                  {labelForContentType(ty, t.results)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ExportButtons exportId={exportId} />
        <EmailPdfButton
          exportId={exportId}
          artist={query.artist}
          album={query.album}
          resultCount={filtered.length}
        />
        <div className="ml-auto flex items-center gap-2">
          <label htmlFor="results-sort" className="text-xs font-semibold text-[var(--tosky-text-gray)]">
            {t.results.sortLabel}
          </label>
          <select
            id="results-sort"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="max-w-[min(100vw-2rem,22rem)] cursor-pointer rounded-md border border-[var(--tosky-border)] bg-[var(--tosky-card)] px-2.5 py-1.5 text-xs font-semibold text-[var(--tosky-dark)] shadow-sm"
          >
            <option value="match-desc">{t.results.sortMatchDesc}</option>
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
                {items.map((r, i) => (
                  <div
                    key={`${type}-${i}-${r.url}`}
                    className="p-4 bg-[var(--tosky-lighter-gray)] rounded-[4px] border-l-4 border-[var(--tosky-primary)] dark:bg-zinc-800/60"
                  >
                    <h4 className="font-semibold text-[var(--tosky-dark)] mb-2 pr-2">
                      {r.title}
                    </h4>
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
