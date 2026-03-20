'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchForm } from '@/components/SearchForm';
import { ResultsList } from '@/components/ResultsList';
import { GlassLoadingIndicator } from '@/components/GlassLoadingIndicator';
import { useI18n } from '@/lib/i18n/context';

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
        const data = (await res.json()) as {
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
      <h1 className="text-xl font-bold text-[var(--tosky-dark)] mb-4 sm:text-2xl md:mb-6">
        {t.search.title}
      </h1>

      <SearchForm
        key={`${exportIdParam}|${initialArtist}|${initialAlbum}`}
        initialArtist={initialArtist}
        initialAlbum={initialAlbum}
        onSearch={async (params) => {
          setLoading(true);
          try {
            const res = await fetch('/api/search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(params),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Search failed');
            setResults({
              query: data.query,
              results: data.results,
              exportId: data.exportId,
              remainingSearches: data.remainingSearches,
            });
          } finally {
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
          />
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
