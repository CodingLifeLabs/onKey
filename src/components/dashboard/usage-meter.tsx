'use client';

import { getSessionLimit } from '@/lib/polar';

interface UsageMeterProps {
  plan: string;
  sessionCountThisMonth: number;
}

export function UsageMeter({ plan, sessionCountThisMonth }: UsageMeterProps) {
  const limit = getSessionLimit(plan);
  const isUnlimited = !isFinite(limit);

  if (isUnlimited) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">이번 달 세션 사용량</span>
          <span className="font-medium">{sessionCountThisMonth} / 무제한</span>
        </div>
        <div className="h-2 rounded-full bg-muted">
          <div className="h-2 rounded-full bg-primary" style={{ width: '0%' }} />
        </div>
      </div>
    );
  }

  const percentage = limit > 0 ? Math.min((sessionCountThisMonth / limit) * 100, 100) : 0;
  const isNearLimit = percentage >= 80;
  const isOverLimit = sessionCountThisMonth >= limit;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          이번 달 세션 사용량
        </span>
        <span className={`font-medium ${isOverLimit ? 'text-destructive' : isNearLimit ? 'text-amber-600' : ''}`}>
          {sessionCountThisMonth} / {limit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div
          className={`h-2 rounded-full transition-all ${
            isOverLimit
              ? 'bg-destructive'
              : isNearLimit
                ? 'bg-amber-500'
                : 'bg-primary'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
