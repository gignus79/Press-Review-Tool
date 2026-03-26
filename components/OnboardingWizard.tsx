'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useI18n } from '@/lib/i18n/context';
import { locales, type Locale } from '@/lib/i18n/dictionaries';

export function OnboardingWizard() {
  const { isLoaded, isSignedIn } = useUser();
  const { t, locale, setLocale } = useI18n();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [preferredLocale, setPreferredLocale] = useState<Locale>(locale);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await fetch('/api/account/plan', { credentials: 'include', cache: 'no-store' });
        const res = await fetch('/api/user/profile', { credentials: 'include', cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as {
          onboardingCompleted: boolean;
          displayName: string;
          preferredLocale?: Locale;
        };
        if (cancelled) return;
        if (data.preferredLocale && locales.includes(data.preferredLocale)) {
          setPreferredLocale(data.preferredLocale);
        }
        if (!data.onboardingCompleted) {
          setName(data.displayName || '');
          setShow(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || loading || !show) return null;

  async function patchProfile(body: {
    displayName?: string;
    preferredLocale?: Locale;
    completeOnboarding?: boolean;
  }) {
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.ok;
  }

  async function persistLocaleAndName() {
    await patchProfile({
      displayName: name.trim() || undefined,
      preferredLocale,
    });
    setLocale(preferredLocale);
  }

  async function complete(skipName: boolean) {
    setSaving(true);
    try {
      const ok = await patchProfile({
        displayName: skipName ? undefined : name.trim() || undefined,
        preferredLocale,
        completeOnboarding: true,
      });
      if (ok) {
        setLocale(preferredLocale);
        setShow(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function goToStep2() {
    setSaving(true);
    try {
      await persistLocaleAndName();
      setStep(2);
    } finally {
      setSaving(false);
    }
  }

  const btnPrimary =
    'inline-flex items-center justify-center rounded-[99px] bg-[var(--tosky-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50';
  const btnGhost =
    'inline-flex items-center justify-center rounded-[99px] border border-[var(--tosky-border)] px-4 py-2 text-sm font-semibold text-[var(--tosky-dark)] hover:bg-[var(--tosky-light-gray)] disabled:opacity-50 dark:hover:bg-[var(--tosky-lighter-gray)]';
  const linkBtn =
    'inline-flex items-center justify-center rounded-[99px] border border-[var(--tosky-secondary)] px-4 py-2 text-sm font-semibold text-[var(--tosky-secondary)] hover:bg-[var(--tosky-secondary)] hover:text-white';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="neon-wizard-panel w-full max-w-lg rounded-2xl border border-white/10 bg-[var(--tosky-card)]/95 p-6 shadow-[var(--neon-shadow-soft)] backdrop-blur-xl dark:bg-zinc-900/90">
        <div className="mb-3 inline-flex rounded-full border border-[var(--neon-border)] bg-white/5 px-3 py-1 text-xs font-semibold tracking-wide text-zinc-200">
          {t.onboarding.badge}
        </div>

        {step === 1 && (
          <>
            <h2 id="onboarding-title" className="text-xl font-bold text-[var(--tosky-dark)]">
              {t.onboarding.step1Title}
            </h2>
            <p className="mt-2 text-sm text-[var(--tosky-text-gray)]">{t.onboarding.step1Subtitle}</p>
            <label htmlFor="onboarding-name" className="mt-4 block text-sm font-semibold text-[var(--tosky-dark)]">
              {t.onboarding.nameLabel}
            </label>
            <input
              id="onboarding-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[var(--tosky-border)] bg-[var(--tosky-white)] px-3 py-2 text-[var(--tosky-dark)] dark:bg-[var(--tosky-lighter-gray)]"
              placeholder={t.onboarding.namePlaceholder}
              autoComplete="given-name"
              autoFocus
            />
            <label htmlFor="onboarding-locale" className="mt-4 block text-sm font-semibold text-[var(--tosky-dark)]">
              {t.onboarding.preferredLangLabel}
            </label>
            <p className="mt-1 text-xs text-[var(--tosky-text-gray)]">{t.onboarding.preferredLangHint}</p>
            <select
              id="onboarding-locale"
              value={preferredLocale}
              onChange={(e) => {
                const v = e.target.value as Locale;
                setPreferredLocale(v);
                setLocale(v);
              }}
              className="mt-2 w-full rounded-lg border border-[var(--tosky-border)] bg-[var(--tosky-card)] px-3 py-2 text-sm font-medium text-[var(--tosky-dark)]"
            >
              <option value="it">Italiano</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
            <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
              <button type="button" onClick={() => complete(true)} className={btnGhost} disabled={saving}>
                {t.onboarding.skip}
              </button>
              <button type="button" onClick={() => void goToStep2()} className={btnPrimary} disabled={saving}>
                {t.onboarding.next}
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-bold text-[var(--tosky-dark)]">{t.onboarding.step2Title}</h2>
            <p className="mt-2 text-sm text-[var(--tosky-text-gray)]">{t.onboarding.step2Intro}</p>
            <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-[var(--tosky-base-text)]">
              <li>{t.onboarding.step2Search}</li>
              <li>{t.onboarding.step2Pricing}</li>
              <li>{t.onboarding.step2Dashboard}</li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/search" className={linkBtn}>
                {t.onboarding.goSearch}
              </Link>
              <Link href="/pricing" className={linkBtn}>
                {t.onboarding.goPricing}
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
              <button type="button" onClick={() => setStep(1)} className={btnGhost} disabled={saving}>
                {t.onboarding.back}
              </button>
              <button type="button" onClick={() => complete(false)} className={btnPrimary} disabled={saving}>
                {t.onboarding.finish}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
