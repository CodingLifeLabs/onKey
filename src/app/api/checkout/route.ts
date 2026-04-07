import { NextRequest, NextResponse } from 'next/server';
import { polar } from '@/lib/polar';
import { getOwnerProfile } from '@/lib/clerk/server';

export async function GET(req: NextRequest) {
  const owner = await getOwnerProfile();
  if (!owner) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  const products = req.nextUrl.searchParams.get('products');
  if (!products) {
    return NextResponse.json({ error: 'Missing products parameter' }, { status: 400 });
  }

  const productIds = products.split(',');

  try {
    const checkout = await polar.checkouts.create({
      products: productIds,
      metadata: {
        profileId: owner.profile.id,
        clerkUserId: owner.profile.clerkUserId,
      },
      successUrl: process.env.NEXT_PUBLIC_APP_URL + '/settings/billing?success=true',
    });

    if (!checkout.url) {
      return NextResponse.redirect(
        new URL('/settings/billing?error=no_checkout_url', req.url),
      );
    }

    return NextResponse.redirect(checkout.url);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Checkout error:', message);
    return NextResponse.redirect(
      new URL(`/settings/billing?error=${encodeURIComponent(message.slice(0, 200))}`, req.url),
    );
  }
}
