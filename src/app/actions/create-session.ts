'use server';

import { getOwnerProfile } from '@/lib/auth/server';
import { createServiceClient } from '@/lib/supabase/service';
import { nanoid } from 'nanoid';
import { createSessionStep1Schema } from '@/lib/validations/session';
import { getSessionLimit } from '@/lib/polar';
import type { Block } from '@/types/block';

export async function createSessionAction(
  step1Data: {
    roomNumber: string;
    tenantName: string;
    moveInDate: string;
    expiresAt: string;
    memo?: string;
  },
  templateId: string | null,
  contentBlocks: Block[] = [],
) {
  const parsed = createSessionStep1Schema.safeParse(step1Data);
  if (!parsed.success) {
    return { error: '유효하지 않은 입력입니다' };
  }

  const owner = await getOwnerProfile();
  if (!owner) {
    return { error: '인증이 필요합니다' };
  }

  const supabase = createServiceClient();

  // 월간 카운트 리셋 (필요 시)
  const now = new Date();
  const resetAt = owner.profile.sessionResetAt;
  const needsReset =
    now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear();

  if (needsReset) {
    await supabase
      .from('profiles')
      .update({
        session_count_this_month: 0,
        session_reset_at: now.toISOString(),
      })
      .eq('id', owner.ownerId);
  }

  // DB에서 최신 카운트 조회 (race condition 방지)
  const { data: freshProfile } = await supabase
    .from('profiles')
    .select('session_count_this_month, plan')
    .eq('id', owner.ownerId)
    .single();

  const currentCount = needsReset ? 0 : (freshProfile?.session_count_this_month ?? 0);
  const plan = freshProfile?.plan ?? owner.profile.plan;
  const limit = getSessionLimit(plan);

  if (currentCount >= limit) {
    return { error: `이번 달 세션 생성 한도(${limit}개)에 도달했습니다. 플랜을 업그레이드해주세요.` };
  }

  const token = nanoid(21);

  const { data: session, error } = await supabase
    .from('sessions')
    .insert({
      owner_id: owner.ownerId,
      template_id: templateId,
      token,
      tenant_name: step1Data.tenantName,
      room_number: step1Data.roomNumber,
      move_in_date: step1Data.moveInDate,
      expires_at: step1Data.expiresAt,
      content_snapshot: contentBlocks,
    })
    .select('id, token')
    .single();

  if (error) {
    return { error: '세션 생성에 실패했습니다' };
  }

  // session_progress 초기 레코드 생성
  await supabase.from('session_progress').insert({
    session_id: session.id,
  });

  // 월간 세션 카운트 원자적 증가 (RPC)
  await supabase.rpc('increment_session_count', { profile_id: owner.ownerId });

  return { token: session.token };
}
