'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';

export function PricingCards() {
  const { t } = useI18n();
  const { isSignedIn } = useUser();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (priceId: string) => {
    setLoading(priceId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error || 'Checkout failed');
    } catch (e) {
      alert('Errore: ' + (e instanceof Error ? e.message : 'Unknown'));
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

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
        <Link
          href={isSignedIn ? '/search' : '/sign-up'}
          className={btnSecondary}
        >
          {isSignedIn ? t.pricing.goSearch : t.pricing.startFree}
        </Link>
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
        <button
          type="button"
          onClick={() => handleCheckout('pro')}
          disabled={!!loading}
          className="w-full py-3 bg-[var(--tosky-primary)] text-white font-bolder rounded-[99px] hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading === 'pro' ? '…' : t.pricing.subscribe}
        </button>
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
        <button
          type="button"
          onClick={() => handleCheckout('business')}
          disabled={!!loading}
          className={btnSecondary}
        >
          {loading === 'business' ? '…' : t.pricing.subscribe}
        </button>
      </div>
    </div>
  );
}
