'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UsageMeter } from '@/components/dashboard/usage-meter';
import { PlanBadge } from '@/components/dashboard/plan-badge';
import { CheckCircle, Zap, ExternalLink, Crown, AlertTriangle } from 'lucide-react';

interface BillingContentProps {
  plan: string;
  subscriptionStatus: string | null;
  sessionCount: number;
  hasSubscription: boolean;
  proProductId: string | undefined;
  unlimitedProductId: string | undefined;
}

const PLANS = [
  {
    id: 'starter',
    name: 'Free',
    price: '무료',
    period: '',
    limit: '월 5개 세션',
    features: ['세션 생성 및 공유', '기본 템플릿', 'QR 코드 생성', '전체 에디터 기능'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₩29,900',
    period: '/월',
    limit: '월 20개 세션',
    features: ['Free 전체 기능', '커스텀 템플릿 무제한', 'PDF 완료 확인서', '문서 가져오기', '이메일 발송'],
  },
  {
    id: 'enterprise',
    name: 'Unlimited',
    price: '₩59,990',
    period: '/월',
    limit: '무제한 세션',
    features: ['Pro 전체 기능', '세션 무제한 생성', '커스텀 브랜딩', '전용 지원'],
  },
] as const;

export function BillingContent({
  plan,
  subscriptionStatus,
  sessionCount,
  hasSubscription,
  proProductId,
  unlimitedProductId,
}: BillingContentProps) {
  const isTrialing = subscriptionStatus === 'trialing';
  const isPastDue = subscriptionStatus === 'past_due';
  const isCanceled = subscriptionStatus === 'canceled';
  const isPaidPlan = plan === 'pro' || plan === 'enterprise';

  const getProductId = (planId: string) => {
    if (planId === 'pro') return proProductId;
    if (planId === 'enterprise') return unlimitedProductId;
    return undefined;
  };

  const getCheckoutUrl = (planId: string) => {
    const productId = getProductId(planId);
    if (!productId) return '#';
    return `/api/checkout?products=${productId}`;
  };

  return (
    <>
      {/* 상태 경고 */}
      {isPastDue && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">결제가 필요합니다</p>
            <p className="text-sm text-amber-600">구독 결제가 처리되지 않았습니다. 결제 수단을 확인해주세요.</p>
          </div>
        </div>
      )}

      {isCanceled && isPaidPlan && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">구독 해지 예정</p>
            <p className="text-sm text-amber-600">현재 기간 종료 후 Free 플랜으로 전환됩니다.</p>
          </div>
        </div>
      )}

      {/* 현재 플랜 & 사용량 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">현재 요금제</h3>
          <PlanBadge plan={plan} subscriptionStatus={subscriptionStatus} />
        </div>
        <UsageMeter plan={plan} sessionCountThisMonth={sessionCount} />
      </div>

      {/* 플랜 카드 — 3열 */}
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => {
          const isCurrent = plan === p.id && !isTrialing;
          const canUpgrade = !isCurrent && !isTrialing && p.id !== 'starter';
          const showPortal = (plan === p.id || isTrialing) && isPaidPlan && p.id === plan;

          return (
            <Card
              key={p.id}
              className={`${isCurrent ? 'ring-2 ring-primary' : ''} ${p.id === 'enterprise' ? 'border-primary/30' : ''}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-1.5">
                    {p.name}
                    {p.id === 'enterprise' && <Crown className="h-4 w-4 text-amber-500" />}
                  </CardTitle>
                  {isCurrent && (
                    <Badge variant="secondary" className="text-xs">현재 플랜</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-2xl font-bold">{p.price}</span>
                  {p.period && (
                    <span className="text-sm text-muted-foreground">{p.period}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{p.limit}</p>
                <ul className="space-y-2">
                  {p.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {canUpgrade && getProductId(p.id) && (
                  <a
                    href={getCheckoutUrl(p.id)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4"
                  >
                    <Zap className="h-4 w-4" />
                    업그레이드
                  </a>
                )}
                {showPortal && hasSubscription && (
                  <a
                    href="/api/portal"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-9 px-4"
                  >
                    <ExternalLink className="h-4 w-4" />
                    결제 관리
                  </a>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
