import { createHash } from 'crypto';

const FREE_ACCOUNTS_PER_IP_LIMIT = Number(process.env.FREE_ACCOUNTS_PER_IP_LIMIT || 2);

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
