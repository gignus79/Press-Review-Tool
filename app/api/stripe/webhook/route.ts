import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { sql } from '@/lib/db';
import Stripe from 'stripe';

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook secret missing' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    console.error('Webhook signature verification failed:', e);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const clerkUserId = session.metadata?.clerkUserId;
        if (clerkUserId && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          const priceId = sub.items.data[0]?.price.id;
          const tier = priceId === process.env.STRIPE_PRESSREVIEW_BUSINESS_PRICE_ID ? 'business' : 'pro';
          await sql`
            UPDATE users
            SET tier = ${tier},
                stripe_customer_id = ${session.customer as string},
                stripe_subscription_id = ${session.subscription as string}
            WHERE clerk_user_id = ${clerkUserId}
          `;
        }
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const clerkUserId = sub.metadata?.clerkUserId;
        if (clerkUserId) {
          const priceId = sub.items.data[0]?.price.id;
          const tier = priceId === process.env.STRIPE_PRESSREVIEW_BUSINESS_PRICE_ID ? 'business' : 'pro';
          await sql`
            UPDATE users SET tier = ${tier}, stripe_subscription_id = ${sub.id}
            WHERE clerk_user_id = ${clerkUserId}
          `;
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        await sql`
          UPDATE users SET tier = 'free', stripe_subscription_id = NULL
          WHERE stripe_customer_id = ${customerId}
        `;
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error('Webhook handler error:', e);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
