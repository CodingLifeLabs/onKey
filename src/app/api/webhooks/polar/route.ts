import { Webhooks } from '@polar-sh/nextjs';
import { createServiceClient } from '@/lib/supabase/service';
import { applyTransition, recordEvent } from '@/domain/subscription';
import type { Plan, PolarEventType, SubscriptionState } from '@/domain/subscription';
import { revalidatePath } from 'next/cache';

const PRO_PRODUCT_ID = process.env.POLAR_PRO_PRODUCT_ID!;
const UNLIMITED_PRODUCT_ID = process.env.POLAR_UNLIMITED_PRODUCT_ID!;

function mapProductIdToPlan(productId: string): Plan {
  if (productId === UNLIMITED_PRODUCT_ID) return 'enterprise';
  if (productId === PRO_PRODUCT_ID) return 'pro';
  return 'starter';
}

async function findProfile(
  customerId: string,
  customerEmail?: string | null,
  metadata?: Record<string, unknown> | null,
) {
  const supabase = createServiceClient();

  // 1. polar_customer_id로 조회
  const { data: byId } = await supabase
    .from('profiles')
    .select('*')
    .eq('polar_customer_id', customerId)
    .single();

  if (byId) return byId;

  // 2. 이메일로 fallback + polar_customer_id 저장
  if (customerEmail) {
    const { data: byEmail } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', customerEmail)
      .single();

    if (byEmail) {
      await supabase
        .from('profiles')
        .update({ polar_customer_id: customerId })
        .eq('id', byEmail.id);
      console.log(`Linked polar_customer_id ${customerId} to profile ${byEmail.id} via email`);
      return byEmail;
    }
  }

  // 3. metadata의 userId로 fallback + polar_customer_id 저장
  if (metadata?.userId) {
    const { data: byUserId } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', metadata.userId as string)
      .single();

    if (byUserId) {
      await supabase
        .from('profiles')
        .update({ polar_customer_id: customerId })
        .eq('id', byUserId.id);
      console.log(`Linked polar_customer_id ${customerId} to profile ${byUserId.id} via userId`);
      return byUserId;
    }
  }

  return null;
}

