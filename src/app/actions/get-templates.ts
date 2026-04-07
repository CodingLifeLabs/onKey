'use server';

import { createServiceClient } from '@/lib/supabase/service';
import { mapTemplateFromRow } from '@/data/datasources/supabase.datasource';

export async function getSystemTemplates() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('is_system', true)
    .order('created_at', { ascending: true });

  if (error || !data) return [];
  return data.map(mapTemplateFromRow);
}
