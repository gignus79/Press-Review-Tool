import { auth, currentUser } from '@clerk/nextjs/server';
import { sql, ensureSchema } from '@/lib/db';
import { getSearchLimit } from '@/lib/tier-utils';
import { DashboardPageContent } from '@/components/DashboardPageContent';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  await ensureSchema();
  const userResult = (await sql`
    SELECT id, tier FROM users WHERE clerk_user_id = ${userId}
  `) as Array<{ id: string; tier: string }>;
  let user = userResult[0];

  if (!user) {
    const cu = await currentUser();
    const email = cu?.emailAddresses?.[0]?.emailAddress;
    if (email) {
      const byEmail = (await sql`
        SELECT id, tier
        FROM users
        WHERE LOWER(email) = LOWER(${email})
        ORDER BY created_at DESC
        LIMIT 1
      `) as Array<{ id: string; tier: string }>;
      if (byEmail[0]) {
        await sql`
          UPDATE users SET clerk_user_id = ${userId}
          WHERE id = ${byEmail[0].id}
        `;
        user = byEmail[0];
      }
    }
  }

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
    <DashboardPageContent
      searchCount={searchCount}
      limit={limit}
      remaining={remaining}
      tier={tier}
    />
  );
}
