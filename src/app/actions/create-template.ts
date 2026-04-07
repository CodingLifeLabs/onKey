'use server';

import { createServiceClient } from '@/lib/supabase/service';
import { requireUserId } from '@/lib/clerk/server';
import { mapTemplateFromRow } from '@/data/datasources/supabase.datasource';
import type { Template } from '@/domain/entities/template.entity';

export async function createTemplate(data: {
  name: string;
  description?: string;
}): Promise<Template> {
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

  const { data: template, error } = await supabase
    .from('templates')
    .insert({
      owner_id: profile.id,
      name: data.name,
      description: data.description ?? null,
      is_system: false,
      content: [],
    })
    .select()
    .single();

  if (error || !template) {
    throw new Error('템플릿 생성에 실패했습니다');
  }

  return mapTemplateFromRow(template);
}
