import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { ensureSchema, sql } from '@/lib/db';

type Tier = 'free' | 'pro' | 'business';

export async function GET() {
  try {
    await ensureSchema();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const row = await sql`
      SELECT tier, stripe_customer_id, stripe_subscription_id
      FROM users
      WHERE clerk_user_id = ${userId}
      LIMIT 1
    `.then(
      (r) =>
        r[0] as
          | { tier: Tier | null; stripe_customer_id: string | null; stripe_subscription_id: string | null }
          | undefined
    );

    const tier = (row?.tier as Tier | null) ?? 'free';
    const canManageSubscription = Boolean(row?.stripe_customer_id && row?.stripe_subscription_id);

    return NextResponse.json(
      { tier, canManageSubscription },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e) {
    console.error('Plan API error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
