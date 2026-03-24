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
    <div className="min-h-screen flex flex-col bg-[var(--tosky-white)]">
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden px-4 pb-16 pt-20 md:pt-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(237,53,58,0.18),transparent_38%),radial-gradient(circle_at_85%_25%,rgba(0,119,132,0.22),transparent_40%)]" />
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 inline-flex items-center rounded-full border border-[var(--tosky-card-border)] bg-white/80 px-4 py-1 text-xs font-semibold tracking-wide text-[var(--tosky-secondary)] shadow-sm backdrop-blur">
              LABELTOOLS SUITE
            </div>
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div>
                <h1 className="text-4xl font-bold leading-tight text-[var(--tosky-dark)] md:text-6xl">
                  {t.landing.title}
                </h1>
                <p className="mt-5 text-lg leading-relaxed text-[var(--tosky-text-gray)] md:text-xl">
                  {t.landing.subtitle}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href={ctaHref}
                    className="inline-flex items-center justify-center rounded-[99px] bg-[var(--tosky-primary)] px-8 py-4 text-sm font-bolder text-white shadow-[0_10px_25px_rgba(237,53,58,0.28)] transition-transform hover:-translate-y-0.5 hover:opacity-95"
                  >
                    {isSignedIn ? t.pricing.goSearch : t.landing.cta}
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center rounded-[99px] border border-[var(--tosky-secondary)] bg-white px-8 py-4 text-sm font-bolder text-[var(--tosky-secondary)] transition-colors hover:bg-[var(--tosky-secondary)] hover:text-white"
                  >
                    {t.landing.plans}
                  </Link>
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--tosky-card-border)] bg-[var(--tosky-card)] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
                <p className="text-xs font-semibold tracking-wide text-[var(--tosky-secondary)]">LIVE MODULES</p>
                <ul className="mt-4 space-y-3 text-sm text-[var(--tosky-base-text)]">
                  <li className="rounded-lg bg-[var(--tosky-lighter-gray)] p-3">Real-time music press discovery</li>
                  <li className="rounded-lg bg-[var(--tosky-lighter-gray)] p-3">AI categorization by source type</li>
                  <li className="rounded-lg bg-[var(--tosky-lighter-gray)] p-3">Professional export workflows (PDF/XLSX/CSV/JSON)</li>
                </ul>
              </div>
            </div>
          </div>
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
          <div className="mx-auto mb-8 max-w-3xl rounded-2xl border border-[var(--tosky-card-border)] bg-[var(--tosky-card)] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
            <p className="text-sm leading-relaxed text-[var(--tosky-text-gray)]">
              Press Review Tool is one module of the LabelTools ecosystem for artists, labels and music
              teams, with progressive integration of additional professional tools.
            </p>
          </div>
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
