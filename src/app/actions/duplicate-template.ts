'use server';

import { createServiceClient } from '@/lib/supabase/service';
import { requireUserId } from '@/lib/clerk/server';
import { mapTemplateFromRow } from '@/data/datasources/supabase.datasource';
import type { Template } from '@/domain/entities/template.entity';

export async function duplicateTemplate(
  templateId: string,
): Promise<Template> {
  const clerkUserId = await requireUserId();

  const supabase = createServiceClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, plan')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (!profile) throw new Error('프로필을 찾을 수 없습니다');

  if (profile.plan === 'starter') {
    throw new Error('커스텀 템플릿은 Pro 플랜에서 사용할 수 있습니다');
  }

  const { data: source, error: fetchError } = await supabase
    .from('templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (fetchError || !source) {
    throw new Error('원본 템플릿을 찾을 수 없습니다');
  }

  const isOwner = source.owner_id === profile.id;
  const isSystem = source.is_system;

  if (!isOwner && !isSystem) {
    throw new Error('복제 권한이 없습니다');
  }

  const { data: duplicated, error } = await supabase
    .from('templates')
    .insert({
      owner_id: profile.id,
      name: `${source.name} (복사본)`,
      description: source.description,
      is_system: false,
      content: source.content,
    })
    .select()
    .single();

  if (error || !duplicated) {
    throw new Error('템플릿 복제에 실패했습니다');
  }

  return mapTemplateFromRow(duplicated);
}
