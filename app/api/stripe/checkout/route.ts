import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getSiteUrl } from '@/lib/site-url';
import { stripe } from '@/lib/stripe';
import { resolveStripeCheckoutPriceId } from '@/lib/stripe-checkout';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const actualPriceId = resolveStripeCheckoutPriceId(body);
    if (!actualPriceId) {
      return NextResponse.json(
        { error: 'Invalid price or missing STRIPE_PRESSREVIEW_*_PRICE_ID' },
        { status: 400 }
      );
    }

    const baseUrl = getSiteUrl().replace(/\/$/, '');
    const successUrl = `${baseUrl}/dashboard?upgraded=true`;
    const cancelUrl = `${baseUrl}/pricing`;
    try {
      new URL(successUrl);
      new URL(cancelUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid NEXT_PUBLIC_APP_URL or site URL' }, { status: 500 });
    }

    const clerkUser = await currentUser();
    const customerEmail =
      clerkUser?.primaryEmailAddress?.emailAddress ??
      clerkUser?.emailAddresses?.[0]?.emailAddress ??
      undefined;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: actualPriceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail || undefined,
      metadata: { clerkUserId: userId },
      subscription_data: { metadata: { clerkUserId: userId } },
    });

    const url = session.url?.trim();
    if (!url) {
      console.error('Checkout: session created without url', session.id);
      return NextResponse.json(
        { error: 'Checkout session did not return a redirect URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url });
  } catch (e) {
    console.error('Checkout error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Checkout failed' },
      { status: 500 }
    );
  }
}
