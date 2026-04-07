import type { IProfileRepository } from '@/domain/repositories/profile.repository';
import type { Profile, PlanType } from '@/domain/entities/profile.entity';
import { createServiceClient } from '@/lib/supabase/service';
import { mapProfileFromRow } from '@/data/datasources/supabase.datasource';

export class ProfileRepository implements IProfileRepository {
  async findByClerkUserId(clerkUserId: string): Promise<Profile | null> {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single();
    return data ? mapProfileFromRow(data) : null;
  }

  async findById(id: string): Promise<Profile | null> {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    return data ? mapProfileFromRow(data) : null;
  }

  async create(data: {
    clerkUserId: string;
    email: string;
    fullName?: string;
  }): Promise<Profile> {
    const supabase = createServiceClient();
    const { data: row } = await supabase
      .from('profiles')
      .insert({
        clerk_user_id: data.clerkUserId,
        email: data.email,
        full_name: data.fullName ?? null,
      })
      .select()
      .single();
    return mapProfileFromRow(row);
  }

  async updatePlan(id: string, plan: PlanType): Promise<Profile> {
    const supabase = createServiceClient();
    const { data: row } = await supabase
      .from('profiles')
      .update({ plan })
      .eq('id', id)
      .select()
      .single();
    return mapProfileFromRow(row);
  }

  async updateSubscription(id: string, data: {
    plan: PlanType;
    polarSubscriptionId?: string;
    subscriptionStatus?: string;
    currentPeriodEnd?: Date | null;
    cancelAtPeriodEnd?: boolean;
  }): Promise<Profile> {
    const supabase = createServiceClient();
    const updateData: Record<string, unknown> = { plan: data.plan };
    if (data.polarSubscriptionId !== undefined) {
      updateData.polar_subscription_id = data.polarSubscriptionId;
    }
    if (data.subscriptionStatus !== undefined) {
      updateData.subscription_status = data.subscriptionStatus;
    }
    if (data.currentPeriodEnd !== undefined) {
      updateData.current_period_end = data.currentPeriodEnd?.toISOString() ?? null;
    }
    if (data.cancelAtPeriodEnd !== undefined) {
      updateData.cancel_at_period_end = data.cancelAtPeriodEnd;
    }
    const { data: row } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    return mapProfileFromRow(row);
  }

  async incrementSessionCount(id: string): Promise<void> {
    const supabase = createServiceClient();
    await supabase.rpc('increment_session_count', { profile_id: id });
  }

  async resetMonthlySessionCount(id: string): Promise<void> {
    const supabase = createServiceClient();
    await supabase
      .from('profiles')
      .update({
        session_count_this_month: 0,
        session_reset_at: new Date().toISOString(),
      })
      .eq('id', id);
  }

  async updateProfile(id: string, data: { fullName: string }): Promise<Profile> {
    const supabase = createServiceClient();
    const { data: row } = await supabase
      .from('profiles')
      .update({ full_name: data.fullName })
      .eq('id', id)
      .select()
      .single();
    return mapProfileFromRow(row);
  }
}
