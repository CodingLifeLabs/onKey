import { Webhooks } from '@polar-sh/nextjs';
import { createServiceClient } from '@/lib/supabase/service';

const PRO_PRODUCT_ID = process.env.POLAR_PRO_PRODUCT_ID!;
const UNLIMITED_PRODUCT_ID = process.env.POLAR_UNLIMITED_PRODUCT_ID!;

function mapProductIdToPlan(productId: string): 'starter' | 'pro' | 'enterprise' {
  if (productId === UNLIMITED_PRODUCT_ID) return 'enterprise';
  if (productId === PRO_PRODUCT_ID) return 'pro';
  return 'starter';
}

async function findProfile(customerId: string, customerEmail?: string | null) {
  const supabase = createServiceClient();

  // 1. polar_customer_id로 조회
  const { data: byId } = await supabase
    .from('profiles')
    .select('id')
    .eq('polar_customer_id', customerId)
    .single();

  if (byId) return byId;

  // 2. 이메일로 fallback + polar_customer_id 저장
  if (customerEmail) {
    const { data: byEmail } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', customerEmail)
      .single();

    if (byEmail) {
      await supabase
        .from('profiles')
        .update({ polar_customer_id: customerId })
        .eq('id', byEmail.id);
      console.log(`Linked polar_customer_id ${customerId} to profile ${byEmail.id}`);
      return byEmail;
    }
  }

  return null;
}

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onSubscriptionCreated: async (payload) => {
    const data = payload.data;
    const plan = mapProductIdToPlan(data.productId);
    const customerEmail = (data.customer as { email?: string } | undefined)?.email ?? null;

    const profile = await findProfile(data.customerId, customerEmail);
    if (!profile) return;

    const supabase = createServiceClient();
    await supabase
      .from('profiles')
      .update({
        plan,
        polar_subscription_id: data.id,
        subscription_status: data.status,
      })
      .eq('id', profile.id);

    console.log(`subscription.created: profile ${profile.id} → ${plan} (${data.status})`);
  },

  onSubscriptionUpdated: async (payload) => {
    const data = payload.data;
    const plan = mapProductIdToPlan(data.productId);
    const customerEmail = (data.customer as { email?: string } | undefined)?.email ?? null;

    const profile = await findProfile(data.customerId, customerEmail);
    if (!profile) return;

    const supabase = createServiceClient();
    await supabase
      .from('profiles')
      .update({
        plan,
        polar_subscription_id: data.id,
        subscription_status: data.status,
      })
      .eq('id', profile.id);

    console.log(`subscription.updated: profile ${profile.id} → ${plan} (${data.status})`);
  },

  onSubscriptionActive: async (payload) => {
    const data = payload.data;
    const plan = mapProductIdToPlan(data.productId);
    const customerEmail = (data.customer as { email?: string } | undefined)?.email ?? null;

    const profile = await findProfile(data.customerId, customerEmail);
    if (!profile) return;

    const supabase = createServiceClient();
    await supabase
      .from('profiles')
      .update({
        plan,
        polar_subscription_id: data.id,
        subscription_status: 'active',
      })
      .eq('id', profile.id);

    console.log(`subscription.active: profile ${profile.id} → ${plan}`);
  },

  onSubscriptionCanceled: async (payload) => {
    const data = payload.data;
    const customerEmail = (data.customer as { email?: string } | undefined)?.email ?? null;

    const profile = await findProfile(data.customerId, customerEmail);
    if (!profile) return;

    const supabase = createServiceClient();
    if (data.cancelAtPeriodEnd) {
      // 기간 종료까지 현재 플랜 유지
      await supabase
        .from('profiles')
        .update({ subscription_status: 'canceled' })
        .eq('id', profile.id);
      console.log(`subscription.canceled (end of period): profile ${profile.id}`);
    } else {
      // 즉시 다운그레이드
      await supabase
        .from('profiles')
        .update({ plan: 'starter', subscription_status: 'canceled' })
        .eq('id', profile.id);
      console.log(`subscription.canceled (immediate): profile ${profile.id} → starter`);
    }
  },

  onSubscriptionRevoked: async (payload) => {
    const data = payload.data;
    const customerEmail = (data.customer as { email?: string } | undefined)?.email ?? null;

    const profile = await findProfile(data.customerId, customerEmail);
    if (!profile) return;

    const supabase = createServiceClient();
    await supabase
      .from('profiles')
      .update({ plan: 'starter', subscription_status: 'canceled' })
      .eq('id', profile.id);

    console.log(`subscription.revoked: profile ${profile.id} → starter`);
  },

  onSubscriptionUncanceled: async (payload) => {
    const data = payload.data;
    const plan = mapProductIdToPlan(data.productId);
    const customerEmail = (data.customer as { email?: string } | undefined)?.email ?? null;

    const profile = await findProfile(data.customerId, customerEmail);
    if (!profile) return;

    const supabase = createServiceClient();
    await supabase
      .from('profiles')
      .update({
        plan,
        polar_subscription_id: data.id,
        subscription_status: 'active',
      })
      .eq('id', profile.id);

    console.log(`subscription.uncanceled: profile ${profile.id} → ${plan} (active)`);
  },

  onOrderCreated: async (payload) => {
    console.log(`order.created: customer ${payload.data.customerId}`);
  },
});
