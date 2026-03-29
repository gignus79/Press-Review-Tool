import type { Tier } from '@/lib/tier-utils';

/**
 * Email con privilegi Pro da env (senza Stripe).
 * Formato: `WHITELISTED_EMAILS=a@x.com,b@y.com` — virgola, punto e virgola o newline.
 */
function parseWhitelistedEmails(): Set<string> {
  const raw = process.env.WHITELISTED_EMAILS?.trim() ?? '';
  if (!raw) return new Set();
  const parts = raw.split(/[,;\n\r]+/);
  const set = new Set<string>();
  for (const p of parts) {
    const e = p.trim().toLowerCase();
    if (e) set.add(e);
  }
  return set;
}

let cached: Set<string> | null = null;

function whitelistSet(): Set<string> {
  if (!cached) cached = parseWhitelistedEmails();
  return cached;
}

export function isEmailWhitelisted(email: string | null | undefined): boolean {
  const e = email?.trim().toLowerCase() ?? '';
  if (!e || !e.includes('@')) return false;
  return whitelistSet().has(e);
}

/**
 * Tier usato per limiti e UI: utenti in whitelist ottengono Pro finché il DB non è già Business.
 */
export function resolveEffectiveTier(dbTier: Tier, email: string | null | undefined): Tier {
  if (dbTier === 'business') return 'business';
  if (dbTier === 'pro') return 'pro';
  if (isEmailWhitelisted(email)) return 'pro';
  return 'free';
}
