'use client';

import { DashboardActions } from '@/components/DashboardActions';
import { ManageSubscriptionButton } from '@/components/ManageSubscriptionButton';
import { PageBrandLabel } from '@/components/PageBrandLabel';
import { useI18n } from '@/lib/i18n/context';

export function DashboardPageContent({
  searchCount,
  limit,
  remaining,
  tier,
}: {
  searchCount: number;
  limit: number;
  remaining: number;
  tier: 'free' | 'pro' | 'business';
}) {
  const { t } = useI18n();

  const tierLabel =
    tier === 'free' ? t.pricing.free : tier === 'pro' ? t.pricing.pro : t.pricing.business;

  return (
    <div className="mx-auto max-w-4xl px-3 py-8 sm:px-4 sm:py-10 md:py-12">
      <PageBrandLabel />
      <h1 className="mb-4 text-xl font-bold text-[var(--tosky-dark)] sm:text-2xl md:mb-6">
        {t.dashboard.title}
      </h1>

      <div className="mb-6 rounded-lg border border-[var(--tosky-card-border)] bg-[var(--tosky-card)] p-4 shadow-[0_2px_4px_rgba(0,0,0,0.06)] sm:p-6 md:mb-8">
        <h2 className="mb-3 font-bold text-[var(--tosky-dark)] sm:mb-4">{t.dashboard.usage}</h2>
        <p className="text-[var(--tosky-text-gray)]">
          {t.dashboard.searchesThisMonth}:{' '}
          <strong className="text-[var(--tosky-dark)]">
            {searchCount}
          </strong>{' '}
          / {limit}
        </p>
        <p className="mt-2 text-sm text-[var(--tosky-text-gray)]">
          {t.dashboard.remaining}{' '}
          <span className="font-semibold text-[var(--tosky-dark)]">{remaining}</span>{' '}
          {t.dashboard.searchesWord}
        </p>
        <p className="mt-2 text-sm text-[var(--tosky-text-gray)]">
          {t.dashboard.plan}:{' '}
          <span className="font-semibold capitalize text-[var(--tosky-dark)]">{tierLabel}</span>
        </p>
      </div>

      <DashboardActions tier={tier} remaining={remaining} />

      {tier !== 'free' ? (
        <div className="mt-4 max-w-xs">
          <ManageSubscriptionButton
            label={t.pricing.manageSubscription}
            className="block w-full rounded-[99px] bg-[var(--tosky-pill-bg)] py-3 text-center font-bolder text-[var(--tosky-pill-fg)] transition-colors hover:bg-[var(--tosky-pill-hover)]"
          />
        </div>
      ) : null}
    </div>
  );
}
