'use client';

import { SignIn } from '@clerk/nextjs';
import { useMemo } from 'react';
import { buildClerkAppearance } from '@/lib/clerk-appearance';

/** Pagina auth dedicata: sempre tema scuro (allineato al layout Resend-like). */
export function ClerkSignInView() {
  const appearance = useMemo(() => buildClerkAppearance(true), []);

  return (
    <div className="w-full max-w-[440px]">
      <SignIn
        forceRedirectUrl="/dashboard"
        fallbackRedirectUrl="/dashboard"
        appearance={appearance}
      />
    </div>
  );
}
