import type {
  SubscriptionState,
  SubscriptionStatus,
  PolarEventType,
  TransitionInput,
  TransitionResult,
  Plan,
} from './types';

type TransitionRule = {
  from: SubscriptionStatus[];
  event: PolarEventType;
  to: SubscriptionStatus;
  resolvePlan: (currentPlan: Plan, eventPlan: Plan) => Plan;
  resolvePeriodEnd: (input: TransitionInput) => Date | null;
  resolveCancelAtPeriodEnd: (input: TransitionInput) => boolean;
};

const RULES: TransitionRule[] = [
  // subscription.created → 첫 구독 (inactive/trialing)
  {
    from: ['inactive'],
    event: 'subscription.created',
    to: 'active',
    resolvePlan: (_current, eventPlan) => eventPlan,
    resolvePeriodEnd: (input) => input.data.currentPeriodEnd,
    resolveCancelAtPeriodEnd: () => false,
  },

  // subscription.active → 체험→유료 전환 또는 일반 활성화
  {
    from: ['trialing', 'inactive', 'past_due', 'active'],
    event: 'subscription.active',
    to: 'active',
    resolvePlan: (_current, eventPlan) => eventPlan,
    resolvePeriodEnd: (input) => input.data.currentPeriodEnd,
    resolveCancelAtPeriodEnd: () => false,
  },

  // subscription.updated → 플랜 변경
  {
    from: ['active', 'trialing'],
    event: 'subscription.updated',
    to: 'active',
    resolvePlan: (_current, eventPlan) => eventPlan,
    resolvePeriodEnd: (input) => input.data.currentPeriodEnd,
    resolveCancelAtPeriodEnd: () => false,
  },

  // subscription.canceled (cancelAtPeriodEnd = true) → 기간 끝까지 유지
  {
    from: ['active', 'trialing', 'past_due'],
    event: 'subscription.canceled',
    to: 'canceled',
    resolvePlan: (currentPlan, _eventPlan) => currentPlan,
    resolvePeriodEnd: (input) => input.data.currentPeriodEnd,
    resolveCancelAtPeriodEnd: () => true,
  },

  // subscription.revoked → 즉시 만료
  {
    from: ['active', 'trialing', 'past_due', 'canceled'],
    event: 'subscription.revoked',
    to: 'expired',
    resolvePlan: () => 'starter',
    resolvePeriodEnd: () => null,
    resolveCancelAtPeriodEnd: () => false,
  },

  // subscription.uncanceled → 취소 철회, active 복원
  {
    from: ['canceled'],
    event: 'subscription.uncanceled',
    to: 'active',
    resolvePlan: (_current, eventPlan) => eventPlan,
    resolvePeriodEnd: (input) => input.data.currentPeriodEnd,
    resolveCancelAtPeriodEnd: () => false,
  },
];

/**
 * 상태 전이 적용.
 * 유효하지 않은 전이면 null 반환 (무시해야 함).
 */
export function applyTransition(input: TransitionInput): TransitionResult | null {
  const rule = RULES.find(
    (r) => r.event === input.event && r.from.includes(input.current.status),
  );

  if (!rule) {
    console.warn(
      `[SubscriptionStateMachine] Invalid transition: ${input.current.status} + ${input.event}`,
    );
    return null;
  }

  return {
    plan: rule.resolvePlan(input.current.plan, input.data.plan),
    status: rule.to,
    currentPeriodEnd: rule.resolvePeriodEnd(input),
    cancelAtPeriodEnd: rule.resolveCancelAtPeriodEnd(input),
    updateCustomer: true,
  };
}
