'use server';

import { getOwnerProfile } from '@/lib/clerk/server';
import { updateProfileSchema } from '@/lib/validations/profile';
import { createServiceClient } from '@/lib/supabase/service';

export async function updateProfileAction(formData: FormData) {
  const owner = await getOwnerProfile();
  if (!owner) {
    return { error: '인증이 필요합니다' };
  }

  const raw = {
    fullName: (formData.get('fullName') as string) ?? '',
  };

  const parsed = updateProfileSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return { error: fieldErrors.fullName?.[0] ?? '입력값을 확인해주세요' };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: parsed.data.fullName })
    .eq('id', owner.profile.id);

  if (error) {
    console.error('Failed to update profile:', error);
    return { error: '프로필 업데이트에 실패했습니다' };
  }

  return { success: true };
}
