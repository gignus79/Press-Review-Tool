'use client';

import { useState } from 'react';

type ManageSubscriptionButtonProps = {
  label: string;
  className?: string;
};

export function ManageSubscriptionButton({ label, className = '' }: ManageSubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);

  const openPortal = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        credentials: 'include',
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Unable to open subscription management');
      }
      window.location.href = data.url;
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Unable to open subscription management');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void openPortal()}
      disabled={loading}
      className={className}
    >
      {loading ? '…' : label}
    </button>
  );
}
