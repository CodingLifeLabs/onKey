import type { Profile, PlanType } from '@/domain/entities/profile.entity';

export interface IProfileRepository {
  findByClerkUserId(clerkUserId: string): Promise<Profile | null>;
  findById(id: string): Promise<Profile | null>;
  create(data: {
    clerkUserId: string;
    email: string;
    fullName?: string;
  }): Promise<Profile>;
  updatePlan(id: string, plan: PlanType): Promise<Profile>;
  updateSubscription(id: string, data: {
    plan: PlanType;
    polarSubscriptionId?: string;
    subscriptionStatus?: string;
  }): Promise<Profile>;
  incrementSessionCount(id: string): Promise<void>;
  resetMonthlySessionCount(id: string): Promise<void>;
  updateProfile(id: string, data: { fullName: string }): Promise<Profile>;
}
