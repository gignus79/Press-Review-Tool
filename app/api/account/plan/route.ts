import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { ensureSchema, sql } from '@/lib/db';
import { stripe } from '@/lib/stripe';

type Tier = 'free' | 'pro' | 'business';

function tierFromPriceId(priceId: string | null | undefined): Tier {
  if (!priceId) return 'free';
  if (priceId === process.env.STRIPE_PRESSREVIEW_BUSINESS_PRICE_ID) return 'business';
  if (priceId === process.env.STRIPE_PRESSREVIEW_PRO_PRICE_ID) return 'pro';
  return 'free';
}

export async function GET() {
  try {
    await ensureSchema();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const row = await sql`
      SELECT id, tier, stripe_customer_id, stripe_subscription_id
      FROM users
      WHERE clerk_user_id = ${userId}
      LIMIT 1
    `.then(
      (r) =>
        r[0] as
          | {
              id: string;
              tier: Tier | null;
              stripe_customer_id: string | null;
              stripe_subscription_id: string | null;
            }
          | undefined
    );

    let tier = (row?.tier as Tier | null) ?? 'free';
    let canManageSubscription = Boolean(row?.stripe_customer_id && row?.stripe_subscription_id);

    if (row?.stripe_customer_id && stripe) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: row.stripe_customer_id,
          status: 'all',
          limit: 10,
        });

        const active = subscriptions.data.find((sub) =>
          ['active', 'trialing', 'past_due', 'unpaid'].includes(sub.status)
        );

        const computedTier = tierFromPriceId(active?.items.data[0]?.price.id);
        const computedSubscriptionId = active?.id ?? null;
        const hasManage = Boolean(active?.id);

        if (computedTier !== tier || computedSubscriptionId !== row.stripe_subscription_id) {
          await sql`
            UPDATE users
            SET tier = ${computedTier},
                stripe_subscription_id = ${computedSubscriptionId}
            WHERE id = ${row.id}
          `;
        }

        tier = computedTier;
        canManageSubscription = hasManage;
      } catch (syncErr) {
        console.error('Plan reconciliation with Stripe failed:', syncErr);
      }
    }

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
