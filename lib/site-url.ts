/**
 * URL canonico del sito (OG, metadataBase, link assoluti).
 * In Vercel imposta `NEXT_PUBLIC_APP_URL` al dominio pubblico (es. https://press-review-tool.labeltools.toskyrecords.com).
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '');
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, '');
    return `https://${host}`;
  }
  return 'http://localhost:3000';
}
