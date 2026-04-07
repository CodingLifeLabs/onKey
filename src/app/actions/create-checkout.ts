'use server';

import { getOwnerProfile } from '@/lib/clerk/server';
import { polar } from '@/lib/polar';

const FAKE_EMAIL_DOMAINS = ['example.com', 'test.com', 'localhost'];

function isFakeEmail(email: string): boolean {
  return FAKE_EMAIL_DOMAINS.some((d) => email.endsWith(`@${d}`));
}

export async function createCheckoutAction(productId: string) {
  const owner = await getOwnerProfile();
  if (!owner) {
    return { error: '인증이 필요합니다' };
  }

  if (!productId) {
    return { error: 'Polar 상품이 설정되지 않았습니다. 환경변수를 확인해주세요.' };
  }

  // 이미 active 구독이 있으면 Portal로 유도
  if (
    owner.profile.polarCustomerId &&
    owner.profile.subscriptionStatus === 'active'
  ) {
    try {
      const session = await polar.customerSessions.create({
        customerId: owner.profile.polarCustomerId,
      });
      return { url: session.customerPortalUrl, isPortal: true };
    } catch {
      // Portal 생성 실패 시 checkout으로 진행
    }
  }

  try {
    const checkoutParams: Parameters<typeof polar.checkouts.create>[0] = {
      products: [productId],
      metadata: {
        profileId: owner.ownerId,
        clerkUserId: owner.profile.clerkUserId,
      },
      externalCustomerId: owner.profile.clerkUserId,
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
      return { error: '체크아웃 URL을 생성할 수 없습니다' };
    }

    return { url: checkout.url };
  } catch (err) {
    console.error('Failed to create checkout:', err);
    return { error: '체크아웃 생성에 실패했습니다' };
  }
}
