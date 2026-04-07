'use server';

import { createServiceClient } from '@/lib/supabase/service';
import { mapSessionProgressFromRow } from '@/data/datasources/supabase.datasource';
import type { Block } from '@/types/block';

interface CompleteSessionSuccess {
  success: true;
}

interface CompleteSessionError {
  error: string;
}

type CompleteSessionResult = CompleteSessionSuccess | CompleteSessionError;

export async function completeSession(data: {
  sessionId: string;
  signatureName?: string;
  signatureImageUrl?: string;
  checkedItems?: string[];
}): Promise<CompleteSessionResult> {
  const supabase = createServiceClient();

  // 세션 + progress 조회
  const { data: sessionRow } = await supabase
    .from('sessions')
    .select('id, status, content_snapshot')
    .eq('id', data.sessionId)
    .single();

  if (!sessionRow) {
    return { error: '세션을 찾을 수 없습니다' };
  }

  if (sessionRow.status === 'completed') {
    return { error: '이미 완료된 세션입니다' };
  }

  // progress 조회
  const { data: progressRow } = await supabase
    .from('session_progress')
    .select('*')
    .eq('session_id', data.sessionId)
    .single();

  const progress = progressRow ? mapSessionProgressFromRow(progressRow) : null;

  // required 블록 검증
  const blocks = (sessionRow.content_snapshot as Block[]) ?? [];
  const requiredBlocks = blocks.filter((b) => b.required);
  const viewedSections = progress?.viewedSections ?? [];
  // 클라이언트에서 전달된 checkedItems 우선 사용, 없으면 DB 값 사용
  const itemsToCheck = data.checkedItems ?? (progress?.checkedItems ?? []);

  // 모든 required 블록이 열람되었는지 확인
  const allViewed = requiredBlocks.every((b) => viewedSections.includes(b.id));
  if (!allViewed) {
    return { error: '모든 필수 항목을 확인해주세요' };
  }

  // checklist 블록의 모든 항목이 체크되었는지 확인
  const checklistBlocks = requiredBlocks.filter((b) => b.type === 'checklist');

  const allChecked = checklistBlocks.every((b) => {
    if (b.type !== 'checklist') return true;
    return b.content.items.every((item) => itemsToCheck.includes(item.id));
  });
  if (!allChecked) {
    return { error: '모든 체크리스트 항목을 체크해주세요' };
  }

  // signature 블록이 있는 경우 서명 필수
  const hasSignatureBlock = requiredBlocks.some((b) => b.type === 'signature');
  if (hasSignatureBlock && !data.signatureImageUrl) {
    return { error: '서명을 완료해주세요' };
  }
  if (hasSignatureBlock && !data.signatureName) {
    return { error: '이름을 입력해주세요' };
  }

  // progress 업데이트 (서명 정보 + 제출 시각)
  const progressUpdate: Record<string, unknown> = {
    submitted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  if (data.signatureName) {
    progressUpdate.signature_name = data.signatureName;
  }
  if (data.signatureImageUrl) {
    progressUpdate.signature_image_url = data.signatureImageUrl;
  }

  const { error: progressError } = await supabase
    .from('session_progress')
    .update(progressUpdate)
    .eq('session_id', data.sessionId);

  if (progressError) {
    return { error: '진행 상태 업데이트에 실패했습니다' };
  }

  // 세션 상태 completed로 변경
  const { error: sessionError } = await supabase
    .from('sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', data.sessionId);

  if (sessionError) {
    return { error: '세션 완료 처리에 실패했습니다' };
  }

  return { success: true };
}
