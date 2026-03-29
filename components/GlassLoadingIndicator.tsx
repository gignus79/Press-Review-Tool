'use client';

import { clsx } from 'clsx';
import { useEffect, useMemo, useState } from 'react';

/** box = contenitore min-width; spinner = diametro anello brand */
const SIZE_MAP = {
  sm: { box: 48, spinner: 30 },
  md: { box: 72, spinner: 44 },
  lg: { box: 96, spinner: 58 },
} as const;

export type GlassLoadingSize = keyof typeof SIZE_MAP;

export type GlassLoadingIndicatorProps = {
  /** Messaggio singolo (se non usi `messages`) */
  message?: string;
  /** Messaggi che ruotano in loop (stato del sistema) */
  messages?: string[];
  size?: GlassLoadingSize;
  className?: string;
  /** ms tra un messaggio e l’altro */
  rotateIntervalMs?: number;
  /** Annulla operazione in corso (es. fetch ricerca) */
  onCancel?: () => void;
  cancelLabel?: string;
};

function useRotatingMessage(messages: string[], intervalMs: number) {
  const [i, setI] = useState(0);
  const safe = useMemo(() => (messages.length ? messages : ['…']), [messages]);
  const signature = useMemo(() => safe.join('\n'), [safe]);

  useEffect(() => {
    queueMicrotask(() => setI(0));
  }, [signature]);

  useEffect(() => {
    if (safe.length <= 1) return;
    const tick = window.setInterval(() => {
      setI((n) => (n + 1) % safe.length);
    }, intervalMs);
    return () => window.clearInterval(tick);
  }, [safe, safe.length, intervalMs, signature]);

  return safe[i] ?? safe[0];
}

/**
 * Loader glass + anello rotante (brand primary/secondary); messaggi opzionali a rotazione.
 */
export function GlassLoadingIndicator({
  message,
  messages,
  size = 'md',
  className,
  rotateIntervalMs = 2800,
  onCancel,
  cancelLabel,
}: GlassLoadingIndicatorProps) {
  const { box, spinner } = SIZE_MAP[size];
  const list = messages?.length ? messages : message ? [message] : [];
  const rotating = useRotatingMessage(list, rotateIntervalMs);
  const label = rotating || 'Loading content, please wait.';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className={clsx(
        'flex flex-col items-center justify-center gap-5 rounded-3xl px-6 py-8 sm:px-10 sm:py-9',
        'border border-black/8 bg-white/92 text-neutral-900 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]',
        'backdrop-blur-2xl dark:border-white/12 dark:bg-zinc-950/88 dark:text-zinc-50 dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.65)]',
        'animate-[prt-glass-fade-in_0.45s_ease-out_forwards]',
        className
      )}
      style={{ minWidth: `min(100%, ${box + 120}px)` }}
    >
      <span className="sr-only">{label}</span>

      <div
        className="relative flex shrink-0 items-center justify-center"
        style={{ width: box, height: box }}
        aria-hidden
      >
        <div
          className="rounded-full"
          style={{
            width: spinner,
            height: spinner,
            borderWidth: 3,
            borderStyle: 'solid',
            borderColor: 'var(--tosky-border)',
            borderTopColor: 'var(--tosky-primary)',
            borderRightColor: 'var(--tosky-secondary)',
            boxShadow:
              '0 0 0 1px color-mix(in srgb, var(--tosky-primary) 12%, transparent), 0 0 24px color-mix(in srgb, var(--tosky-primary) 14%, transparent)',
            animation: 'prt-orbit-spin 0.88s linear infinite',
          }}
        />
      </div>

      {list.length > 0 ? (
        <div className="min-h-[3rem] w-full max-w-[min(100%,320px)] px-1">
          <p
            key={rotating}
            className={clsx(
              'text-center text-sm font-semibold leading-snug tracking-tight',
              'text-neutral-900 dark:text-zinc-50',
              'animate-[prt-glass-fade-in_0.55s_ease-out_forwards]'
            )}
          >
            {rotating}
          </p>
        </div>
      ) : null}

      {onCancel && cancelLabel ? (
        <button
          type="button"
          onClick={onCancel}
          className={clsx(
            'mt-1 w-full max-w-[min(100%,280px)] rounded-[99px] border border-neutral-300/80 px-4 py-2.5',
            'text-sm font-semibold text-neutral-800 transition-colors',
            'hover:bg-neutral-100 dark:border-white/20 dark:text-zinc-100 dark:hover:bg-white/10'
          )}
        >
          {cancelLabel}
        </button>
      ) : null}
    </div>
  );
}
