'use client';

import { clsx } from 'clsx';
import { TOSKY_NEWSLETTER_URL } from '@/lib/constants';
import { IconMail } from '@/components/icons';
import { useI18n } from '@/lib/i18n/context';

/** Bordo spettrale: solo il contorno (interno solido tema). */
const SPECTRUM =
  'linear-gradient(105deg, #ff006e 0%, #fb5607 16%, #ffbe0b 32%, #06ffa5 48%, #3a86ff 64%, #8338ec 82%, #ff006e 100%)';

export function NewsletterButton({ className = '' }: { className?: string }) {
  const { t } = useI18n();

  return (
    <span
      className={clsx('inline-flex rounded-[99px] p-[2px] shadow-sm', className)}
      style={{ background: SPECTRUM }}
    >
      <a
        href={TOSKY_NEWSLETTER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={clsx(
          'inline-flex items-center gap-2 rounded-[99px] px-4 py-2 text-sm font-semibold',
          'bg-[var(--tosky-header-bg)] text-[var(--tosky-dark)] transition',
          'hover:bg-[var(--tosky-light-gray)] active:scale-[0.98]',
          'dark:bg-[var(--tosky-card)] dark:hover:bg-[var(--tosky-lighter-gray)]'
        )}
      >
        <span className="text-[var(--tosky-secondary)] [&_svg]:stroke-[var(--tosky-secondary)]">
          <IconMail />
        </span>
        {t.nav.newsletter}
      </a>
    </span>
  );
}
