import { createHash } from 'crypto';

const parsedLimit = Number(process.env.FREE_ACCOUNTS_PER_IP_LIMIT);
/** Max distinct people (by normalized email, else Clerk id) per IP per month on Free. */
const FREE_ACCOUNTS_PER_IP_LIMIT =
  Number.isFinite(parsedLimit) && parsedLimit >= 1 ? parsedLimit : 4;

export function getClientIp(request: Request): string | null {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get('x-real-ip')?.trim();
  if (real) return real;
  return null;
}

export function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex');
}

export { FREE_ACCOUNTS_PER_IP_LIMIT };
