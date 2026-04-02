'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { ManageSubscriptionButton } from '@/components/ManageSubscriptionButton';
import { assertSafeStripeRedirectUrl } from '@/lib/checkout-redirect';

type Tier = 'free' | 'pro' | 'business';

type PlanState = {
  loading: boolean;
  tier: Tier;
  canManageSubscription: boolean;
};

export function PricingCards() {
  const { t } = useI18n();
  const { isSignedIn } = useUser();
  const signedIn = Boolean(isSignedIn);
  const [loading, setLoading] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanState>({
    loading: signedIn,
    tier: 'free',
    canManageSubscription: false,
  });

  useEffect(() => {
    if (!signedIn) {
      setPlan({ loading: false, tier: 'free', canManageSubscription: false });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/account/plan', { credentials: 'include', cache: 'no-store' });
        if (!res.ok) {
          if (!cancelled) setPlan((prev) => ({ ...prev, loading: false }));
          return;
        }
        const data = (await res.json()) as { tier?: Tier; canManageSubscription?: boolean };
        if (!cancelled) {
          setPlan({
            loading: false,
            tier: data.tier ?? 'free',
            canManageSubscription: Boolean(data.canManageSubscription),
          });
        }
      } catch {
        if (!cancelled) {
          setPlan((prev) => ({ ...prev, loading: false }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  const handleCheckout = async (priceId: string) => {
    setLoading(priceId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ priceId }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: unknown; error?: string };
      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      const raw = typeof data.url === 'string' ? data.url.trim() : '';
      if (!raw) {
        throw new Error(data.error || 'Checkout failed');
      }
      let href: string;
      try {
        href = assertSafeStripeRedirectUrl(raw);
      } catch {
        throw new Error('CHECKOUT_INVALID_REDIRECT');
      }
      window.location.assign(href);
    } catch (e) {
      const code = e instanceof Error ? e.message : '';
      const detail =
        code === 'CHECKOUT_INVALID_REDIRECT'
          ? t.pricing.checkoutInvalidRedirect
          : e instanceof Error
            ? e.message
            : t.pricing.checkoutUnknownError;
      alert(`${t.pricing.errorLabel}: ${detail}`);
    } finally {
      setLoading(null);
    }
  };

  const cardBase =
    'p-8 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)] border bg-[var(--tosky-card)] border-[var(--tosky-card-border)]';
  const heading = 'text-xl font-bold text-[var(--tosky-dark)] mb-2';
  const price = 'text-3xl font-bold text-[var(--tosky-dark)] mb-4';
  const priceSuffix = 'text-sm font-normal text-[var(--tosky-text-gray)]';
  const featList = 'space-y-2 text-sm text-[var(--tosky-text-gray)] mb-6';
  const btnSecondary =
    'block w-full py-3 text-center font-bolder rounded-[99px] transition-colors bg-[var(--tosky-pill-bg)] text-[var(--tosky-pill-fg)] hover:bg-[var(--tosky-pill-hover)] disabled:opacity-50';
  const btnPrimary =
    'w-full py-3 bg-[var(--tosky-primary)] text-white font-bolder rounded-[99px] hover:opacity-90 transition-opacity disabled:opacity-50';
  const currentPlanLabel = useMemo(() => {
    if (plan.loading) return t.export.loading;
    if (plan.tier === 'pro') return t.pricing.pro;
    if (plan.tier === 'business') return t.pricing.business;
    return t.pricing.free;
  }, [plan.loading, plan.tier, t.export.loading, t.pricing.business, t.pricing.free, t.pricing.pro]);

  return (
    <div className="max-w-5xl mx-auto">
      {signedIn ? (
        <div className="mb-6 rounded-lg border border-[var(--tosky-card-border)] bg-[var(--tosky-card)] p-4 text-sm text-[var(--tosky-text-gray)]">
          <span className="font-semibold text-[var(--tosky-dark)]">{t.pricing.currentPlan}: </span>
          <span className="font-semibold text-[var(--tosky-secondary)]">{currentPlanLabel}</span>
        </div>
      ) : null}

      <div className="grid md:grid-cols-3 gap-8">
        <div className={cardBase}>
          <h3 className={heading}>{t.pricing.free}</h3>
        <p className={price}>
          €0
        </p>
        <ul className={featList}>
          {t.pricing.featFree.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mb-6 text-xs leading-relaxed text-[var(--tosky-text-gray)]">
          {t.pricing.freeDetails}
        </p>
          {signedIn && plan.tier === 'free' ? (
            <div className="w-full rounded-[99px] border border-[var(--tosky-secondary)] px-4 py-3 text-center text-sm font-semibold text-[var(--tosky-secondary)]">
              {t.pricing.currentPlanActive}
            </div>
          ) : (
            <Link
              href={signedIn ? '/search' : '/sign-up'}
              className={btnSecondary}
            >
              {signedIn ? t.pricing.goSearch : t.pricing.startFree}
            </Link>
          )}
        </div>

        <div
          className={`${cardBase} shadow-[1px_1px_15px_rgba(0,0,0,0.15)] border-2 border-[var(--tosky-primary)] relative`}
        >
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--tosky-primary)] text-white text-xs font-semibold rounded-[99px]">
            {t.pricing.recommended}
          </span>
          <h3 className={heading}>{t.pricing.pro}</h3>
          <p className={price}>
            €7,99<span className={priceSuffix}>{t.pricing.perMonth}</span>
          </p>
          <ul className={featList}>
            {t.pricing.featPro.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mb-6 text-xs leading-relaxed text-[var(--tosky-text-gray)]">
            {t.pricing.proDetails}
          </p>
          {signedIn && plan.tier === 'pro' ? (
            <div className="space-y-3">
              <div className="w-full rounded-[99px] border border-[var(--tosky-secondary)] px-4 py-3 text-center text-sm font-semibold text-[var(--tosky-secondary)]">
                {t.pricing.currentPlanActive}
              </div>
              {plan.canManageSubscription ? (
                <ManageSubscriptionButton
                  label={t.pricing.manageSubscription}
                  className={btnSecondary}
                />
              ) : null}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleCheckout('pro')}
              disabled={!!loading}
              className={btnPrimary}
            >
              {loading === 'pro' ? '…' : t.pricing.subscribe}
            </button>
          )}
        </div>

        <div className={cardBase}>
          <h3 className={heading}>{t.pricing.business}</h3>
          <p className={price}>
            €19,99<span className={priceSuffix}>{t.pricing.perMonth}</span>
          </p>
          <ul className={featList}>
            {t.pricing.featBusiness.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mb-6 text-xs leading-relaxed text-[var(--tosky-text-gray)]">
            {t.pricing.businessDetails}
          </p>
          {signedIn && plan.tier === 'business' ? (
            <div className="space-y-3">
              <div className="w-full rounded-[99px] border border-[var(--tosky-secondary)] px-4 py-3 text-center text-sm font-semibold text-[var(--tosky-secondary)]">
                {t.pricing.currentPlanActive}
              </div>
              {plan.canManageSubscription ? (
                <ManageSubscriptionButton
                  label={t.pricing.manageSubscription}
                  className={btnSecondary}
                />
              ) : null}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleCheckout('business')}
              disabled={!!loading}
              className={btnSecondary}
            >
              {loading === 'business' ? '…' : t.pricing.subscribe}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
