import { NextRequest, NextResponse } from 'next/server';
import { polar } from '@/lib/polar';
import { getOwnerProfile } from '@/lib/clerk/server';

const FAKE_EMAIL_DOMAINS = ['example.com', 'test.com', 'localhost'];

function isFakeEmail(email: string): boolean {
  return FAKE_EMAIL_DOMAINS.some((d) => email.endsWith(`@${d}`));
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

  // 이미 active 구독이 있으면 Portal로 리다이렉트
  if (
    owner.profile.polarCustomerId &&
    owner.profile.subscriptionStatus === 'active'
  ) {
    try {
      const session = await polar.customerSessions.create({
        customerId: owner.profile.polarCustomerId,
      });
      if (session.customerPortalUrl) {
        return NextResponse.redirect(session.customerPortalUrl);
      }
    } catch {
      // Portal 생성 실패 시 checkout으로 진행
    }
  }

  try {
    const checkoutParams: Parameters<typeof polar.checkouts.create>[0] = {
      products: productIds,
      metadata: {
        profileId: owner.profile.id,
        clerkUserId: owner.profile.clerkUserId,
      },
      externalCustomerId: owner.profile.clerkUserId,
      successUrl: process.env.NEXT_PUBLIC_APP_URL + '/settings/billing?success=true',
    };

    // 기존 Polar 고객이면 customerId 전달
    if (owner.profile.polarCustomerId) {
      checkoutParams.customerId = owner.profile.polarCustomerId;
    }

    // fake email이 아니면 customerEmail 전달
    if (owner.profile.email && !isFakeEmail(owner.profile.email)) {
      checkoutParams.customerEmail = owner.profile.email;
    }

    const checkout = await polar.checkouts.create(checkoutParams);

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
