import type { Profile, PlanType } from '@/domain/entities/profile.entity';
import type { Template } from '@/domain/entities/template.entity';
import type { Session, SessionStatus } from '@/domain/entities/session.entity';
import type { SessionProgress } from '@/domain/entities/session-progress.entity';
import type { Block } from '@/types/block';

// Supabase row → Domain entity 매핑 유틸리티

export function mapProfileFromRow(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    clerkUserId: row.clerk_user_id as string,
    email: row.email as string,
    fullName: (row.full_name as string) ?? null,
    plan: (row.plan as PlanType) ?? 'starter',
    polarCustomerId: (row.polar_customer_id as string) ?? null,
    polarSubscriptionId: (row.polar_subscription_id as string) ?? null,
    subscriptionStatus: (row.subscription_status as string) ?? null,
    currentPeriodEnd: row.current_period_end ? new Date(row.current_period_end as string) : null,
    cancelAtPeriodEnd: (row.cancel_at_period_end as boolean) ?? false,
    sessionCountThisMonth: (row.session_count_this_month as number) ?? 0,
    sessionResetAt: new Date(row.session_reset_at as string),
    createdAt: new Date(row.created_at as string),
  };
}

export function mapTemplateFromRow(row: Record<string, unknown>): Template {
  return {
    id: row.id as string,
    ownerId: row.owner_id as string,
    name: row.name as string,
    description: (row.description as string) ?? null,
    isSystem: (row.is_system as boolean) ?? false,
    content: (row.content as Block[]) ?? [],
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

export function mapSessionFromRow(row: Record<string, unknown>): Session {
  return {
    id: row.id as string,
    ownerId: row.owner_id as string,
    templateId: (row.template_id as string) ?? null,
    token: row.token as string,
    tenantName: row.tenant_name as string,
    roomNumber: (row.room_number as string) ?? null,
    moveInDate: row.move_in_date ? new Date(row.move_in_date as string) : null,
    expiresAt: new Date(row.expires_at as string),
    status: row.status as SessionStatus,
    contentSnapshot: (row.content_snapshot as Block[]) ?? [],
    tenantIp: (row.tenant_ip as string) ?? null,
    createdAt: new Date(row.created_at as string),
    completedAt: row.completed_at ? new Date(row.completed_at as string) : null,
  };
}

export function mapSessionProgressFromRow(row: Record<string, unknown>): SessionProgress {
  return {
    id: row.id as string,
    sessionId: row.session_id as string,
    viewedSections: (row.viewed_sections as string[]) ?? [],
    checkedItems: (row.checked_items as string[]) ?? [],
    signatureName: (row.signature_name as string) ?? null,
    signatureImageUrl: (row.signature_image_url as string) ?? null,
    submittedAt: row.submitted_at ? new Date(row.submitted_at as string) : null,
    updatedAt: new Date(row.updated_at as string),
  };
}
