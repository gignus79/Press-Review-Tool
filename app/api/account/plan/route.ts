import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { ensureSchema, sql } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { randomUUID } from 'crypto';

type Tier = 'free' | 'pro' | 'business';

function tierFromPriceId(priceId: string | null | undefined): Tier {
  if (!priceId) return 'free';
  if (priceId === process.env.STRIPE_PRESSREVIEW_BUSINESS_PRICE_ID) return 'business';
  if (priceId === process.env.STRIPE_PRESSREVIEW_PRO_PRICE_ID) return 'pro';
  return 'free';
}

async function findActiveSubscriptionByCustomerId(
  customerId: string
): Promise<{ id: string; customer: string | null; priceId: string | null } | null> {
  if (!stripe) return null;
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    limit: 10,
  });
  const hit = subscriptions.data.find((sub) =>
    ['active', 'trialing', 'past_due', 'unpaid'].includes(sub.status)
  );
  if (!hit) return null;
  return {
    id: hit.id,
    customer: typeof hit.customer === 'string' ? hit.customer : null,
    priceId: hit.items.data[0]?.price.id ?? null,
  };
}

export async function GET() {
  try {
    await ensureSchema();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clerkUser = await currentUser();
    const primaryEmail = clerkUser?.emailAddresses?.[0]?.emailAddress ?? '';

    let row = await sql`
      SELECT id, email, tier, stripe_customer_id, stripe_subscription_id
      FROM users
      WHERE clerk_user_id = ${userId}
      LIMIT 1
    `.then(
      (r) =>
        r[0] as
          | {
              id: string;
              email: string;
              tier: Tier | null;
              stripe_customer_id: string | null;
              stripe_subscription_id: string | null;
            }
          | undefined
    );

    if (!row) {
      await sql`
        INSERT INTO users (id, clerk_user_id, email, tier)
        VALUES (${randomUUID()}, ${userId}, ${primaryEmail}, 'free')
        ON CONFLICT (clerk_user_id) DO NOTHING
      `;
      row = await sql`
        SELECT id, email, tier, stripe_customer_id, stripe_subscription_id
        FROM users
        WHERE clerk_user_id = ${userId}
        LIMIT 1
      `.then(
        (r) =>
          r[0] as
            | {
                id: string;
                email: string;
                tier: Tier | null;
                stripe_customer_id: string | null;
                stripe_subscription_id: string | null;
              }
            | undefined
      );
    } else if (primaryEmail && row.email !== primaryEmail) {
      await sql`
        UPDATE users
        SET email = ${primaryEmail}
        WHERE id = ${row.id}
      `;
      row.email = primaryEmail;
    }

    let tier = (row?.tier as Tier | null) ?? 'free';
    let canManageSubscription = Boolean(row?.stripe_customer_id && row?.stripe_subscription_id);

    if (row && stripe) {
      try {
        let active: { id: string; customer: string | null; priceId: string | null } | null = null;

        if (row.stripe_customer_id) {
          active = await findActiveSubscriptionByCustomerId(row.stripe_customer_id);
        }

        // Fallback: recover subscription even if webhook never persisted customer/sub IDs.
        if (!active) {
          const searched = await stripe.subscriptions.search({
            query: `metadata['clerkUserId']:'${userId}'`,
            limit: 10,
          });
          const hit = searched.data.find((sub) =>
            ['active', 'trialing', 'past_due', 'unpaid'].includes(sub.status)
          );
          if (hit) {
            active = {
              id: hit.id,
              customer: typeof hit.customer === 'string' ? hit.customer : null,
              priceId: hit.items.data[0]?.price.id ?? null,
            };
          }
        }

        // Fallback by customer email to cover subscriptions created before live Clerk migration.
        if (!active && row.email) {
          const customers = await stripe.customers.list({ email: row.email, limit: 10 });
          for (const customer of customers.data) {
            const customerId = typeof customer.id === 'string' ? customer.id : null;
            if (!customerId) continue;
            const found = await findActiveSubscriptionByCustomerId(customerId);
            if (found) {
              active = found;
              break;
            }
          }
        }

        const computedTier = tierFromPriceId(active?.priceId);
        const computedSubscriptionId = active?.id ?? null;
        const computedCustomerId = active?.customer ?? row.stripe_customer_id ?? null;
        const hasManage = Boolean(active?.id && computedCustomerId);

        if (
          computedTier !== tier ||
          computedSubscriptionId !== row.stripe_subscription_id ||
          computedCustomerId !== row.stripe_customer_id
        ) {
          await sql`
            UPDATE users
            SET tier = ${computedTier},
                stripe_subscription_id = ${computedSubscriptionId},
                stripe_customer_id = ${computedCustomerId}
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
