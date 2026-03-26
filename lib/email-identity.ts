/**
 * Collapses common mailbox tricks (Gmail +aliases, dots) so one person
 * with multiple addresses maps to one key for abuse checks.
 */
export function identityKeyFromEmail(raw: string | null | undefined): string {
  const trimmed = (raw ?? '').trim().toLowerCase();
  if (!trimmed) return '';
  const at = trimmed.lastIndexOf('@');
  if (at <= 0) return trimmed;
  let local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const isGmail = domain === 'gmail.com' || domain === 'googlemail.com';
  if (isGmail) {
    const plus = local.indexOf('+');
    if (plus >= 0) local = local.slice(0, plus);
    local = local.replace(/\./g, '');
  }
  return `${local}@${domain}`;
}

/** Stable key: normalized email when present, else Clerk user id. */
export function freeTierAbuseIdentityKey(
  email: string | null | undefined,
  clerkUserId: string
): string {
  const fromEmail = identityKeyFromEmail(email);
  return fromEmail || clerkUserId;
}
