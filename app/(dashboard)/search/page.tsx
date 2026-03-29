'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchForm } from '@/components/SearchForm';
import { ResultsList } from '@/components/ResultsList';
import { GlassLoadingIndicator } from '@/components/GlassLoadingIndicator';
import { PageBrandLabel } from '@/components/PageBrandLabel';
import { useI18n } from '@/lib/i18n/context';
import { parseJsonFromResponse } from '@/lib/parse-api-json';

type ResultRow = {
  title: string;
  url: string;
  description: string;
  date: string;
  relevance: string;
  content_type: string;
  source: string;
  language: string;
};

type ResultsState = {
  query: { artist?: string; album?: string; language?: string };
  results: ResultRow[];
  exportId: string;
  remainingSearches?: number;
};

function SearchPageInner() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const initialArtist = useMemo(() => searchParams.get('artist') ?? '', [searchParams]);
  const initialAlbum = useMemo(() => searchParams.get('album') ?? '', [searchParams]);
  const exportIdParam = useMemo(() => searchParams.get('exportId') ?? '', [searchParams]);

  const [results, setResults] = useState<ResultsState | null>(null);
  const [loading, setLoading] = useState(false);
  const [hydratingExport, setHydratingExport] = useState(false);
  const [limitPopup, setLimitPopup] = useState<null | {
    title: string;
    body: string;
  }>(null);
  const [resultsNotice, setResultsNotice] = useState<null | { count: number }>(null);
  const searchAbortRef = useRef<AbortController | null>(null);
  const prevExportId = useRef<string>(exportIdParam);

  useEffect(() => {
    if (prevExportId.current && !exportIdParam) {
      setResults(null);
    }
    prevExportId.current = exportIdParam;
  }, [exportIdParam]);

  useEffect(() => {
    if (!exportIdParam) {
      setHydratingExport(false);
      return;
    }
    let cancelled = false;
    setHydratingExport(true);
    setResults(null);
    (async () => {
      try {
        const res = await fetch(
          `/api/searches/${encodeURIComponent(exportIdParam)}`,
          { credentials: 'include' }
        );
        if (!res.ok || cancelled) return;
        const parsed = await parseJsonFromResponse(res);
        if (!parsed.ok || cancelled) return;
        const data = parsed.data as {
          exportId: string;
          query: { artist?: string; album?: string; language?: string };
          results: ResultRow[];
        };
        if (cancelled) return;
        setResults({
          query: {
            artist: data.query?.artist as string | undefined,
            album: data.query?.album as string | undefined,
            language: data.query?.language as string | undefined,
          },
          results: Array.isArray(data.results) ? data.results : [],
          exportId: data.exportId || exportIdParam,
        });
      } catch {
        if (!cancelled) setResults(null);
      } finally {
        if (!cancelled) setHydratingExport(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [exportIdParam]);

  return (
    <div className="relative max-w-4xl mx-auto px-3 py-8 sm:px-4 sm:py-10 md:py-12">
      <PageBrandLabel />
      <h1 className="text-xl font-bold text-[var(--tosky-dark)] mb-4 sm:text-2xl md:mb-6">
        {t.search.title}
      </h1>

      <SearchForm
        key={`${exportIdParam}|${initialArtist}|${initialAlbum}`}
        initialArtist={initialArtist}
        initialAlbum={initialAlbum}
        onSearch={async (params) => {
          searchAbortRef.current?.abort();
          const ac = new AbortController();
          searchAbortRef.current = ac;
          setLoading(true);
          setResultsNotice(null);
          try {
            const res = await fetch('/api/search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(params),
              signal: ac.signal,
            });
            const parsed = await parseJsonFromResponse(res);
            if (!parsed.ok) {
              const st = res.status;
              if (st === 204) {
                return;
              }
              const likelyTimeout =
                st === 504 || st === 502 || st === 503 || st === 524;
              alert(likelyTimeout ? t.search.timeoutOrGateway : t.search.unexpectedResponse);
              return;
            }
            const data = parsed.data as {
              code?: string;
              error?: string;
              query?: ResultsState['query'];
              results?: ResultRow[];
              exportId?: string;
              remainingSearches?: number;
            };
            if (!res.ok) {
              if (res.status === 429 && data?.code === 'FREE_LIMIT_REACHED') {
                setLimitPopup({
                  title: t.search.limitTitle,
                  body: t.search.limitBody,
                });
                return;
              }
              if (res.status === 429 && data?.code === 'IP_LIMIT_REACHED') {
                setLimitPopup({
                  title: t.search.ipLimitTitle,
                  body: t.search.ipLimitBody,
                });
                return;
              }
              throw new Error(data.error || 'Search failed');
            }
            if (typeof data.exportId !== 'string' || !data.exportId) {
              alert(t.search.unexpectedResponse);
              return;
            }
            const list = Array.isArray(data.results) ? data.results : [];
            setResults({
              query: data.query ?? {},
              results: list,
              exportId: data.exportId,
              remainingSearches: data.remainingSearches,
            });
            setResultsNotice({ count: list.length });
          } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
              return;
            }
            const message = err instanceof Error ? err.message : 'Search failed';
            alert(message);
          } finally {
            if (searchAbortRef.current === ac) {
              searchAbortRef.current = null;
            }
            setLoading(false);
          }
        }}
        loading={loading}
      />

      {(loading || hydratingExport) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-[2px] dark:bg-black/40"
          aria-hidden={false}
        >
          <GlassLoadingIndicator
            size="md"
            messages={
              hydratingExport
                ? [t.search.loadingShort, t.search.loadingSteps[0]]
                : [...t.search.loadingSteps]
            }
            rotateIntervalMs={2600}
            onCancel={
              loading && !hydratingExport
                ? () => searchAbortRef.current?.abort()
                : undefined
            }
            cancelLabel={t.search.cancelSearch}
          />
        </div>
      )}

      {limitPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--tosky-card-border)] bg-[var(--tosky-card)] p-5 shadow-2xl">
            <h2 className="text-lg font-bold text-[var(--tosky-dark)]">{limitPopup.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--tosky-text-gray)]">
              {limitPopup.body}
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href="/pricing"
                className="inline-flex items-center justify-center rounded-[99px] bg-[var(--tosky-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                {t.search.popupUpgrade}
              </a>
              <button
                type="button"
                onClick={() => setLimitPopup(null)}
                className="inline-flex items-center justify-center rounded-[99px] border border-[var(--tosky-border)] px-4 py-2 text-sm font-semibold text-[var(--tosky-dark)] hover:bg-[var(--tosky-light-gray)]"
              >
                {t.search.popupClose}
              </button>
            </div>
          </div>
        </div>
      )}

      {resultsNotice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="search-results-notice-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-[var(--tosky-card-border)] bg-[var(--tosky-card)] p-5 shadow-2xl">
            <h2
              id="search-results-notice-title"
              className="text-lg font-bold text-[var(--tosky-dark)]"
            >
              {t.search.resultsNoticeTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--tosky-text-gray)]">
              {resultsNotice.count === 0
                ? t.search.resultsNoticeZero
                : t.search.resultsNoticeCount.replace(
                    '{count}',
                    String(resultsNotice.count)
                  )}
            </p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setResultsNotice(null)}
                className="inline-flex items-center justify-center rounded-[99px] bg-[var(--tosky-dark)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 dark:text-[var(--tosky-white)]"
              >
                {t.search.resultsNoticeOk}
              </button>
            </div>
          </div>
        </div>
      )}

      {results && results.results.length > 0 && (
        <ResultsList
          query={results.query}
          results={results.results}
          exportId={results.exportId}
        />
      )}

      {results && results.results.length === 0 && !loading && !hydratingExport && (
        <p className="mt-6 rounded-xl border border-[var(--tosky-card-border)] bg-[var(--tosky-card)] p-4 text-center text-sm text-[var(--tosky-text-gray)]">
          {t.search.noResults}
        </p>
      )}
    </div>
  );
}

function SearchPageFallback() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4 py-12">
      <GlassLoadingIndicator
        size="sm"
        messages={[t.search.loadingShort, ...t.search.loadingSteps.slice(0, 2)]}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchPageInner />
    </Suspense>
  );
}
