import type { ITemplateRepository } from '@/domain/repositories/template.repository';
import type { Template } from '@/domain/entities/template.entity';
import type { Block } from '@/types/block';
import { createServiceClient } from '@/lib/supabase/service';
import { mapTemplateFromRow } from '@/data/datasources/supabase.datasource';

export class TemplateRepository implements ITemplateRepository {
  async findById(id: string): Promise<Template | null> {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single();
    return data ? mapTemplateFromRow(data) : null;
  }

  async findByOwnerId(ownerId: string): Promise<Template[]> {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from('templates')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    return (data ?? []).map(mapTemplateFromRow);
  }

  async findSystemTemplates(): Promise<Template[]> {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from('templates')
      .select('*')
      .eq('is_system', true)
      .order('created_at', { ascending: true });
    return (data ?? []).map(mapTemplateFromRow);
  }

  async create(data: {
    ownerId: string;
    name: string;
    description?: string;
    content: Block[];
    isSystem?: boolean;
  }): Promise<Template> {
    const supabase = createServiceClient();
    const { data: row } = await supabase
      .from('templates')
      .insert({
        owner_id: data.ownerId,
        name: data.name,
        description: data.description ?? null,
        content: data.content,
        is_system: data.isSystem ?? false,
      })
      .select()
      .single();
    return mapTemplateFromRow(row);
  }

  async update(
    id: string,
    data: { name?: string; description?: string; content?: Block[] },
  ): Promise<Template> {
    const supabase = createServiceClient();
    const { data: row } = await supabase
      .from('templates')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    return mapTemplateFromRow(row);
  }

  async delete(id: string): Promise<void> {
    const supabase = createServiceClient();
    await supabase.from('templates').delete().eq('id', id);
  }
}
