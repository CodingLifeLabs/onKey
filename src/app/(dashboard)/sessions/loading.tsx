import { Skeleton } from '@/components/ui/skeleton';

export default function SessionsLoading() {
  return (
    <div className="p-6 space-y-4">
      {/* 탭 스켈레톤 */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-16 rounded-full" />
        ))}
      </div>

      {/* 검색 + 정렬 스켈레톤 */}
      <div className="flex gap-3">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-[160px]" />
      </div>

      {/* 카드 그리드 스켈레톤 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-4 w-28" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-14" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
