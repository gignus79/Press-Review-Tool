'use client';

import { useI18n, locales, type Locale } from '@/lib/i18n/context';

const labels: Record<Locale, string> = { it: 'IT', en: 'EN', es: 'ES', fr: 'FR' };

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="flex items-center gap-1 rounded-full border border-[var(--tosky-border)] bg-[var(--tosky-white)] p-0.5">
      <span className="sr-only">{t.lang.label}</span>
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          className={`rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${
            locale === l
              ? 'bg-[var(--tosky-primary)] text-white'
              : 'text-[var(--tosky-base-text)] hover:bg-[var(--tosky-light-gray)]'
          }`}
        >
          {labels[l]}
        </button>
      ))}
    </div>
  );
}
