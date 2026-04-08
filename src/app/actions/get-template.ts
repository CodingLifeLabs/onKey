'use server';

import { createServiceClient } from '@/lib/supabase/service';
import { requireUserId } from '@/lib/auth/server';
import { mapTemplateFromRow } from '@/data/datasources/supabase.datasource';
import type { Template } from '@/domain/entities/template.entity';

export async function getTemplate(
  templateId: string,
): Promise<Template | null> {
  const userId = await requireUserId();

  const supabase = createServiceClient();

  // Get profile to get ownerId
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!profile) return null;

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('id', templateId)
    .eq('owner_id', profile.id)
    .single();

  if (error || !data) return null;

  return mapTemplateFromRow(data);
}
