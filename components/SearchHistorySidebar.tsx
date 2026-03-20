'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { IconHistory, IconChevronRight } from '@/components/icons';

export type HistoryItem = {
  export_id: string | null;
  artist: string | null;
  album: string | null;
  results_count: number | null;
  created_at: string;
};

function HistoryLinkItem({ h, resultsWord }: { h: HistoryItem; resultsWord: string }) {
  const params = new URLSearchParams();
  if (h.export_id) params.set('exportId', h.export_id);
  if (h.artist) params.set('artist', h.artist);
  if (h.album) params.set('album', h.album);
  const href = `/search?${params.toString()}`;

  return (
    <li>
      <Link
        href={href}
        className="group flex items-start gap-2 rounded-lg px-2 py-2.5 text-sm text-[var(--tosky-base-text)] transition-colors hover:bg-[var(--tosky-light-gray)] active:bg-[var(--tosky-lighter-gray)] dark:hover:bg-[var(--tosky-lighter-gray)]"
      >
        <IconChevronRight className="mt-0.5 shrink-0 text-[var(--tosky-muted)] group-hover:text-[var(--tosky-primary)]" />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-[var(--tosky-dark)]">
            {[h.artist, h.album].filter(Boolean).join(' — ') || '—'}
          </span>
          <span className="text-xs text-[var(--tosky-muted)]">
            {new Date(h.created_at).toLocaleString()} · {h.results_count ?? 0} {resultsWord}
          </span>
        </span>
      </Link>
    </li>
  );
}

export function SearchHistorySidebar() {
  const { t } = useI18n();
  const [items, setItems] = useState<HistoryItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/searches/history', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.searches) {
          setItems(
            data.searches.map((s: HistoryItem & { created_at: Date }) => ({
              ...s,
              created_at: new Date(s.created_at).toISOString(),
            }))
          );
        }
      } catch {
        if (!cancelled) setItems([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const listContent =
    items === null ? (
      <p className="text-sm text-[var(--tosky-muted)]">{t.export.loading}</p>
    ) : items.length === 0 ? (
      <p className="text-sm text-[var(--tosky-muted)]">{t.sidebar.empty}</p>
    ) : (
      <ul className="space-y-0.5">
        {items.map((h) => (
          <HistoryLinkItem
            key={`${h.export_id}-${h.created_at}`}
            h={h}
            resultsWord={t.sidebar.results}
          />
        ))}
      </ul>
    );

  return (
    <>
      {/* Mobile / tablet: pannello espandibile */}
      <details className="group border-b border-[var(--tosky-border)] bg-[var(--tosky-header-bg)] md:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-3 text-sm font-bold uppercase tracking-wide text-[var(--tosky-dark)] [-webkit-details-marker]:hidden sm:px-4">
          <span className="flex items-center gap-2">
            <IconHistory className="text-[var(--tosky-secondary)]" />
            {t.sidebar.openPanel}
          </span>
          <IconChevronRight className="shrink-0 transition-transform group-open:rotate-90" />
        </summary>
        <div className="max-h-[min(50vh,320px)] overflow-y-auto overscroll-contain border-t border-[var(--tosky-border)] px-2 pb-3 pt-1">
          {listContent}
          <Link
            href="/history"
            className="mt-3 block rounded-lg py-2 text-center text-xs font-semibold text-[var(--tosky-secondary)] hover:underline"
          >
            {t.dashboard.fullHistory}
          </Link>
        </div>
      </details>

      {/* Desktop: sidebar fissa */}
      <aside className="hidden w-full shrink-0 border-b-0 border-[var(--tosky-border)] bg-[var(--tosky-header-bg)] md:block md:w-64 md:border-r lg:w-72 md:min-h-[calc(100vh-4rem)]">
        <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto p-3 lg:p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--tosky-dark)]">
            <IconHistory className="shrink-0 text-[var(--tosky-secondary)]" />
            {t.sidebar.title}
          </h2>
          {listContent}
          <Link
            href="/history"
            className="mt-4 block text-center text-xs font-semibold text-[var(--tosky-secondary)] hover:underline"
          >
            {t.dashboard.fullHistory}
          </Link>
        </div>
      </aside>
    </>
  );
}
