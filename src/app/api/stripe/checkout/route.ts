import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey || stripeKey.includes('dummy')) {
    return NextResponse.json({ error: 'Stripe is not configured yet', mode: 'unavailable' }, { status: 503 });
  }

  try {
    const { planId } = await request.json();
    // TODO: Real Stripe checkout session creation
    return NextResponse.json({ url: null, planId });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
