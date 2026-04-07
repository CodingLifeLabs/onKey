import { Polar } from '@polar-sh/sdk';

export const PLAN_LIMITS = {
  starter: 5,
  pro: 20,
  enterprise: Infinity,
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export const PLAN_DISPLAY: Record<PlanType, string> = {
  starter: 'Free',
  pro: 'Pro',
  enterprise: 'Unlimited',
};

export const PLAN_PRICES: Record<PlanType, string> = {
  starter: '무료',
  pro: '₩29,900',
  enterprise: '₩59,990',
};

export function getSessionLimit(plan: string): number {
  return PLAN_LIMITS[plan as PlanType] ?? PLAN_LIMITS.starter;
}

export function getPlanDisplayName(plan: string): string {
  return PLAN_DISPLAY[plan as PlanType] ?? 'Free';
}

export type FeatureKey =
  | 'pdf'
  | 'customTemplate'
  | 'analytics'
  | 'documentImport'
  | 'emailNotification'
  | 'customBranding';

const PRO_FEATURES: FeatureKey[] = [
  'pdf',
  'customTemplate',
  'documentImport',
  'emailNotification',
];

const ENTERPRISE_FEATURES: FeatureKey[] = ['customBranding'];

export function hasFeature(plan: string, feature: FeatureKey): boolean {
  if (PRO_FEATURES.includes(feature)) return plan === 'pro' || plan === 'enterprise';
  if (ENTERPRISE_FEATURES.includes(feature)) return plan === 'enterprise';
  return true;
}

export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: process.env.POLAR_SANDBOX === 'true' ? 'sandbox' : 'production',
});
