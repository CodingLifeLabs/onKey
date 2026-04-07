'use server';

import { createServiceClient } from '@/lib/supabase/service';
import { requireUserId } from '@/lib/clerk/server';
import { mapTemplateFromRow } from '@/data/datasources/supabase.datasource';
import type { Template } from '@/domain/entities/template.entity';

export async function getAllTemplates(): Promise<{
  system: Template[];
  user: Template[];
}> {
  const clerkUserId = await requireUserId();

  const supabase = createServiceClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (!profile) return { system: [], user: [] };

  const [systemResult, userResult] = await Promise.all([
    supabase
      .from('templates')
      .select('*')
      .eq('is_system', true)
      .order('created_at', { ascending: true }),
    supabase
      .from('templates')
      .select('*')
      .eq('owner_id', profile.id)
      .order('updated_at', { ascending: false }),
  ]);

  return {
    system: (systemResult.data ?? []).map(mapTemplateFromRow),
    user: (userResult.data ?? []).map(mapTemplateFromRow),
  };
}
