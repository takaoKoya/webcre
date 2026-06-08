import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || webhookSecret.includes('dummy')) {
    return NextResponse.json({ error: 'Stripe webhook not configured' }, { status: 503 });
  }

  // TODO: Handle Stripe webhook events (customer.subscription.updated, etc.)
  return NextResponse.json({ received: true });
}
