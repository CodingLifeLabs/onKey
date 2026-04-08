export type Plan = 'starter' | 'pro' | 'enterprise';

export type SubscriptionStatus =
  | 'inactive'
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'expired';

export interface SubscriptionState {
  plan: Plan;
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  polarCustomerId: string | null;
  polarSubscriptionId: string | null;
}

export type PolarEventType =
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.active'
  | 'subscription.canceled'
  | 'subscription.revoked'
  | 'subscription.uncanceled';

export interface TransitionInput {
  current: SubscriptionState;
  event: PolarEventType;
  /** Polar webhook payload에서 추출한 데이터 */
  data: {
    plan: Plan;
    customerId: string;
    subscriptionId: string;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
  };
}

export interface TransitionResult {
  plan: Plan;
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  /** polar_customer_id / polar_subscription_id 업데이트 여부 */
  updateCustomer: boolean;
}
