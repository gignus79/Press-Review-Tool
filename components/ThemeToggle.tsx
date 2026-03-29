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
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-800" />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100 transition-colors dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
      title={isDark ? t.theme.light : t.theme.dark}
      aria-label={isDark ? t.theme.light : t.theme.dark}
    >
      {isDark ? <IconSun /> : <IconMoon />}
    </button>
  );
}
