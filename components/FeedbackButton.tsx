'use client';

import { useAuth } from '@clerk/nextjs';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';

export function FeedbackButton({ className = '' }: { className?: string }) {
  const { userId } = useAuth();
  const { t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const signedIn = Boolean(userId);

  const send = async () => {
    if (!signedIn) {
      const next = encodeURIComponent(pathname || '/');
      window.location.href = `/sign-in?redirect_url=${next}`;
      return;
    }
    if (!msg.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: msg.trim(), page: pathname || '/' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Feedback failed');
      }
      setMsg('');
      setOpen(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Feedback failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 rounded-[99px] border border-[var(--tosky-border)] bg-[var(--tosky-card)] px-4 py-2 text-sm font-semibold text-[var(--tosky-dark)] hover:bg-[var(--tosky-light-gray)] transition-colors ${className}`}
      >
        {t.nav.feedback}
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/45 p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:flex sm:items-center sm:justify-center">
          <div className="mx-auto mt-14 w-full max-w-lg rounded-2xl border border-[var(--tosky-card-border)] bg-[var(--tosky-card)] p-5 shadow-2xl sm:mt-0 max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <h2 className="text-lg font-bold text-[var(--tosky-dark)]">Feedback</h2>
            <p className="mt-1 text-sm text-[var(--tosky-text-gray)]">
              {signedIn
                ? "Dicci cosa migliorare nell'app. Il feedback resta interno al progetto."
                : 'Accedi per inviare feedback interno sul prodotto.'}
            </p>
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              rows={5}
              placeholder="Scrivi qui il tuo feedback..."
              className="mt-3 w-full rounded-lg border border-[var(--tosky-border)] bg-[var(--tosky-white)] p-3 text-sm text-[var(--tosky-dark)] focus:border-[var(--tosky-primary)] focus:outline-none"
            />
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                disabled={sending || !msg.trim()}
                onClick={() => void send()}
                className="inline-flex items-center justify-center rounded-[99px] bg-[var(--tosky-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {sending ? 'Invio…' : signedIn ? 'Invia feedback' : 'Accedi e invia'}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-[99px] border border-[var(--tosky-border)] px-4 py-2 text-sm font-semibold text-[var(--tosky-dark)] hover:bg-[var(--tosky-light-gray)]"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
