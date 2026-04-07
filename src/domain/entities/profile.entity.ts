export type PlanType = 'starter' | 'pro' | 'enterprise';

export interface Profile {
  id: string;
  clerkUserId: string;
  email: string;
  fullName: string | null;
  plan: PlanType;
  polarCustomerId: string | null;
  polarSubscriptionId: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  sessionCountThisMonth: number;
  sessionResetAt: Date;
  createdAt: Date;
}
