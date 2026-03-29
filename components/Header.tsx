'use client';

import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { useTheme } from 'next-themes';
import { useMemo } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NewsletterButton } from '@/components/NewsletterButton';
import { FeedbackButton } from '@/components/FeedbackButton';
import { BrandLogo } from '@/components/BrandLogo';
import { useI18n } from '@/lib/i18n/context';
import { buildUserButtonAppearance } from '@/lib/clerk-appearance';

export function Header() {
  const { t } = useI18n();
  const { resolvedTheme } = useTheme();
  const userButtonAppearance = useMemo(
    () => buildUserButtonAppearance(resolvedTheme !== 'light'),
    [resolvedTheme]
  );

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-zinc-200/90 bg-zinc-100/95 text-zinc-900 shadow-sm backdrop-blur-sm dark:border-zinc-700/90 dark:bg-zinc-900/95 dark:text-zinc-100 dark:shadow-[0_0_12px_rgba(0,0,0,0.35)]"
      style={{ fontFamily: 'var(--font-prompt), sans-serif' }}
    >
      <div className="mx-auto flex min-h-[4.25rem] max-w-6xl flex-col gap-2 px-3 py-2 sm:min-h-[4.75rem] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2 sm:px-4 sm:py-1">
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-3 text-zinc-900 dark:text-zinc-100"
          title={`${t.nav.brandLabel} · ${t.nav.productShort}`}
        >
          <BrandLogo className="h-14 w-[min(100%,240px)] shrink-0 text-zinc-900 dark:text-zinc-100 sm:h-16 sm:w-[260px]" />
          <span className="flex min-w-0 max-w-[11rem] flex-col leading-tight sm:max-w-none">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600 dark:text-zinc-400 sm:text-[11px]">
              {t.nav.productShort}
            </span>
            <span className="text-[9px] font-medium leading-tight text-zinc-500 dark:text-zinc-500">
              {t.nav.poweredBy}
            </span>
          </span>
        </Link>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3 md:gap-4">
          <nav className="flex max-w-full items-center gap-3 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-4 sm:pb-0 [&::-webkit-scrollbar]:hidden">
            <Link
              href="/"
              className="text-sm font-medium text-zinc-800 hover:text-[var(--tosky-primary)] dark:text-zinc-200 dark:hover:text-[var(--tosky-primary)] transition-colors"
            >
              {t.nav.home}
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-zinc-800 hover:text-[var(--tosky-primary)] dark:text-zinc-200 dark:hover:text-[var(--tosky-primary)] transition-colors"
            >
              {t.nav.pricing}
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-zinc-800 hover:text-[var(--tosky-primary)] dark:text-zinc-200 dark:hover:text-[var(--tosky-primary)] transition-colors"
            >
              {t.nav.dashboard}
            </Link>
          </nav>
          <NewsletterButton className="hidden sm:inline-flex" />
          <FeedbackButton className="inline-flex" />
          <LanguageSwitcher />
          <ThemeToggle />
          <UserButton appearance={userButtonAppearance} />
        </div>
      </div>
    </header>
  );
}
