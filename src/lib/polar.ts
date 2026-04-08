import { Polar } from '@polar-sh/sdk';
import { PLAN_LIMITS, PLAN_DISPLAY, getSessionLimit, getPlanDisplayName, hasFeature, hasAccess, canCreateSession } from '@/domain/subscription';
import type { Plan as PlanType } from '@/domain/subscription';
import type { FeatureKey } from '@/domain/subscription';

export {
  PLAN_LIMITS,
  PLAN_DISPLAY,
  getSessionLimit,
  getPlanDisplayName,
  hasFeature,
  hasAccess,
  canCreateSession,
};
export type { PlanType, FeatureKey };

export const PLAN_PRICES: Record<PlanType, string> = {
  starter: '무료',
  pro: '₩29,900',
  enterprise: '₩59,990',
};

export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: process.env.POLAR_SANDBOX === 'true' ? 'sandbox' : 'production',
});
