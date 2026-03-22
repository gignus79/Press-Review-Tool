import { auth } from '@clerk/nextjs/server';
import { sql, ensureSchema } from '@/lib/db';
import { getSearchLimit } from '@/lib/tier-utils';
import { DashboardActions } from '@/components/DashboardActions';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  await ensureSchema();
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
    <div className="max-w-4xl mx-auto px-3 py-8 sm:px-4 sm:py-10 md:py-12">
      <h1 className="text-xl font-bold text-[var(--tosky-dark)] mb-4 sm:text-2xl md:mb-6">
        Dashboard
      </h1>

      <div className="mb-6 rounded-lg border border-[var(--tosky-card-border)] bg-[var(--tosky-card)] p-4 shadow-[0_2px_4px_rgba(0,0,0,0.06)] sm:p-6 md:mb-8">
        <h2 className="mb-3 font-bold text-[var(--tosky-dark)] sm:mb-4">Utilizzo</h2>
        <p className="text-[var(--tosky-text-gray)]">
          Ricerche questo mese:{' '}
          <strong className="text-[var(--tosky-dark)]">
            {searchCount}
          </strong>{' '}
          / {limit}
        </p>
        <p className="mt-2 text-sm text-[var(--tosky-text-gray)]">
          Rimangono{' '}
          <span className="font-semibold text-[var(--tosky-dark)]">{remaining}</span> ricerche
        </p>
        <p className="mt-2 text-sm text-[var(--tosky-text-gray)]">
          Piano attuale:{' '}
          <span className="font-semibold capitalize text-[var(--tosky-dark)]">{tier}</span>
        </p>
      </div>

      <DashboardActions tier={tier} remaining={remaining} />
    </div>
  );
}
