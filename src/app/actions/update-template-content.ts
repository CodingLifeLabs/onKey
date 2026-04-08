'use server';

import { createServiceClient } from '@/lib/supabase/service';
import { requireUserId } from '@/lib/auth/server';
import { mapTemplateFromRow } from '@/data/datasources/supabase.datasource';
import type { Block } from '@/types/block';
import type { Template } from '@/domain/entities/template.entity';

export async function updateTemplateContent(
  templateId: string,
  content: Block[],
): Promise<Template> {
  const userId = await requireUserId();

  const supabase = createServiceClient();

  // Get profile to verify ownership
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!profile) throw new Error('프로필을 찾을 수 없습니다');

  const { data, error } = await supabase
    .from('templates')
    .update({
      content,
      updated_at: new Date().toISOString(),
    })
    .eq('id', templateId)
    .eq('owner_id', profile.id)
    .select()
    .single();

  if (error || !data) {
    throw new Error('템플릿 저장에 실패했습니다');
  }

  return mapTemplateFromRow(data);
}
