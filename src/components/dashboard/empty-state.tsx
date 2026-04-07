import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, Crown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon = FileText,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm leading-relaxed">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button className="mt-6">{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}

export function EmptyNoSessions() {
  return (
    <EmptyState
      icon={FileText}
      title="첫 입주 세션 만들기"
      description="새로운 입주자를 위한 세션을 생성하여 체크리스트와 필요한 정보를 안내하세요."
      actionLabel="첫 번째 세션 생성하기"
      actionHref="/sessions/new"
    />
  );
}

export function EmptyNoCompleted() {
  return (
    <EmptyState
      icon={CheckCircle}
      title="아직 완료된 세션이 없어요"
      description="만들어진 세션의 링크를 입주자에게 공유하여 온보딩을 완료하세요."
    />
  );
}

export function EmptyLimitReached() {
  return (
    <EmptyState
      icon={Crown}
      title="월간 한도에 도달했어요"
      description="이번 달 생성 가능한 세션 수를 모두 사용했습니다. 더 많은 세션이 필요하면 플랜을 업그레이드하세요."
      actionLabel="플랜 업그레이드"
      actionHref="/settings/billing"
    />
  );
}
