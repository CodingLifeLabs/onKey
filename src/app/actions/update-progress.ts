'use server';

import { createServiceClient } from '@/lib/supabase/service';
import { mapSessionProgressFromRow } from '@/data/datasources/supabase.datasource';
import type { SessionProgress } from '@/domain/entities/session-progress.entity';

export async function updateProgress(data: {
  sessionId: string;
  viewedSections?: string[];
  checkedItems?: string[];
}): Promise<SessionProgress> {
  const supabase = createServiceClient();

  // 세션 상태 검증: 존재 + 미완료 상태만 업데이트 허용
  const { data: session } = await supabase
    .from('sessions')
    .select('status')
    .eq('id', data.sessionId)
    .single();

  if (!session || session.status === 'completed') {
    throw new Error('유효하지 않은 세션입니다');
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (data.viewedSections !== undefined) updateData.viewed_sections = data.viewedSections;
  if (data.checkedItems !== undefined) updateData.checked_items = data.checkedItems;

  const { data: row, error } = await supabase
    .from('session_progress')
    .update(updateData)
    .eq('session_id', data.sessionId)
    .select()
    .single();

  if (error || !row) {
    throw new Error('진행 상태 업데이트에 실패했습니다');
  }

  return mapSessionProgressFromRow(row);
}
