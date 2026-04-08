import { CustomerPortal } from '@polar-sh/nextjs';
import { getCurrentUserId } from '@/lib/auth/server';
import { createServiceClient } from '@/lib/supabase/service';

export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  getCustomerId: async () => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('인증이 필요합니다');

    const supabase = createServiceClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('polar_customer_id')
      .eq('user_id', userId)
      .single();

    if (!profile?.polar_customer_id) {
      throw new Error('고객 정보를 찾을 수 없습니다');
    }

    return profile.polar_customer_id;
  },
  returnUrl: process.env.NEXT_PUBLIC_APP_URL + '/settings/billing',
  server: process.env.POLAR_SANDBOX === 'true' ? 'sandbox' : 'production',
});
