import { createClient } from '@/lib/supabase/server';
import { mapProfileFromRow } from '@/data/datasources/supabase.datasource';
import type { Profile } from '@/domain/entities/profile.entity';

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}

/** Supabase auth.uid → profiles 조회 */
export async function getOwnerProfile(): Promise<{
  profile: Profile;
  ownerId: string;
} | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;

  const profile = mapProfileFromRow(data);
  return { profile, ownerId: profile.id };
}

/** 클라이언트에서 사용할 사용자 메타데이터 */
export async function getCurrentUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  return {
    id: user.id,
    email: user.email ?? null,
    fullName: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
    avatarUrl: user.user_metadata?.avatar_url ?? null,
  };
}
