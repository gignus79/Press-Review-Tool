'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';

export function DashboardActions({
  tier,
  remaining,
}: {
  tier: 'free' | 'pro' | 'business';
  remaining: number;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const onNewSearch = () => {
    if (tier === 'free' && remaining <= 0) {
      setOpen(true);
      return;
    }
    router.push('/search');
  };

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
        <button
          type="button"
          onClick={onNewSearch}
          className="inline-flex items-center justify-center px-6 py-3 text-center font-bolder text-[var(--tosky-pill-fg)] transition-colors rounded-[99px] bg-[var(--tosky-pill-bg)] hover:bg-[var(--tosky-pill-hover)] sm:px-8 sm:py-4"
        >
          {t.dashboard.newSearch}
        </button>
        <a
          href="/history"
          className="inline-flex items-center justify-center border-2 border-[var(--tosky-secondary)] px-6 py-3 text-center font-bolder text-[var(--tosky-secondary)] transition-colors rounded-[99px] hover:bg-[var(--tosky-secondary)] hover:text-white sm:px-8 sm:py-4"
        >
          {t.dashboard.fullHistory}
        </a>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--tosky-card-border)] bg-[var(--tosky-card)] p-5 shadow-2xl">
            <h2 className="text-lg font-bold text-[var(--tosky-dark)]">{t.search.limitTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--tosky-text-gray)]">
              {t.search.limitBody}
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
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-[99px] border border-[var(--tosky-border)] px-4 py-2 text-sm font-semibold text-[var(--tosky-dark)] hover:bg-[var(--tosky-light-gray)]"
              >
                {t.search.popupClose}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
