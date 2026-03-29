'use client';

import { SignUp } from '@clerk/nextjs';
import { useMemo } from 'react';
import { buildClerkAppearance } from '@/lib/clerk-appearance';

export function ClerkSignUpView() {
  const appearance = useMemo(() => buildClerkAppearance(true), []);

  return (
    <div className="w-full max-w-[440px]">
      <SignUp
        forceRedirectUrl="/dashboard"
        fallbackRedirectUrl="/dashboard"
        appearance={appearance}
      />
    </div>
  );
}
