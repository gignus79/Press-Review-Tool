'use client';

import { useAuth } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';

export function FeedbackButton({ className = '' }: { className?: string }) {
  const { userId } = useAuth();
  const { t } = useI18n();
  const pathname = usePathname();
  const signedIn = Boolean(userId);

  const openPopup = () => {
    if (!signedIn) {
      const next = encodeURIComponent(pathname || '/');
      window.location.href = `/sign-in?redirect_url=${next}`;
      return;
    }
    const width = 560;
    const height = 700;
    const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2));
    const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2));
    const popup = window.open(
      `/feedback-popup?from=${encodeURIComponent(pathname || '/')}`,
      'press_review_feedback',
      `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    if (!popup) {
      window.location.href = `/feedback-popup?from=${encodeURIComponent(pathname || '/')}`;
      return;
    }
    popup.focus();
  };

  return (
    <button
      type="button"
      onClick={openPopup}
      className={`inline-flex items-center gap-2 rounded-[99px] border border-[var(--tosky-border)] bg-[var(--tosky-card)] px-4 py-2 text-sm font-semibold text-[var(--tosky-dark)] hover:bg-[var(--tosky-light-gray)] transition-colors ${className}`}
    >
      {t.nav.feedback}
    </button>
  );
}
