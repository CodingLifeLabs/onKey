'use server';

import { getOwnerProfile } from '@/lib/auth/server';

export async function getUserPlan(): Promise<string> {
  const owner = await getOwnerProfile();
  return owner?.profile.plan ?? 'starter';
}
