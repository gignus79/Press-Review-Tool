'use client';

import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NewsletterButton } from '@/components/NewsletterButton';
import { FeedbackButton } from '@/components/FeedbackButton';
import { BrandLogo } from '@/components/BrandLogo';
import { useI18n } from '@/lib/i18n/context';

export function Header() {
  const { t } = useI18n();

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-[var(--tosky-border)] bg-[var(--tosky-header-bg)]/95 text-[var(--tosky-black)] shadow-[0_0_10px_0_rgba(0,0,0,0.08)] backdrop-blur-sm"
      style={{ fontFamily: 'var(--font-prompt), sans-serif' }}
    >
      <div className="mx-auto flex min-h-[4.25rem] max-w-6xl flex-col gap-2 px-3 py-2 sm:min-h-[4.75rem] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2 sm:px-4 sm:py-1">
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-3 text-[var(--tosky-dark)] dark:text-zinc-100"
          title={`${t.nav.brandLabel} · ${t.nav.productShort}`}
        >
          <BrandLogo className="h-14 w-[min(100%,240px)] shrink-0 sm:h-16 sm:w-[260px]" />
          <span className="flex min-w-0 max-w-[9rem] flex-col leading-tight sm:max-w-none">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tosky-muted)] sm:text-[11px]">
              {t.nav.productShort}
            </span>
          </span>
        </Link>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3 md:gap-4">
          <nav className="flex max-w-full items-center gap-3 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-4 sm:pb-0 [&::-webkit-scrollbar]:hidden">
            <Link
              href="/"
              className="text-sm font-medium text-[var(--tosky-base-text)] hover:text-[var(--tosky-primary)] transition-colors"
            >
              {t.nav.home}
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-[var(--tosky-base-text)] hover:text-[var(--tosky-primary)] transition-colors"
            >
              {t.nav.pricing}
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-[var(--tosky-base-text)] hover:text-[var(--tosky-primary)] transition-colors"
            >
              {t.nav.dashboard}
            </Link>
          </nav>
          <NewsletterButton className="hidden sm:inline-flex" />
          <FeedbackButton className="inline-flex" />
          <LanguageSwitcher />
          <ThemeToggle />
          <UserButton />
        </div>
      </div>
    </header>
  );
}
