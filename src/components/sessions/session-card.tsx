import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/sessions/status-badge';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import type { Session } from '@/domain/entities/session.entity';

interface SessionCardProps {
  session: Session;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

function getExpiryWarning(session: Session): 'expired' | 'urgent' | 'soon' | null {
  if (session.status === 'completed' || session.status === 'expired') return null;
  const now = Date.now();
  const expires = new Date(session.expiresAt).getTime();
  const daysLeft = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
  if (daysLeft <= 0) return 'expired';
  if (daysLeft <= 1) return 'urgent';
  if (daysLeft <= 3) return 'soon';
  return null;
}

export function SessionCard({ session, selectable, selected, onSelect }: SessionCardProps) {
  const warning = getExpiryWarning(session);

  const content = (
    <Card className={`group hover:shadow-md hover:border-primary/20 transition-all cursor-pointer ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectable && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect?.(session.id);
                }}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                  selected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground/30 hover:border-primary/50'
                }`}
              >
                {selected && (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )}
            <StatusBadge status={session.status} />
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
        </div>
        <p className="text-base font-semibold mt-1">{session.tenantName}</p>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="text-sm text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>호실</span>
            <span className="font-medium text-foreground/80">{session.roomNumber ?? '-'}</span>
          </div>
          <div className="flex justify-between">
            <span>생성</span>
            <span>{session.createdAt.toLocaleDateString('ko-KR')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>만료</span>
            <div className="flex items-center gap-1.5">
              {warning && (
                <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${warning === 'urgent' ? 'text-red-600' : 'text-amber-600'}`}>
                  <AlertTriangle className="h-3 w-3" />
                  {warning === 'expired' ? '만료됨' : warning === 'urgent' ? '임박' : 'D-3'}
                </span>
              )}
              <span>{session.expiresAt.toLocaleDateString('ko-KR')}</span>
            </div>
          </div>
          {session.completedAt && (
            <div className="flex justify-between text-emerald-600">
              <span>완료</span>
              <span>{session.completedAt.toLocaleDateString('ko-KR')}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (selectable) {
    return content;
  }

  return (
    <Link href={`/sessions/${session.id}`}>
      {content}
    </Link>
  );
}
