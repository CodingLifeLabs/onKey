import type { SessionStatus } from '@/domain/entities/session.entity';
import { Badge } from '@/components/ui/badge';

const statusConfig: Record<SessionStatus, { label: string; className: string }> = {
  pending: {
    label: '대기 중',
    className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50',
  },
  in_progress: {
    label: '진행 중',
    className: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/10',
  },
  completed: {
    label: '완료',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50',
  },
  expired: {
    label: '만료',
    className: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-50',
  },
};

interface StatusBadgeProps {
  status: SessionStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={`text-xs font-medium ${config.className}`}>
      {config.label}
    </Badge>
  );
}
