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
        <div className="mx-auto mb-12 max-w-4xl text-center">
          <h1 className="mb-4 text-3xl font-bold text-[var(--tosky-dark)]">
            {t.pricing.title}
          </h1>
          <p className="text-[var(--tosky-text-gray)]">{t.pricing.subtitle}</p>
          <p className="mx-auto mt-8 max-w-3xl text-left text-sm leading-relaxed text-[var(--tosky-base-text)]">
            {t.pricing.intro}
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
