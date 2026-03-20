'use client';

import { clsx } from 'clsx';
import { useEffect, useMemo, useState } from 'react';

const SIZE_MAP = {
  sm: { box: 48, orbitR: 18, dot: 6 },
  md: { box: 72, orbitR: 28, dot: 8 },
  lg: { box: 96, orbitR: 38, dot: 10 },
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
 * Loader glass + orbita CSS; testo con contrasto in light/dark; messaggi opzionali a rotazione.
 */
export function GlassLoadingIndicator({
  message,
  messages,
  size = 'md',
  className,
  rotateIntervalMs = 2800,
}: GlassLoadingIndicatorProps) {
  const { box, orbitR, dot } = SIZE_MAP[size];
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
        className="relative shrink-0"
        style={{ width: box, height: box }}
        aria-hidden
      >
        <div
          className="absolute rounded-full border-2 border-black/10 dark:border-white/15"
          style={{
            inset: Math.max(0, (box - (orbitR + dot) * 2) / 2),
            opacity: 0.9,
            animation: 'prt-orbit-pulse 2.8s ease-in-out infinite',
          }}
        />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              animation: 'prt-orbit-spin 2.4s linear infinite',
              animationDelay: `${-i * (2.4 / 3)}s`,
            }}
          >
            <span
              className="absolute left-1/2 rounded-full shadow-md"
              style={{
                top: `calc(50% - ${orbitR}px - ${dot / 2}px)`,
                width: dot,
                height: dot,
                marginLeft: -(dot / 2),
                background:
                  i === 0
                    ? 'linear-gradient(135deg, #ff006e, #fb5607)'
                    : i === 1
                      ? 'linear-gradient(135deg, #8338ec, #3a86ff)'
                      : 'linear-gradient(135deg, #06ffa5, #ffbe0b)',
                animation: 'prt-orbit-pulse 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.18}s`,
              }}
            />
          </div>
        ))}
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
    </div>
  );
}
