import type { Profile, PlanType } from '@/domain/entities/profile.entity';

export interface IProfileRepository {
  findByUserId(userId: string): Promise<Profile | null>;
  findByPolarCustomerId(polarCustomerId: string): Promise<Profile | null>;
  findByEmail(email: string): Promise<Profile | null>;
  findById(id: string): Promise<Profile | null>;
  create(data: {
    userId: string;
    email: string;
    fullName?: string;
  }): Promise<Profile>;
  updatePlan(id: string, plan: PlanType): Promise<Profile>;
  updateSubscription(id: string, data: {
    plan?: PlanType;
    subscriptionStatus?: string;
    polarCustomerId?: string;
    polarSubscriptionId?: string;
    currentPeriodEnd?: Date | null;
    cancelAtPeriodEnd?: boolean;
  }): Promise<Profile>;
  incrementSessionCount(id: string): Promise<void>;
  resetMonthlySessionCount(id: string): Promise<void>;
  updateProfile(id: string, data: { fullName: string }): Promise<Profile>;
}
