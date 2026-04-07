'use server';

import { getOwnerProfile } from '@/lib/clerk/server';
import { createServiceClient } from '@/lib/supabase/service';
import { mapSessionFromRow, mapSessionProgressFromRow } from '@/data/datasources/supabase.datasource';
import type { Session } from '@/domain/entities/session.entity';
import type { SessionProgress } from '@/domain/entities/session-progress.entity';
import { headers } from 'next/headers';

import type { Block } from '@/types/block';

export async function getSessionDetail(sessionId: string) {
  const owner = await getOwnerProfile();
  if (!owner) {
    return { error: '인증이 필요합니다' };
  }

  const supabase = createServiceClient();

  // 세션 조회
  const { data: sessionRow, error: sessionError } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionError || !sessionRow) {
    return { error: '세션을 찾을 수 없습니다' };
  }

  const session = mapSessionFromRow(sessionRow);
  if (session.ownerId !== owner.ownerId) {
    return { error: '접근 권한이 없습니다' };
  }

  // 진행 상태 조회
  const { data: progressRow } = await supabase
    .from('session_progress')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  const progress = progressRow ? mapSessionProgressFromRow(progressRow) : null;

  // 퍼블릭 링크
  const req = await headers();
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.get('x-forwarded-proto') || 'http';
  const baseUrl = `${protocol}://${host}`;
  const publicUrl = `${baseUrl}/onboarding/${session.token}`;

  // 블록 요약
  const blocks = session.contentSnapshot;
  const totalRequired = blocks.filter((b) => b.required).length;
  const viewedCount = blocks
    .filter((b) => b.required && (progress?.viewedSections ?? []).includes(b.id))
    .length;

  return {
    session,
    progress,
    publicUrl,
    stats: {
      totalBlocks: blocks.length,
      totalRequired,
      viewedRequired: viewedCount,
    },
  };
}
