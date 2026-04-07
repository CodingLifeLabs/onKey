'use client';

import { Badge } from '@/components/ui/badge';

interface PlanBadgeProps {
  plan: string;
  subscriptionStatus: string | null;
}

export function PlanBadge({ plan, subscriptionStatus }: PlanBadgeProps) {
  if (subscriptionStatus === 'trialing') {
    return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Pro (체험 중)</Badge>;
  }

  if (subscriptionStatus === 'canceled' && (plan === 'pro' || plan === 'enterprise')) {
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
        {plan === 'enterprise' ? 'Unlimited' : 'Pro'} (해지 예정)
      </Badge>
    );
  }

  if (plan === 'enterprise') {
    return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Unlimited</Badge>;
  }

  if (plan === 'pro') {
    return <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Pro</Badge>;
  }

  return <Badge variant="secondary">Free</Badge>;
}
