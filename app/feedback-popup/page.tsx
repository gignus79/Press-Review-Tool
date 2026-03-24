'use client';

import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function FeedbackPopupPage() {
  const { userId } = useAuth();
  const [from, setFrom] = useState('/');
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const qp = new URLSearchParams(window.location.search);
    setFrom(qp.get('from') || '/');
  }, []);

  const send = async () => {
    if (!msg.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: msg.trim(), page: from }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Feedback failed');
      }
      setMsg('');
      window.close();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Feedback failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--tosky-lighter-gray)] p-4 md:p-6">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-[var(--tosky-card-border)] bg-[var(--tosky-card)] p-5 shadow-2xl">
        <h1 className="text-xl font-bold text-[var(--tosky-dark)]">Feedback</h1>
        <p className="mt-2 text-sm text-[var(--tosky-text-gray)]">
          Dicci cosa migliorare nell&apos;app. Il feedback resta interno al progetto.
        </p>

        {!userId ? (
          <div className="mt-5 rounded-lg border border-[var(--tosky-border)] bg-[var(--tosky-white)] p-4">
            <p className="text-sm text-[var(--tosky-text-gray)]">Devi effettuare l&apos;accesso per inviare feedback.</p>
            <Link
              href={`/sign-in?redirect_url=${encodeURIComponent('/feedback-popup')}`}
              className="mt-3 inline-flex rounded-[99px] bg-[var(--tosky-primary)] px-4 py-2 text-sm font-semibold text-white"
            >
              Vai al login
            </Link>
          </div>
        ) : (
          <>
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              rows={7}
              placeholder="Scrivi qui il tuo feedback..."
              className="mt-4 w-full rounded-lg border border-[var(--tosky-border)] bg-[var(--tosky-white)] p-3 text-sm text-[var(--tosky-dark)] focus:border-[var(--tosky-primary)] focus:outline-none"
            />
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => void send()}
                disabled={sending || !msg.trim()}
                className="inline-flex items-center justify-center rounded-[99px] bg-[var(--tosky-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {sending ? 'Invio…' : 'Invia feedback'}
              </button>
              <button
                type="button"
                onClick={() => window.close()}
                className="inline-flex items-center justify-center rounded-[99px] border border-[var(--tosky-border)] px-4 py-2 text-sm font-semibold text-[var(--tosky-dark)] hover:bg-[var(--tosky-light-gray)]"
              >
                Chiudi
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
