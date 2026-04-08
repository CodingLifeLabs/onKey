'use server';

import { getOwnerProfile } from '@/lib/auth/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function bulkDeleteSessionsAction(sessionIds: string[]) {
  if (sessionIds.length === 0) return { error: '선택된 세션이 없습니다' };
  if (sessionIds.length > 50) return { error: '한 번에 최대 50개까지 삭제할 수 있습니다' };

  const owner = await getOwnerProfile();
  if (!owner) return { error: '인증이 필요합니다' };

  const supabase = createServiceClient();

  // 본인 소유 세션만 삭제
  const { error: progressError } = await supabase
    .from('session_progress')
    .delete()
    .in('session_id', sessionIds);

  if (progressError) {
    return { error: '삭제에 실패했습니다' };
  }

  const { error } = await supabase
    .from('sessions')
    .delete()
    .in('id', sessionIds)
    .eq('owner_id', owner.ownerId);

  if (error) {
    return { error: '삭제에 실패했습니다' };
  }

  return { success: true, deleted: sessionIds.length };
}
