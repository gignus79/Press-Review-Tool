'use client';

import { useState } from 'react';
import { SearchForm } from '@/components/SearchForm';
import { ResultsList } from '@/components/ResultsList';

export default function SearchPage() {
  const [results, setResults] = useState<{
    query: { artist?: string; album?: string };
    results: Array<{
      title: string;
      url: string;
      description: string;
      date: string;
      relevance: string;
      content_type: string;
      source: string;
      language: string;
    }>;
    exportId: string;
    remainingSearches?: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-[var(--tosky-dark)] mb-6">
        Ricerca rassegna stampa
      </h1>

      <SearchForm
        onSearch={async (params) => {
          setLoading(true);
          try {
            const res = await fetch('/api/search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
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

      {results && (
        <ResultsList
          query={results.query}
          results={results.results}
          exportId={results.exportId}
        />
      )}
    </div>
  );
}
