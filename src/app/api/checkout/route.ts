import { NextRequest, NextResponse } from 'next/server';
import { polar } from '@/lib/polar';
import { getOwnerProfile } from '@/lib/clerk/server';

function isRealEmail(email: string): boolean {
  const fakeDomains = ['example.com', 'clerk.dev', 'localhost'];
  const domain = email.split('@')[1]?.toLowerCase();
  return !!domain && !fakeDomains.includes(domain);
}

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

  // 실제 이메일만 전달, 가짜 이메일은 Polar 체크아웃에서 직접 입력 유도
  const customerEmail = owner.profile.email && isRealEmail(owner.profile.email)
    ? owner.profile.email
    : undefined;

  try {
    const checkout = await polar.checkouts.create({
      products: productIds,
      customerEmail,
      customerName: owner.profile.fullName ?? undefined,
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
