'use client';

import { clsx } from 'clsx';
import { TOSKY_NEWSLETTER_URL } from '@/lib/constants';
import { IconMail } from '@/components/icons';
import { useI18n } from '@/lib/i18n/context';

export function NewsletterButton({ className = '' }: { className?: string }) {
  const { t } = useI18n();

  return (
    <a
      href={TOSKY_NEWSLETTER_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        'inline-flex items-center gap-2 rounded-[99px] border-2 border-zinc-400 px-4 py-2 text-sm font-semibold',
        'text-zinc-900 transition-colors dark:border-zinc-500 dark:text-zinc-100',
        'hover:border-[var(--tosky-primary)] hover:bg-[var(--tosky-primary)] hover:text-white',
        'dark:hover:border-[var(--tosky-primary)] dark:hover:bg-[var(--tosky-primary)] dark:hover:text-white',
        'active:scale-[0.98]',
        className
      )}
    >
      <span className="[&_svg]:stroke-current">
        <IconMail />
      </span>
      {t.nav.join}
    </a>
  );
}
