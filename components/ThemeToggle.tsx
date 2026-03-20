'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { IconMoon, IconSun } from '@/components/icons';
import { useI18n } from '@/lib/i18n/context';

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  // next-themes: avoid SSR/client mismatch; mount flag is the documented pattern
  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  if (!mounted) {
    return (
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--tosky-border)] bg-[var(--tosky-white)]" />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--tosky-border)] bg-[var(--tosky-white)] text-[var(--tosky-dark)] hover:bg-[var(--tosky-light-gray)] transition-colors"
      title={isDark ? t.theme.light : t.theme.dark}
      aria-label={isDark ? t.theme.light : t.theme.dark}
    >
      {isDark ? <IconSun /> : <IconMoon />}
    </button>
  );
}
