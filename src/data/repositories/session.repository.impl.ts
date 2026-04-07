import type {
  ISessionRepository,
  ISessionProgressRepository,
} from '@/domain/repositories/session.repository';
import type { Session, SessionStatus } from '@/domain/entities/session.entity';
import type { SessionProgress } from '@/domain/entities/session-progress.entity';
import type { Block } from '@/types/block';
import { createServiceClient } from '@/lib/supabase/service';
import {
  mapSessionFromRow,
  mapSessionProgressFromRow,
} from '@/data/datasources/supabase.datasource';

export class SessionRepository implements ISessionRepository {
  async findById(id: string): Promise<Session | null> {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();
    return data ? mapSessionFromRow(data) : null;
  }

  async findByToken(token: string): Promise<Session | null> {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('token', token)
      .single();
    return data ? mapSessionFromRow(data) : null;
  }

  async findByOwnerId(ownerId: string): Promise<Session[]> {
    const supabase = createServiceClient();

    // 만료일 지난 세션 자동 전환
    await supabase
      .from('sessions')
      .update({ status: 'expired' })
      .eq('owner_id', ownerId)
      .in('status', ['pending', 'in_progress'])
      .lt('expires_at', new Date().toISOString());

    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    return (data ?? []).map(mapSessionFromRow);
  }

  async findByOwnerIdFiltered(
    ownerId: string,
    options?: {
      status?: SessionStatus;
      search?: string;
      sortBy?: 'created_at' | 'expires_at' | 'tenant_name';
      sortOrder?: 'asc' | 'desc';
      page?: number;
      pageSize?: number;
    },
  ): Promise<{
    sessions: Session[];
    counts: Record<SessionStatus, number>;
    totalFiltered: number;
  }> {
    const supabase = createServiceClient();

    // 만료일 지난 pending/in_progress 세션을 expired로 자동 전환
    await supabase
      .from('sessions')
      .update({ status: 'expired' })
      .eq('owner_id', ownerId)
      .in('status', ['pending', 'in_progress'])
      .lt('expires_at', new Date().toISOString());

    // 상태별 카운트
    const { data: allRows } = await supabase
      .from('sessions')
      .select('status')
      .eq('owner_id', ownerId);

    const counts: Record<string, number> = {
      pending: 0,
      in_progress: 0,
      completed: 0,
      expired: 0,
    };
    for (const row of allRows ?? []) {
      if (row.status in counts) counts[row.status]++;
    }

    // 필터 쿼리
    let query = supabase
      .from('sessions')
      .select('*', { count: 'exact' })
      .eq('owner_id', ownerId);

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.search) {
      const term = `%${options.search}%`;
      query = query.or(`tenant_name.ilike.${term},room_number.ilike.${term}`);
    }

    const sortCol = options?.sortBy ?? 'created_at';
    const ascending = options?.sortOrder === 'asc';
    query = query.order(sortCol, { ascending });

    // 페이지네이션
    const pageSize = options?.pageSize ?? 12;
    const page = options?.page ?? 1;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, count } = await query;
    const sessions = (data ?? []).map(mapSessionFromRow);

    return {
      sessions,
      counts: counts as Record<SessionStatus, number>,
      totalFiltered: count ?? 0,
    };
  }

  async create(data: {
    ownerId: string;
    templateId?: string;
    tenantName: string;
    roomNumber?: string;
    moveInDate?: Date;
    expiresAt: Date;
    contentSnapshot: Block[];
  }): Promise<Session> {
    const supabase = createServiceClient();
    const { data: row } = await supabase
      .from('sessions')
      .insert({
        owner_id: data.ownerId,
        template_id: data.templateId ?? null,
        tenant_name: data.tenantName,
        room_number: data.roomNumber ?? null,
        move_in_date: data.moveInDate?.toISOString() ?? null,
        expires_at: data.expiresAt.toISOString(),
        content_snapshot: data.contentSnapshot,
      })
      .select()
      .single();
    return mapSessionFromRow(row);
  }

  async updateStatus(id: string, status: SessionStatus): Promise<Session> {
    const supabase = createServiceClient();
    const updateData: Record<string, unknown> = { status };
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }
    const { data: row } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    return mapSessionFromRow(row);
  }

  async delete(id: string): Promise<void> {
    const supabase = createServiceClient();
    await supabase.from('sessions').delete().eq('id', id);
  }
}

export class SessionProgressRepository implements ISessionProgressRepository {
  async findBySessionId(sessionId: string): Promise<SessionProgress | null> {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from('session_progress')
      .select('*')
      .eq('session_id', sessionId)
      .single();
    return data ? mapSessionProgressFromRow(data) : null;
  }

  async create(sessionId: string): Promise<SessionProgress> {
    const supabase = createServiceClient();
    const { data: row } = await supabase
      .from('session_progress')
      .insert({ session_id: sessionId })
      .select()
      .single();
    return mapSessionProgressFromRow(row);
  }

  async updateProgress(data: {
    sessionId: string;
    viewedSections?: string[];
    checkedItems?: string[];
    signatureName?: string;
    signatureImageUrl?: string;
    submittedAt?: Date;
  }): Promise<SessionProgress> {
    const supabase = createServiceClient();
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (data.viewedSections !== undefined) updateData.viewed_sections = data.viewedSections;
    if (data.checkedItems !== undefined) updateData.checked_items = data.checkedItems;
    if (data.signatureName !== undefined) updateData.signature_name = data.signatureName;
    if (data.signatureImageUrl !== undefined)
      updateData.signature_image_url = data.signatureImageUrl;
    if (data.submittedAt !== undefined) updateData.submitted_at = data.submittedAt.toISOString();

    const { data: row } = await supabase
      .from('session_progress')
      .update(updateData)
      .eq('session_id', data.sessionId)
      .select()
      .single();
    return mapSessionProgressFromRow(row);
  }
}
