const STRIPE_REDIRECT_HOSTS = new Set(['checkout.stripe.com', 'billing.stripe.com']);

/**
 * Validates Stripe-hosted redirect URLs before assigning window.location.
 * WebKit (Safari) throws if `location` is set to a malformed URL — message often:
 * "The string did not match the expected pattern."
 */
export function assertSafeStripeRedirectUrl(raw: string): string {
  const trimmed = raw.trim();
  const u = new URL(trimmed);
  if (u.protocol !== 'https:') {
    throw new Error('UNSUPPORTED_STRIPE_URL_PROTOCOL');
  }
  if (!STRIPE_REDIRECT_HOSTS.has(u.hostname)) {
    throw new Error('UNEXPECTED_STRIPE_HOST');
  }
  return u.href;
}
