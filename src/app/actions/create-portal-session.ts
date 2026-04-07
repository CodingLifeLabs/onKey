'use server';

import { getOwnerProfile } from '@/lib/clerk/server';
import { polar } from '@/lib/polar';

export async function createPortalSessionAction() {
  const owner = await getOwnerProfile();
  if (!owner) {
    return { error: '인증이 필요합니다' };
  }

  const customerId = owner.profile.polarCustomerId;
  if (!customerId) {
    return { error: '구독 이력이 없습니다' };
  }

  try {
    const session = await polar.customerSessions.create({
      customerId,
    });

    return { url: session.customerPortalUrl };
  } catch (err) {
    console.error('Failed to create portal session:', err);
    return { error: '포털 세션 생성에 실패했습니다' };
  }
}
