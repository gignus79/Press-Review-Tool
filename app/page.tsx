'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Header } from '@/components/Header';
import { IconSearch, IconChart, IconDocument, IconChevronRight } from '@/components/icons';
import { useI18n } from '@/lib/i18n/context';

export default function LandingPage() {
  const { t } = useI18n();
  const { isSignedIn } = useUser();
  const ctaHref = isSignedIn ? '/search' : '/sign-up';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-20 px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--tosky-dark)] mb-4">
            {t.landing.title}
          </h1>
          <p className="text-xl text-[var(--tosky-text-gray)] max-w-2xl mx-auto mb-8">
            {t.landing.subtitle}
          </p>
          <Link
            href={ctaHref}
            className="inline-block px-8 py-4 bg-[var(--tosky-primary)] text-white font-bolder rounded-[99px] hover:bg-[var(--tosky-mid-gray)] transition-colors shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
          >
            {isSignedIn ? t.pricing.goSearch : t.landing.cta}
          </Link>
        </section>

        <section className="py-16 px-4 bg-[var(--tosky-light-gray)]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-[var(--tosky-dark)] mb-8 text-center">
              {t.landing.how}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-[var(--tosky-card)] p-6 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)] border border-[var(--tosky-card-border)]">
                <div className="mb-2 text-[var(--tosky-secondary)]">
                  <IconSearch className="h-8 w-8" width={32} height={32} />
                </div>
                <h3 className="font-bold text-[var(--tosky-dark)] mb-2">{t.landing.searchTitle}</h3>
                <p className="text-sm text-[var(--tosky-text-gray)]">{t.landing.searchDesc}</p>
              </div>
              <div className="bg-[var(--tosky-card)] p-6 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)] border border-[var(--tosky-card-border)]">
                <div className="mb-2 text-[var(--tosky-secondary)]">
                  <IconChart className="h-8 w-8" width={32} height={32} />
                </div>
                <h3 className="font-bold text-[var(--tosky-dark)] mb-2">{t.landing.analysisTitle}</h3>
                <p className="text-sm text-[var(--tosky-text-gray)]">{t.landing.analysisDesc}</p>
              </div>
              <div className="bg-[var(--tosky-card)] p-6 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)] border border-[var(--tosky-card-border)]">
                <div className="mb-2 text-[var(--tosky-secondary)]">
                  <IconDocument className="h-8 w-8" width={32} height={32} />
                </div>
                <h3 className="font-bold text-[var(--tosky-dark)] mb-2">{t.landing.exportTitle}</h3>
                <p className="text-sm text-[var(--tosky-text-gray)]">{t.landing.exportDesc}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1 text-[var(--tosky-primary)] font-semibold hover:underline"
          >
            {t.landing.plans}
            <IconChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>
      </main>
      <footer className="py-8 border-t border-[var(--tosky-border)] text-center text-sm text-[var(--tosky-text-gray)]">
        <p>{t.footer}</p>
      </footer>
    </div>
  );
}
