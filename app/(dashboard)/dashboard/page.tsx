import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';
import { getSearchLimit } from '@/lib/tier-utils';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const userResult = (await sql`
    SELECT id, tier FROM users WHERE clerk_user_id = ${userId}
  `) as Array<{ id: string; tier: string }>;
  const user = userResult[0];
  const tier = (user?.tier as 'free' | 'pro' | 'business') ?? 'free';

  const monthYear = new Date().toISOString().slice(0, 7);
  const usageResult = user
    ? ((await sql`
        SELECT search_count FROM usage_tracking
        WHERE user_id = ${user.id} AND month_year = ${monthYear}
      `) as Array<{ search_count: number }>)
    : [];
  const searchCount = usageResult[0]?.search_count ?? 0;
  const limit = getSearchLimit(tier);
  const remaining = Math.max(0, limit - searchCount);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-[var(--tosky-dark)] mb-6">
        Dashboard
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)] border border-[var(--tosky-border)] mb-8">
        <h2 className="font-bold text-[var(--tosky-dark)] mb-4">Utilizzo</h2>
        <p className="text-[var(--tosky-text-gray)]">
          Ricerche questo mese: <strong>{searchCount}</strong> / {limit}
        </p>
        <p className="text-sm text-[var(--tosky-muted)] mt-1">
          Rimangono {remaining} ricerche
        </p>
        <p className="text-sm text-[var(--tosky-muted)] mt-1">
          Piano attuale: <span className="font-semibold capitalize">{tier}</span>
        </p>
      </div>

      <Link
        href="/search"
        className="inline-block px-8 py-4 bg-[var(--tosky-dark)] text-white font-bolder rounded-[99px] hover:bg-[var(--tosky-mid-gray)] transition-colors"
      >
        Nuova ricerca
      </Link>

      {(tier === 'pro' || tier === 'business') && (
        <Link
          href="/history"
          className="ml-4 inline-block px-8 py-4 border border-[var(--tosky-border)] text-[var(--tosky-dark)] font-bolder rounded-[99px] hover:bg-[var(--tosky-light-gray)] transition-colors"
        >
          Storico ricerche
        </Link>
      )}
    </div>
  );
}
