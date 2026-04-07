'use server';

import { getOwnerProfile } from '@/lib/clerk/server';
import { polar } from '@/lib/polar';

export async function createCheckoutAction(productId: string) {
  const owner = await getOwnerProfile();
  if (!owner) {
    return { error: '인증이 필요합니다' };
  }

  if (!productId) {
    return { error: 'Polar 상품이 설정되지 않았습니다. 환경변수를 확인해주세요.' };
  }

  try {
    const checkoutParams: Parameters<typeof polar.checkouts.create>[0] = {
      products: [productId],
      metadata: {
        profileId: owner.ownerId,
        clerkUserId: owner.profile.clerkUserId,
        email: owner.profile.email,
      },
    };

    // Pass existing Polar customer ID if available
    if (owner.profile.polarCustomerId) {
      checkoutParams.customerId = owner.profile.polarCustomerId;
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
