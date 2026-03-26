'use client';

import { useI18n } from '@/lib/i18n/context';

/** Small brand line above page titles (dashboard routes). */
export function PageBrandLabel() {
  const { t } = useI18n();
  return (
    <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.14em] text-[var(--tosky-dark)] dark:text-zinc-200">
      {t.dashboard.brandLabel}
    </p>
  );
}
