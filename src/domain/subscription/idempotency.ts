import { createServiceClient } from '@/lib/supabase/service';

/**
 * webhook 이벤트가 이미 처리되었는지 확인.
 * 이미 처리되었으면 true 반환 (호출자는 무시해야 함).
 */
export async function isAlreadyProcessed(polarEventId: string): Promise<boolean> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('subscription_events')
    .select('id')
    .eq('polar_event_id', polarEventId)
    .single();
  return !!data;
}

/**
 * webhook 이벤트를 로그에 기록.
 * UNIQUE 제약으로 동일 polar_event_id 중복 삽입 방지.
 */
export async function recordEvent(params: {
  polarEventId: string;
  eventType: string;
  payload: Record<string, unknown>;
  profileId?: string;
}): Promise<boolean> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('subscription_events')
    .insert({
      polar_event_id: params.polarEventId,
      event_type: params.eventType,
      payload: params.payload,
      profile_id: params.profileId ?? null,
    });

  if (error) {
    // UNIQUE violation = 이미 처리됨
    if (error.code === '23505') {
      console.log(`[Idempotency] Duplicate event ${params.polarEventId}, skipping`);
      return false;
    }
    console.error(`[Idempotency] Failed to record event:`, error);
    return false;
  }

  return true;
}
