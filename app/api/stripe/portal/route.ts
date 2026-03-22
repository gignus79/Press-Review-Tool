import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { ensureSchema, sql } from '@/lib/db';
import { stripe } from '@/lib/stripe';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
    }

    await ensureSchema();
    const user = await sql`
      SELECT stripe_customer_id
      FROM users
      WHERE clerk_user_id = ${userId}
      LIMIT 1
    `.then((r) => r[0] as { stripe_customer_id: string | null } | undefined);

    if (!user?.stripe_customer_id) {
      return NextResponse.json({ error: 'No active subscription to manage' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${baseUrl}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error('Portal session error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Portal failed' },
      { status: 500 }
    );
  }
}
