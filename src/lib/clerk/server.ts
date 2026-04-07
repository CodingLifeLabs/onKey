import { auth, currentUser } from '@clerk/nextjs/server';
import { createServiceClient } from '@/lib/supabase/service';
import { mapProfileFromRow } from '@/data/datasources/supabase.datasource';
import type { Profile } from '@/domain/entities/profile.entity';

export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

export async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}

export async function getCurrentUserProfile() {
  const user = await currentUser();
  if (!user) return null;

  return {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress ?? null,
    fullName: user.fullName ?? null,
    imageUrl: user.imageUrl,
  };
}

/** Clerk userId → Supabase Profile + ownerId 해결 */
export async function getOwnerProfile(): Promise<{
  profile: Profile;
  ownerId: string;
} | null> {
  const clerkUserId = await getCurrentUserId();
  if (!clerkUserId) return null;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (error || !data) return null;

  const profile = mapProfileFromRow(data);
  return { profile, ownerId: profile.id };
}