function extractEventData(payload: { data: Record<string, unknown> }) {
  const data = payload.data;
  const customerEmail = (data.customer as { email?: string } | undefined)?.email ?? null;
  const metadata = data.metadata as Record<string, unknown> | undefined | null;
  return { data, customerEmail, metadata };
}

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

  onSubscriptionCreated: async (payload) => {
    const { data, customerEmail, metadata } = extractEventData(payload);
    const plan = mapProductIdToPlan(data.productId as string);

    // 멱등성 체크
    const eventId = `sub_created_${data.id}`;
    const recorded = await recordEvent({
      polarEventId: eventId,
      eventType: 'subscription.created',
      payload: data,
    });
    if (!recorded) return;

    const profile = await findProfile(data.customerId as string, customerEmail, metadata);
    if (!profile) return;

    // 상태 머신 적용
    const currentState: SubscriptionState = {
      plan: profile.plan as Plan,
      status: profile.subscription_status as SubscriptionState['status'],
      currentPeriodEnd: profile.current_period_end ? new Date(profile.current_period_end) : null,
      cancelAtPeriodEnd: profile.cancel_at_period_end ?? false,
      polarCustomerId: profile.polar_customer_id,
      polarSubscriptionId: profile.polar_subscription_id,
    };

    const result = applyTransition({
      current: currentState,
      event: 'subscription.created',
      data: {
        plan,
        customerId: data.customerId as string,
        subscriptionId: data.id as string,
        currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd as string) : null,
        cancelAtPeriodEnd: false,
      },
    });

    if (!result) return;

    const supabase = createServiceClient();
    await supabase
      .from('profiles')
      .update({
        plan: result.plan,
        subscription_status: result.status,
        polar_customer_id: data.customerId,
        polar_subscription_id: data.id,
        current_period_end: result.currentPeriodEnd?.toISOString() ?? null,
        cancel_at_period_end: result.cancelAtPeriodEnd,
      })
      .eq('id', profile.id);

    console.log(`subscription.created: profile ${profile.id} → ${result.plan} (${result.status})`);
    revalidatePath('/settings/billing');
    revalidatePath('/home');
  },

  onSubscriptionUpdated: async (payload) => {
    const { data, customerEmail, metadata } = extractEventData(payload);
    const plan = mapProductIdToPlan(data.productId as string);

    const eventId = `sub_updated_${data.id}`;
    const recorded = await recordEvent({
      polarEventId: eventId,
      eventType: 'subscription.updated',
      payload: data,
    });
    if (!recorded) return;

    const profile = await findProfile(data.customerId as string, customerEmail, metadata);
    if (!profile) return;

    const currentState: SubscriptionState = {
      plan: profile.plan as Plan,
      status: profile.subscription_status as SubscriptionState['status'],
      currentPeriodEnd: profile.current_period_end ? new Date(profile.current_period_end) : null,
      cancelAtPeriodEnd: profile.cancel_at_period_end ?? false,
      polarCustomerId: profile.polar_customer_id,
      polarSubscriptionId: profile.polar_subscription_id,
    };

    const result = applyTransition({
      current: currentState,
      event: 'subscription.updated',
      data: {
        plan,
        customerId: data.customerId as string,
        subscriptionId: data.id as string,
        currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd as string) : null,
        cancelAtPeriodEnd: false,
      },
    });

    if (!result) return;

    const supabase = createServiceClient();
    await supabase
      .from('profiles')
      .update({
        plan: result.plan,
        subscription_status: result.status,
        polar_customer_id: data.customerId,
        polar_subscription_id: data.id,
        current_period_end: result.currentPeriodEnd?.toISOString() ?? null,
        cancel_at_period_end: result.cancelAtPeriodEnd,
      })
      .eq('id', profile.id);

    console.log(`subscription.updated: profile ${profile.id} → ${result.plan} (${result.status})`);
    revalidatePath('/settings/billing');
    revalidatePath('/home');
  },

  onSubscriptionActive: async (payload) => {
    const { data, customerEmail, metadata } = extractEventData(payload);
    const plan = mapProductIdToPlan(data.productId as string);

    const eventId = `sub_active_${data.id}`;
    const recorded = await recordEvent({
      polarEventId: eventId,
      eventType: 'subscription.active',
      payload: data,
    });
    if (!recorded) return;

    const profile = await findProfile(data.customerId as string, customerEmail, metadata);
    if (!profile) return;

    const currentState: SubscriptionState = {
      plan: profile.plan as Plan,
      status: profile.subscription_status as SubscriptionState['status'],
      currentPeriodEnd: profile.current_period_end ? new Date(profile.current_period_end) : null,
      cancelAtPeriodEnd: profile.cancel_at_period_end ?? false,
      polarCustomerId: profile.polar_customer_id,
      polarSubscriptionId: profile.polar_subscription_id,
    };

    const result = applyTransition({
      current: currentState,
      event: 'subscription.active',
      data: {
        plan,
        customerId: data.customerId as string,
        subscriptionId: data.id as string,
        currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd as string) : null,
        cancelAtPeriodEnd: false,
      },
    });

    if (!result) return;

    const supabase = createServiceClient();
    await supabase
      .from('profiles')
      .update({
        plan: result.plan,
        subscription_status: result.status,
        polar_customer_id: data.customerId,
        polar_subscription_id: data.id,
        current_period_end: result.currentPeriodEnd?.toISOString() ?? null,
        cancel_at_period_end: false,
      })
      .eq('id', profile.id);

    console.log(`subscription.active: profile ${profile.id} → ${result.plan} (${result.status})`);
    revalidatePath('/settings/billing');
    revalidatePath('/home');
  },

  onSubscriptionCanceled: async (payload) => {
    const { data, customerEmail, metadata } = extractEventData(payload);

    const eventId = `sub_canceled_${data.id}`;
    const recorded = await recordEvent({
      polarEventId: eventId,
      eventType: 'subscription.canceled',
      payload: data,
    });
    if (!recorded) return;

    const profile = await findProfile(data.customerId as string, customerEmail, metadata);
    if (!profile) return;

    const currentState: SubscriptionState = {
      plan: profile.plan as Plan,
      status: profile.subscription_status as SubscriptionState['status'],
      currentPeriodEnd: profile.current_period_end ? new Date(profile.current_period_end) : null,
      cancelAtPeriodEnd: profile.cancel_at_period_end ?? false,
      polarCustomerId: profile.polar_customer_id,
      polarSubscriptionId: profile.polar_subscription_id,
    };

    const result = applyTransition({
      current: currentState,
      event: 'subscription.canceled',
      data: {
        plan: profile.plan as Plan,
        customerId: data.customerId as string,
        subscriptionId: data.id as string,
        currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd as string) : null,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd as boolean ?? false,
      },
    });

    if (!result) return;

    const supabase = createServiceClient();
    await supabase
      .from('profiles')
      .update({
        plan: result.plan,
        subscription_status: result.status,
        current_period_end: result.currentPeriodEnd?.toISOString() ?? null,
        cancel_at_period_end: result.cancelAtPeriodEnd,
      })
      .eq('id', profile.id);

    console.log(`subscription.canceled: profile ${profile.id} → ${result.plan} (${result.status})`);
    revalidatePath('/settings/billing');
    revalidatePath('/home');
  },

  onSubscriptionRevoked: async (payload) => {
    const { data, customerEmail, metadata } = extractEventData(payload);

    const eventId = `sub_revoked_${data.id}`;
    const recorded = await recordEvent({
      polarEventId: eventId,
      eventType: 'subscription.revoked',
      payload: data,
    });
    if (!recorded) return;

    const profile = await findProfile(data.customerId as string, customerEmail, metadata);
    if (!profile) return;

    const currentState: SubscriptionState = {
      plan: profile.plan as Plan,
      status: profile.subscription_status as SubscriptionState['status'],
      currentPeriodEnd: profile.current_period_end ? new Date(profile.current_period_end) : null,
      cancelAtPeriodEnd: profile.cancel_at_period_end ?? false,
      polarCustomerId: profile.polar_customer_id,
      polarSubscriptionId: profile.polar_subscription_id,
    };

    const result = applyTransition({
      current: currentState,
      event: 'subscription.revoked',
      data: {
        plan: 'starter',
        customerId: data.customerId as string,
        subscriptionId: data.id as string,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      },
    });

    if (!result) return;

    const supabase = createServiceClient();
    await supabase
      .from('profiles')
      .update({
        plan: 'starter',
        subscription_status: 'expired',
        cancel_at_period_end: false,
        current_period_end: null,
      })
      .eq('id', profile.id);

    console.log(`subscription.revoked: profile ${profile.id} → starter (expired)`);
    revalidatePath('/settings/billing');
    revalidatePath('/home');
  },

  onSubscriptionUncanceled: async (payload) => {
    const { data, customerEmail, metadata } = extractEventData(payload);
    const plan = mapProductIdToPlan(data.productId as string);

    const eventId = `sub_uncanceled_${data.id}`;
    const recorded = await recordEvent({
      polarEventId: eventId,
      eventType: 'subscription.uncanceled',
      payload: data,
    });
    if (!recorded) return;

    const profile = await findProfile(data.customerId as string, customerEmail, metadata);
    if (!profile) return;

    const currentState: SubscriptionState = {
      plan: profile.plan as Plan,
      status: profile.subscription_status as SubscriptionState['status'],
      currentPeriodEnd: profile.current_period_end ? new Date(profile.current_period_end) : null,
      cancelAtPeriodEnd: profile.cancel_at_period_end ?? false,
      polarCustomerId: profile.polar_customer_id,
      polarSubscriptionId: profile.polar_subscription_id,
    };

    const result = applyTransition({
      current: currentState,
      event: 'subscription.uncanceled',
      data: {
        plan,
        customerId: data.customerId as string,
        subscriptionId: data.id as string,
        currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd as string) : null,
        cancelAtPeriodEnd: false,
      },
    });

    if (!result) return;

    const supabase = createServiceClient();
    await supabase
      .from('profiles')
      .update({
        plan: result.plan,
        subscription_status: 'active',
        polar_subscription_id: data.id,
        current_period_end: result.currentPeriodEnd?.toISOString() ?? null,
        cancel_at_period_end: false,
      })
      .eq('id', profile.id);

    console.log(`subscription.uncanceled: profile ${profile.id} → ${result.plan} (active)`);
    revalidatePath('/settings/billing');
    revalidatePath('/home');
  },

  onOrderCreated: async (payload) => {
    console.log(`order.created: customer ${payload.data.customerId}`);
  },

  onOrderPaid: async (payload) => {
    console.log(`order.paid: customer ${payload.data.customerId}, order ${payload.data.id}`);
  },

  onOrderRefunded: async (payload) => {
    const data = payload.data;
    console.log(`order.refunded: customer ${data.customerId}, order ${data.id}`);

    // 환불 발생 → 구독을 즉시 starter로 다운그레이드
    const profile = await findProfile(
      data.customerId as string,
      (data.customer as { email?: string } | undefined)?.email ?? null,
      data.metadata as Record<string, unknown> | null,
    );
    if (!profile) return;

    const supabase = createServiceClient();
    await supabase
      .from('profiles')
      .update({
        plan: 'starter',
        subscription_status: 'expired',
        cancel_at_period_end: false,
        current_period_end: null,
      })
      .eq('id', profile.id);

    console.log(`order.refunded: profile ${profile.id} → starter (expired)`);
  },

  onRefundCreated: async (payload) => {
    console.log(`refund.created: ${payload.data.id}, subscription ${payload.data.subscriptionId}`);
  },
});
