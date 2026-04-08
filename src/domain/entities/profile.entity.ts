export type PlanType = 'starter' | 'pro' | 'enterprise';

export type SubscriptionStatusType =
  | 'inactive'
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'expired';

export interface Profile {
  id: string;
  userId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  plan: PlanType;
  subscriptionStatus: SubscriptionStatusType;
  polarCustomerId: string | null;
  polarSubscriptionId: string | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  sessionCountThisMonth: number;
  sessionResetAt: Date;
  createdAt: Date;
}
