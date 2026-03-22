'use client';

import Link from 'next/link';
import Image from 'next/image';
import { UserButton } from '@clerk/nextjs';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NewsletterButton } from '@/components/NewsletterButton';
import { FeedbackButton } from '@/components/FeedbackButton';
import { useI18n } from '@/lib/i18n/context';

const LOGO_URL = 'https://toskyrecords.com/wp-content/uploads/2022/08/Logo-Tosky-email-shop.png';

export function Header() {
  const { t } = useI18n();

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-[var(--tosky-border)] bg-[var(--tosky-header-bg)]/95 text-[var(--tosky-black)] shadow-[0_0_10px_0_rgba(0,0,0,0.08)] backdrop-blur-sm"
      style={{ fontFamily: 'var(--font-prompt), sans-serif' }}
    >
      <div className="mx-auto flex min-h-14 max-w-6xl flex-col gap-2 px-3 py-2 sm:h-16 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2 sm:px-4 sm:py-0">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src={LOGO_URL}
            alt="Tosky Records"
            width={280}
            height={80}
            className="h-9 w-auto sm:h-10 [filter:invert(1)] dark:[filter:invert(0)]"
            style={{ width: 'auto', height: 'auto', maxHeight: '2.5rem' }}
          />
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
          <FeedbackButton className="hidden sm:inline-flex" />
          <LanguageSwitcher />
          <ThemeToggle />
          <UserButton />
        </div>
      </div>
    </header>
  );
}
