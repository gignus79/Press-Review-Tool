/**
 * Resolves a Stripe Price ID from the checkout POST body.
 * Plan keys "pro" / "business" map from env; they must never be sent to Stripe as-is.
 */
export function resolveStripeCheckoutPriceId(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const raw = (body as { priceId?: unknown }).priceId;
  if (typeof raw !== 'string') return null;
  const key = raw.trim();
  if (!key) return null;

  const pro = process.env.STRIPE_PRESSREVIEW_PRO_PRICE_ID?.trim() ?? '';
  const business = process.env.STRIPE_PRESSREVIEW_BUSINESS_PRICE_ID?.trim() ?? '';

  if (key === 'pro') {
    return pro.startsWith('price_') ? pro : null;
  }
  if (key === 'business') {
    return business.startsWith('price_') ? business : null;
  }
  if (key.startsWith('price_')) {
    return key;
  }
  return null;
}
