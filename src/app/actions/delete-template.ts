'use server';

import { createServiceClient } from '@/lib/supabase/service';
import { requireUserId } from '@/lib/clerk/server';

export async function deleteTemplate(templateId: string): Promise<void> {
  const clerkUserId = await requireUserId();

  const supabase = createServiceClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (!profile) throw new Error('프로필을 찾을 수 없습니다');

  const { data: template } = await supabase
    .from('templates')
    .select('owner_id, is_system')
    .eq('id', templateId)
    .single();

  if (!template) throw new Error('템플릿을 찾을 수 없습니다');
  if (template.is_system) throw new Error('시스템 템플릿은 삭제할 수 없습니다');
  if (template.owner_id !== profile.id) {
    throw new Error('삭제 권한이 없습니다');
  }

  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', templateId);

  if (error) throw new Error('템플릿 삭제에 실패했습니다');
}
