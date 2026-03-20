'use client';

import { Header } from '@/components/Header';
import { PricingCards } from '@/components/PricingCards';
import { useI18n } from '@/lib/i18n/context';

export default function PricingPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--tosky-white)]">
      <Header />
      <main className="flex-1 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-3xl font-bold text-[var(--tosky-dark)] mb-4">
            {t.pricing.title}
          </h1>
          <p className="text-[var(--tosky-text-gray)]">
            {t.pricing.subtitle}
          </p>
        </div>
        <PricingCards />
      </main>
      <footer className="py-8 border-t border-[var(--tosky-border)] text-center text-sm text-[var(--tosky-text-gray)]">
        <p>{t.footer}</p>
      </footer>
    </div>
  );
}
