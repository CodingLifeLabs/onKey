import { NextRequest, NextResponse } from 'next/server';
import { polar } from '@/lib/polar';
import { getOwnerProfile } from '@/lib/clerk/server';

export async function GET(req: NextRequest) {
  const owner = await getOwnerProfile();
  if (!owner) {
    return NextResponse.redirect('/sign-in');
  }

  const products = req.nextUrl.searchParams.get('products');
  if (!products) {
    return NextResponse.json({ error: 'Missing products parameter' }, { status: 400 });
  }

  const productIds = products.split(',');

  try {
    const checkout = await polar.checkouts.create({
      products: productIds,
      customerEmail: owner.profile.email,
      externalCustomerId: owner.profile.id,
      successUrl: process.env.NEXT_PUBLIC_APP_URL + '/settings/billing?success=true',
    });

    if (!checkout.url) {
      return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
    }

    return NextResponse.redirect(checkout.url);
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.redirect(
      process.env.NEXT_PUBLIC_APP_URL + '/settings/billing?error=checkout_failed',
    );
  }
}
