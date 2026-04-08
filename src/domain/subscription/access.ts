import type { Plan, SubscriptionStatus } from './types';

export type FeatureKey =
  | 'pdf'
  | 'customTemplate'
  | 'analytics'
  | 'documentImport'
  | 'customBranding';

const PRO_FEATURES: FeatureKey[] = [
  'pdf',
  'customTemplate',
  'documentImport',
];

const ENTERPRISE_FEATURES: FeatureKey[] = ['customBranding'];

/**
 * 사용자가 현재 유료 기능에 접근할 수 있는지 판단.
 * 서버에서만 호출해야 함 (클라이언트 신뢰 금지).
 */
export function hasAccess(plan: Plan, status: SubscriptionStatus): boolean {
  if (plan === 'starter') return true;
  return status === 'active' || status === 'trialing';
}

/**
 * 특정 기능에 대한 접근 권한 판단.
 */
export function hasFeature(plan: Plan, status: SubscriptionStatus, feature: FeatureKey): boolean {
  if (!hasAccess(plan, status)) return false;
  if (ENTERPRISE_FEATURES.includes(feature)) return plan === 'enterprise';
  if (PRO_FEATURES.includes(feature)) return plan === 'pro' || plan === 'enterprise';
  return true;
}

/**
 * 세션 생성 가능 여부
 */
export function canCreateSession(plan: Plan, status: SubscriptionStatus, currentCount: number): boolean {
  if (!hasAccess(plan, status) && plan !== 'starter') return false;

  const limits: Record<Plan, number> = {
    starter: 5,
    pro: 20,
    enterprise: Infinity,
  };

  return currentCount < limits[plan];
}

export const PLAN_LIMITS: Record<Plan, number> = {
  starter: 5,
  pro: 20,
  enterprise: Infinity,
};

export const PLAN_DISPLAY: Record<Plan, string> = {
  starter: 'Free',
  pro: 'Pro',
  enterprise: 'Unlimited',
};

export function getSessionLimit(plan: string): number {
  return PLAN_LIMITS[plan as Plan] ?? PLAN_LIMITS.starter;
}

export function getPlanDisplayName(plan: string): string {
  return PLAN_DISPLAY[plan as Plan] ?? 'Free';
}
