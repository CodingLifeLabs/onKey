'use server';

import { getOwnerProfile } from '@/lib/clerk/server';

export async function getUserPlan(): Promise<string> {
  const owner = await getOwnerProfile();
  return owner?.profile.plan ?? 'starter';
}
