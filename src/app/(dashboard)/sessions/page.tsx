import { getOwnerProfile } from '@/lib/auth/server';
import { SessionRepository } from '@/data/repositories/session.repository.impl';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { SessionListClient } from '@/components/sessions/session-list-client';
import { EmptyNoSessions } from '@/components/dashboard/empty-state';
import { NativeButton } from '@/components/ui/button-native';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import type { SessionStatus } from '@/domain/entities/session.entity';

const PAGE_SIZE = 12;

interface SessionsPageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function SessionsPage({ searchParams }: SessionsPageProps) {
  const owner = await getOwnerProfile();

  if (!owner) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>프로필을 불러오는 중입니다...</p>
      </div>
    );
  }

  const params = await searchParams;
  const [sortBy, sortOrder] = (params.sort ?? 'created_at-desc').split('-') as [
    'created_at' | 'expires_at' | 'tenant_name',
    'asc' | 'desc',
  ];
  const page = Math.max(1, parseInt(params.page ?? '1', 10));

  const sessionRepo = new SessionRepository();

  // 전체 세션 수 확인 (빈 상태 분기)
  const { counts } = await sessionRepo.findByOwnerIdFiltered(owner.ownerId);
  const total = counts.pending + counts.in_progress + counts.completed + counts.expired;
  if (total === 0) {
    return (
      <>
        <DashboardHeader />
        <EmptyNoSessions />
      </>
    );
  }

  // 필터 적용
  const { sessions, counts: statusCounts, totalFiltered } =
    await sessionRepo.findByOwnerIdFiltered(owner.ownerId, {
      status: params.status as SessionStatus | undefined,
      search: params.search,
      sortBy,
      sortOrder,
      page,
      pageSize: PAGE_SIZE,
    });

  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE);

  return (
    <>
      <DashboardHeader
        title="세션 관리"
        description={`${total}개의 세션`}
        action={
          <Link href="/sessions/new">
            <NativeButton size="sm">
              <Plus className="mr-2 h-4 w-4" />
              새 세션
            </NativeButton>
          </Link>
        }
      />

      <div className="p-6">
        <SessionListClient
          sessions={sessions}
          counts={statusCounts}
          totalFiltered={totalFiltered}
          currentPage={page}
          totalPages={totalPages}
        />
      </div>
    </>
  );
}
