'use client';

import { ThemeProvider } from 'next-themes';
import { I18nProvider } from '@/lib/i18n/context';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <I18nProvider>{children}</I18nProvider>
    </ThemeProvider>
  );
}
