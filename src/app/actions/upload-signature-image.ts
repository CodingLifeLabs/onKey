'use server';

import { createServiceClient } from '@/lib/supabase/service';
import { nanoid } from 'nanoid';

export async function uploadSignatureImage(
  file: File,
  sessionId: string,
): Promise<{ url: string }> {
  // Validate file
  const maxSize = 1 * 1024 * 1024; // 1MB
  if (file.size > maxSize) {
    throw new Error('서명 이미지는 1MB 이하만 업로드할 수 있습니다');
  }

  if (file.type !== 'image/png') {
    throw new Error('PNG 형식만 지원합니다');
  }

  const supabase = createServiceClient();

  // Verify session exists
  const { data: session } = await supabase
    .from('sessions')
    .select('id')
    .eq('id', sessionId)
    .single();

  if (!session) {
    throw new Error('세션을 찾을 수 없습니다');
  }

  const path = `${sessionId}/${nanoid(12)}.png`;
  const bytes = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from('signatures')
    .upload(path, bytes, {
      contentType: 'image/png',
      upsert: false,
    });

  if (error) {
    throw new Error('서명 이미지 업로드에 실패했습니다');
  }

  const { data: urlData } = supabase.storage
    .from('signatures')
    .getPublicUrl(path);

  return { url: urlData.publicUrl };
}
