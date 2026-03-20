'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useState } from 'react';

export function PricingCards() {
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

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {/* Free */}
      <div className="bg-white p-8 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)] border border-[var(--tosky-border)]">
        <h3 className="text-xl font-bold text-[var(--tosky-dark)] mb-2">Free</h3>
        <p className="text-3xl font-bold text-[var(--tosky-dark)] mb-4">€0</p>
        <ul className="space-y-2 text-sm text-[var(--tosky-text-gray)] mb-6">
          <li>5 ricerche/mese</li>
          <li>Export PDF, JSON</li>
          <li>Risultati base</li>
        </ul>
        <Link
          href={isSignedIn ? '/search' : '/sign-up'}
          className="block w-full py-3 text-center bg-[var(--tosky-dark)] text-white font-bolder rounded-[99px] hover:bg-[var(--tosky-mid-gray)] transition-colors"
        >
          {isSignedIn ? 'Vai alla ricerca' : 'Inizia gratis'}
        </Link>
      </div>

      {/* Pro - Consigliato */}
      <div className="bg-white p-8 rounded-lg shadow-[1px_1px_15px_rgba(0,0,0,0.15)] border-2 border-[var(--tosky-primary)] relative">
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--tosky-primary)] text-white text-xs font-semibold rounded-[99px]">
          Consigliato
        </span>
        <h3 className="text-xl font-bold text-[var(--tosky-dark)] mb-2">Pro</h3>
        <p className="text-3xl font-bold text-[var(--tosky-dark)] mb-4">
          €7,99<span className="text-sm font-normal text-[var(--tosky-muted)]">/mese</span>
        </p>
        <ul className="space-y-2 text-sm text-[var(--tosky-text-gray)] mb-6">
          <li>50 ricerche/mese</li>
          <li>Export PDF, Excel, JSON, CSV</li>
          <li>Storico ricerche</li>
        </ul>
        <button
          onClick={() => handleCheckout('pro')}
          disabled={!!loading}
          className="w-full py-3 bg-[var(--tosky-primary)] text-white font-bolder rounded-[99px] hover:bg-[var(--tosky-mid-gray)] transition-colors disabled:opacity-50"
        >
          {loading === 'pro' ? '...' : 'Sottoscrivi'}
        </button>
      </div>

      {/* Business */}
      <div className="bg-white p-8 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)] border border-[var(--tosky-border)]">
        <h3 className="text-xl font-bold text-[var(--tosky-dark)] mb-2">Business</h3>
        <p className="text-3xl font-bold text-[var(--tosky-dark)] mb-4">
          €19,99<span className="text-sm font-normal text-[var(--tosky-muted)]">/mese</span>
        </p>
        <ul className="space-y-2 text-sm text-[var(--tosky-text-gray)] mb-6">
          <li>200 ricerche/mese</li>
          <li>Tutti gli export</li>
          <li>Storico, API access</li>
          <li>Priorità e supporto</li>
        </ul>
        <button
          onClick={() => handleCheckout('business')}
          disabled={!!loading}
          className="w-full py-3 bg-[var(--tosky-dark)] text-white font-bolder rounded-[99px] hover:bg-[var(--tosky-mid-gray)] transition-colors disabled:opacity-50"
        >
          {loading === 'business' ? '...' : 'Sottoscrivi'}
        </button>
      </div>
    </div>
  );
}
