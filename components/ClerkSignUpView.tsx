'use client';

import { SignUp } from '@clerk/nextjs';
import { useTheme } from 'next-themes';
import { useMemo } from 'react';
import { buildClerkAppearance } from '@/lib/clerk-appearance';

export function ClerkSignUpView() {
  const { resolvedTheme } = useTheme();
  const appearance = useMemo(() => {
    const isDark = resolvedTheme !== 'light';
    return buildClerkAppearance(isDark);
  }, [resolvedTheme]);

  return (
    <div className="w-full">
      <SignUp
        forceRedirectUrl="/dashboard"
        fallbackRedirectUrl="/dashboard"
        appearance={appearance}
      />
    </div>
  );
}
