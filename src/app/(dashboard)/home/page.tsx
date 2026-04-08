import Link from 'next/link';
import { getOwnerProfile } from '@/lib/auth/server';
import { SessionRepository } from '@/data/repositories/session.repository.impl';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { StatusBadge } from '@/components/sessions/status-badge';
import { EmptyNoSessions } from '@/components/dashboard/empty-state';
import { QuickStartGuide } from '@/components/dashboard/quick-start-guide';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NativeButton } from '@/components/ui/button-native';
import { FileText, Clock, CheckCircle, BarChart3, Plus, ArrowRight } from 'lucide-react';
import type { SessionStatus } from '@/domain/entities/session.entity';

export default async function DashboardPage() {
  const owner = await getOwnerProfile();

  if (!owner) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">프로필을 불러오는 중입니다...</p>
      </div>
    );
  }

  const sessionRepo = new SessionRepository();
  const sessions = await sessionRepo.findByOwnerId(owner.ownerId);

  const counts = sessions.reduce(
    (acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    },
    {} as Record<SessionStatus, number>,
  );

  const total = sessions.length;
  const active = (counts.pending ?? 0) + (counts.in_progress ?? 0);
  const completed = counts.completed ?? 0;
  const recentSessions = sessions.slice(0, 5);

  if (total === 0) {
    return (
      <>
        <DashboardHeader />
        <EmptyNoSessions />
      </>
    );
  }

  const metrics = [
    { label: '총 세션', value: total, icon: FileText, color: 'text-primary' },
    { label: '진행 중', value: active, icon: Clock, color: 'text-amber-600', sub: `대기 ${counts.pending ?? 0} / 진행 ${counts.in_progress ?? 0}` },
    { label: '완료', value: completed, icon: CheckCircle, color: 'text-emerald-600' },
    { label: '이번 달', value: owner.profile.sessionCountThisMonth, icon: BarChart3, color: 'text-accent-foreground', sub: `${owner.profile.plan} 플랜` },
  ];

  return (
    <>
      <DashboardHeader
        title="대시보드"
        action={
          <Link href="/sessions/new">
            <NativeButton size="sm">
              <Plus className="mr-2 h-4 w-4" />
              새 세션
            </NativeButton>
          </Link>
        }
      />

      <div className="p-6 space-y-6">
        {/* 퀵스타트 가이드 */}
        <QuickStartGuide />

        {/* 메트릭 카드 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <Card key={m.label} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {m.label}
                </CardTitle>
                <m.icon className={`h-4 w-4 ${m.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight">{m.value}</div>
                {m.sub && (
                  <p className="text-xs text-muted-foreground mt-0.5">{m.sub}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 최근 세션 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">최근 세션</CardTitle>
            <Link href="/sessions">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                모두 보기
                <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/60">
              {recentSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/sessions/${session.id}`}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-muted/30 -mx-4 px-4 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <StatusBadge status={session.status} />
                    <div>
                      <p className="text-sm font-medium">{session.tenantName}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.roomNumber ?? '-'} &middot;{' '}
                        {session.createdAt.toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
