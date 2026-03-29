'use client';

import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { useI18n } from '@/lib/i18n/context';

/** Logo mono + product + hint sopra Clerk Sign-in / Sign-up. */
export function AuthBranding() {
  const { t } = useI18n();

  return (
    <div className="mb-8 flex w-full max-w-[440px] flex-col items-center text-center">
      <Link
        href="/"
        className="flex flex-col items-center gap-3 rounded-xl px-2 py-1 text-zinc-100 transition-opacity hover:opacity-90"
      >
        <BrandLogo className="h-16 w-[min(100%,280px)] text-zinc-100 sm:h-[4.5rem] sm:w-[300px]" />
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
            {t.nav.productShort}
          </span>
          <span className="text-[10px] font-medium text-zinc-500">{t.nav.poweredBy}</span>
          <span className="mt-1 max-w-sm text-sm leading-snug text-zinc-400">
            {t.nav.brandHint}
          </span>
        </div>
      </Link>
    </div>
  );
}
