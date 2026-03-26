'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Header } from '@/components/Header';
import { IconSearch, IconChart, IconDocument, IconChevronRight } from '@/components/icons';
import { useI18n } from '@/lib/i18n/context';

/** Sala stampa / monitoraggio media — necessità di copertura e controllo (Unsplash). */
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=85&w=2400&auto=format&fit=crop';

export default function LandingPage() {
  const { t } = useI18n();
  const { isSignedIn } = useUser();
  const ctaHref = isSignedIn ? '/search' : '/sign-up';

  return (
    <div className="flex min-h-screen flex-col bg-[var(--tosky-white)]">
      <Header />
      <main className="flex-1">
        <section className="relative min-h-[min(88vh,920px)] overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={HERO_IMAGE}
              alt=""
              fill
              className="object-cover object-center"
              priority
              sizes="100vw"
            />
          </div>
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/82 via-black/58 to-black/78"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_20%_15%,rgba(59,130,246,0.12),transparent_52%),radial-gradient(ellipse_65%_50%_at_85%_80%,rgba(34,211,238,0.08),transparent_48%)]"
            aria-hidden
          />

          <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-16 md:pt-24">
            <div className="neon-hero-badge mb-8 inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-zinc-200">
              {t.onboarding.badge}
            </div>

            <div className="grid items-center gap-12 md:grid-cols-2 md:gap-10">
              <div>
                <h1 className="text-4xl font-bold leading-tight text-white drop-shadow-sm md:text-5xl lg:text-6xl">
                  {t.landing.title}
                </h1>
                <p className="mt-5 text-lg leading-relaxed text-zinc-300 md:text-xl">
                  {t.landing.subtitle}
                </p>
                <p className="mt-3 text-base font-semibold text-zinc-200 md:text-lg">
                  {t.nav.brandHint}
                </p>
                <p className="mt-2 text-sm text-zinc-400">{t.landing.heroTagline}</p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href={ctaHref}
                    className="inline-flex items-center justify-center rounded-full bg-[var(--tosky-primary)] px-8 py-4 text-sm font-bolder text-white shadow-[0_12px_32px_rgba(237,53,58,0.35)] transition-transform hover:-translate-y-0.5 hover:opacity-95"
                  >
                    {isSignedIn ? t.pricing.goSearch : t.landing.cta}
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-bolder text-white shadow-[0_0_24px_rgba(59,130,246,0.12)] backdrop-blur-md transition-colors hover:bg-white/12"
                  >
                    {t.landing.plans}
                  </Link>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {t.landing.heroBullets.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-xs font-medium text-zinc-200 backdrop-blur-sm"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tosky-primary)]" aria-hidden />
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="neon-glass-card rounded-2xl p-6">
                <p className="text-xs font-semibold tracking-[0.2em] text-zinc-300">
                  {t.landing.liveModulesTitle}
                </p>
                <ul className="mt-4 space-y-3 text-sm text-zinc-100">
                  {t.landing.liveModuleLines.map((line) => (
                    <li
                      key={line}
                      className="rounded-lg border border-white/10 bg-black/20 p-3"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-sm text-zinc-400 sm:flex-row sm:items-center">
              <p className="font-semibold uppercase tracking-[0.2em] text-white">
                {t.landing.footerBrand}
              </p>
              <p className="text-zinc-500">{t.landing.footerProduct}</p>
            </div>
          </div>
        </section>

        <section className="bg-[var(--tosky-light-gray)] px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-bold text-[var(--tosky-dark)]">
              {t.landing.how}
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-lg border border-[var(--tosky-card-border)] bg-[var(--tosky-card)] p-6 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                <div className="mb-2 text-[var(--tosky-secondary)]">
                  <IconSearch className="h-8 w-8" width={32} height={32} />
                </div>
                <h3 className="mb-2 font-bold text-[var(--tosky-dark)]">{t.landing.searchTitle}</h3>
                <p className="text-sm text-[var(--tosky-text-gray)]">{t.landing.searchDesc}</p>
              </div>
              <div className="rounded-lg border border-[var(--tosky-card-border)] bg-[var(--tosky-card)] p-6 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                <div className="mb-2 text-[var(--tosky-secondary)]">
                  <IconChart className="h-8 w-8" width={32} height={32} />
                </div>
                <h3 className="mb-2 font-bold text-[var(--tosky-dark)]">{t.landing.analysisTitle}</h3>
                <p className="text-sm text-[var(--tosky-text-gray)]">{t.landing.analysisDesc}</p>
              </div>
              <div className="rounded-lg border border-[var(--tosky-card-border)] bg-[var(--tosky-card)] p-6 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                <div className="mb-2 text-[var(--tosky-secondary)]">
                  <IconDocument className="h-8 w-8" width={32} height={32} />
                </div>
                <h3 className="mb-2 font-bold text-[var(--tosky-dark)]">{t.landing.exportTitle}</h3>
                <p className="text-sm text-[var(--tosky-text-gray)]">{t.landing.exportDesc}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 text-center">
          <div className="mx-auto mb-8 max-w-3xl rounded-2xl border border-[var(--tosky-card-border)] bg-[var(--tosky-card)] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
            <p className="text-sm leading-relaxed text-[var(--tosky-text-gray)]">{t.landing.suiteNote}</p>
          </div>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1 font-semibold text-[var(--tosky-primary)] hover:underline"
          >
            {t.landing.plans}
            <IconChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>
      </main>
      <footer className="border-t border-[var(--tosky-border)] py-8 text-center text-sm text-[var(--tosky-text-gray)]">
        <p>{t.footer}</p>
      </footer>
    </div>
  );
}
