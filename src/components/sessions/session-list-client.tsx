'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Trash2, X } from 'lucide-react';
import { SessionCard } from '@/components/sessions/session-card';
import { EmptyState } from '@/components/dashboard/empty-state';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { bulkDeleteSessionsAction } from '@/app/actions/bulk-delete-sessions';
import type { Session, SessionStatus } from '@/domain/entities/session.entity';

const STATUS_TABS: { value: string; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'pending', label: '대기 중' },
  { value: 'in_progress', label: '진행 중' },
  { value: 'completed', label: '완료' },
  { value: 'expired', label: '만료' },
];

const SORT_OPTIONS = [
  { value: 'created_at-desc', label: '최근 생성순' },
  { value: 'created_at-asc', label: '오래된 순' },
  { value: 'expires_at-asc', label: '만료 임박순' },
  { value: 'expires_at-desc', label: '만료 여유순' },
  { value: 'tenant_name-asc', label: '이름순 (가나다)' },
] as const;

interface SessionListClientProps {
  sessions: Session[];
  counts: Record<SessionStatus, number>;
  totalFiltered: number;
  currentPage: number;
  totalPages: number;
}

export function SessionListClient({
  sessions,
  counts,
  totalFiltered,
  currentPage,
  totalPages,
}: SessionListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const activeStatus = searchParams.get('status') ?? 'all';

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        for (const [key, value] of Object.entries(updates)) {
          if (value) {
            params.set(key, value);
          } else {
            params.delete(key);
          }
        }
        router.push(`/sessions?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  const handleStatusChange = (status: string) => {
    updateParams({
      status: status === 'all' ? null : status,
      search: searchParams.get('search'),
      sort: searchParams.get('sort'),
      page: null,
    });
  };

  const handleSearch = (value: string) => {
    setSearchInput(value);
    updateParams({
      search: value || null,
      status: searchParams.get('status'),
      sort: searchParams.get('sort'),
      page: null,
    });
  };

  const handleSortChange = (value: string) => {
    updateParams({
      sort: value,
      status: searchParams.get('status'),
      search: searchParams.get('search'),
      page: null,
    });
  };

  const handlePageChange = (page: number) => {
    updateParams({
      page: page === 1 ? null : String(page),
      status: searchParams.get('status'),
      search: searchParams.get('search'),
      sort: searchParams.get('sort'),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getTabCount = (status: string) => {
    if (status === 'all') {
      return counts.pending + counts.in_progress + counts.completed + counts.expired;
    }
    return counts[status as SessionStatus] ?? 0;
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === sessions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sessions.map((s) => s.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    try {
      const result = await bulkDeleteSessionsAction(Array.from(selectedIds));
      if (result.error) {
        alert(result.error);
      } else {
        setSelectedIds(new Set());
        setSelectMode(false);
        router.refresh();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  // 페이지 번호 범위 계산
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-4">
      {/* 상태 탭 */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => {
          const isActive = activeStatus === tab.value;
          const count = getTabCount(tab.value);
          return (
            <button
              key={tab.value}
              onClick={() => handleStatusChange(tab.value)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tab.label}
              <span
                className={`text-xs ${
                  isActive ? 'text-primary-foreground/70' : 'text-muted-foreground/70'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 검색 + 정렬 + 선택 모드 */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="입주자명 또는 호실번호로 검색"
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={searchParams.get('sort') ?? 'created_at-desc'}
          onValueChange={(value) => handleSortChange(value ?? 'created_at-desc')}
        >
          <SelectTrigger className="w-[160px]">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!selectMode ? (
          <Button variant="outline" size="sm" onClick={() => setSelectMode(true)}>
            <Trash2 className="h-4 w-4 mr-1" />
            선택 삭제
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={exitSelectMode}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* 선택 모드 바 */}
      {selectMode && sessions.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {selectedIds.size === sessions.length ? '전체 해제' : '전체 선택'}
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {selectedIds.size}개 선택됨
            </span>
            <Button
              variant="destructive"
              size="sm"
              disabled={selectedIds.size === 0 || isDeleting}
              onClick={handleBulkDelete}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
          </div>
        </div>
      )}

      {/* 결과 카운트 */}
      <p className="text-sm text-muted-foreground">
        {totalFiltered}개 중 {sessions.length}개 표시
      </p>

      {/* 세션 카드 */}
      {sessions.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={
            searchParams.get('search')
              ? '검색 결과가 없어요'
              : activeStatus !== 'all'
                ? `${STATUS_TABS.find((t) => t.value === activeStatus)?.label ?? ''} 세션이 없어요`
                : '아직 세션이 없어요'
          }
          description={
            searchParams.get('search')
              ? '다른 검색어로 시도해보세요'
              : '새로운 입주자를 위한 세션을 생성하세요.'
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              selectable={selectMode}
              selected={selectedIds.has(session.id)}
              onSelect={handleToggleSelect}
            />
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm hover:bg-muted disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {getPageNumbers().map((p, i) =>
            p === 'ellipsis' ? (
              <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                  p === currentPage
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                {p}
              </button>
            ),
          )}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm hover:bg-muted disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 로딩 오버레이 */}
      {isPending && (
        <div className="pointer-events-none fixed inset-0 bg-background/20" />
      )}
    </div>
  );
}
