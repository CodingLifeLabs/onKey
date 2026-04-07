'use server';

import { createServiceClient } from '@/lib/supabase/service';
import {
  mapSessionFromRow,
  mapSessionProgressFromRow,
} from '@/data/datasources/supabase.datasource';

export async function getSessionByToken(token: string) {
  const supabase = createServiceClient();

  const { data: sessionRow, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('token', token)
    .single();

  if (error || !sessionRow) {
    return { error: '세션을 찾을 수 없습니다' };
  }

  const session = mapSessionFromRow(sessionRow);

  // 만료 확인
  if (session.status === 'expired' || (session.expiresAt && new Date() > session.expiresAt)) {
    return { error: '만료된 세션입니다', session, status: 'expired' as const };
  }

  // 이미 완료됨
  if (session.status === 'completed') {
    return { error: '이미 완료된 세션입니다', session, status: 'completed' as const };
  }

  // progress 조회
  const { data: progressRow } = await supabase
    .from('session_progress')
    .select('*')
    .eq('session_id', session.id)
    .single();

  const progress = progressRow ? mapSessionProgressFromRow(progressRow) : null;

  // 상태가 pending이면 in_progress로 변경
  if (session.status === 'pending') {
    await supabase
      .from('sessions')
      .update({ status: 'in_progress' })
      .eq('id', session.id);
  }

  return {
    session: { ...session, status: session.status === 'pending' ? 'in_progress' as const : session.status },
    progress,
  };
}
