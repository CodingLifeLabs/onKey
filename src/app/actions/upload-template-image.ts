'use server';

import { createServiceClient } from '@/lib/supabase/service';
import { requireUserId } from '@/lib/clerk/server';
import { nanoid } from 'nanoid';

export async function uploadTemplateImage(file: File): Promise<{ url: string }> {
  const clerkUserId = await requireUserId();

  const supabase = createServiceClient();

  // Verify user has a profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (!profile) throw new Error('프로필을 찾을 수 없습니다');

  // Validate file
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('이미지는 5MB 이하만 업로드할 수 있습니다');
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('JPG, PNG, WebP 형식만 지원합니다');
  }

  const ext = file.name.split('.').pop() ?? 'png';
  const path = `${profile.id}/${nanoid(12)}.${ext}`;

  const bytes = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from('templates')
    .upload(path, bytes, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error('이미지 업로드에 실패했습니다');
  }

  const { data: urlData } = supabase.storage
    .from('templates')
    .getPublicUrl(path);

  return { url: urlData.publicUrl };
}
