'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';

/** Shell full-screen stile “welcome” (sfondo scuro + mesh), forzando tema dark per il blocco auth. */
export function AuthPageShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();

  return (
    <div className="dark relative min-h-screen overflow-hidden bg-[#06060a] text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-25%,rgba(255,255,255,0.09),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_25%,rgba(130,130,150,0.14),transparent_52%),radial-gradient(ellipse_60%_45%_at_0%_75%,rgba(90,90,110,0.12),transparent_50%),radial-gradient(ellipse_50%_40%_at_70%_90%,rgba(237,53,58,0.06),transparent_45%)]"
        aria-hidden
      />
      <Link
        href="/"
        className="absolute left-4 top-4 z-20 inline-flex items-center gap-1 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100"
      >
        {t.auth.backHome}
      </Link>
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-20">
        {children}
      </div>
    </div>
  );
}
