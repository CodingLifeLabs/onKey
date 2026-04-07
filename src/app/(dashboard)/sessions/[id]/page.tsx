import Link from 'next/link';
import { getSessionDetail } from '@/app/actions/get-session-detail';
import { getUserPlan } from '@/app/actions/get-user-plan';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { StatusBadge } from '@/components/sessions/status-badge';
import { CopyButton } from '@/components/ui/copy-button';
import { QrCodeButton } from '@/components/ui/qr-code-button';
import { PdfDownloadButton } from '@/components/ui/pdf-download-button';
import { NativeButton } from '@/components/ui/button-native';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CheckCircle2, Clock, ArrowLeft, Lock } from 'lucide-react';
import type { Block } from '@/types/block';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SessionDetailPage({ params }: Props) {
  const { id } = await params;
  const [result, plan] = await Promise.all([
    getSessionDetail(id),
    getUserPlan(),
  ]);
  const isPro = plan === 'pro' || plan === 'enterprise';

  if (!result || 'error' in result) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">
          {'error' in result ? result.error : '세션을 불러올 수 없습니다'}
        </p>
      </div>
    );
  }

  const { session, progress, publicUrl, stats } = result;

  const completionPercent =
    stats.totalRequired > 0
      ? Math.round((stats.viewedRequired / stats.totalRequired) * 100)
      : 0;

  const blocks = session.contentSnapshot;
  const checklistBlocks = blocks.filter(
    (b): b is Block & { type: 'checklist' } => b.type === 'checklist',
  );

  return (
    <div>
      <DashboardHeader title="세션 상세" />
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        {/* 뒤로가기 */}
        <Link href="/sessions">
          <NativeButton variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="size-4" />
            목록으로 돌아가기
          </NativeButton>
        </Link>

        {/* 기본 정보 카드 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{session.tenantName}</h2>
              <StatusBadge status={session.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">호실</span>
                <p>{session.roomNumber ?? '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">만료일</span>
                <p>{session.expiresAt.toLocaleDateString('ko-KR')}</p>
              </div>
              <div>
                <span className="text-muted-foreground">생성</span>
                <p>{session.createdAt.toLocaleDateString('ko-KR')}</p>
              </div>
              {session.completedAt && (
                <div>
                  <span className="text-muted-foreground">완료</span>
                  <p className="text-green-600">
                    {session.completedAt.toLocaleDateString('ko-KR')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 진행 상태 카드 */}
        <Card>
          <CardHeader>
            <h3 className="text-base font-semibold">진행 상태</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.totalRequired > 0 && (
              <div>
                <div className="flex justify-between text-sm">
                  <span>필수 항목 열람</span>
                  <span>{stats.viewedRequired}/{stats.totalRequired}</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 퍼블릭 링크 카드 */}
        <Card>
          <CardHeader>
            <h3 className="text-base font-semibold">입주자 링크</h3>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 overflow-hidden rounded bg-muted px-3 py-2 text-sm">
                {publicUrl}
              </code>
              <CopyButton text={publicUrl} />
              <QrCodeButton url={publicUrl} title="입주자 링크 QR 코드" />
            </div>
          </CardContent>
        </Card>

        {/* 완료 상세 */}
        {session.status === 'completed' && progress && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">완료 정보</h3>
                {isPro ? (
                  <PdfDownloadButton session={session} progress={progress} />
                ) : (
                  <Link href="/settings/billing">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-9 px-3 cursor-pointer"
                    >
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      PDF 다운로드 (Pro)
                    </button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {progress.submittedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="size-4 text-green-500" />
                  <span>제출: {progress.submittedAt.toLocaleString('ko-KR')}</span>
                </div>
              )}
              {progress.signatureName && (
                <div>
                  <span className="text-sm text-muted-foreground">서명자</span>
                  <p className="font-medium">{progress.signatureName}</p>
                </div>
              )}
              {progress.signatureImageUrl && (
                <div>
                  <span className="mb-1 block text-sm text-muted-foreground">서명 이미지</span>
                  <img
                    src={progress.signatureImageUrl}
                    alt="서명 이미지"
                    className="max-w-xs rounded border"
                  />
                </div>
              )}
              {checklistBlocks.length > 0 && progress.checkedItems && (
                <div>
                  <span className="mb-2 block text-sm text-muted-foreground">체크리스트 결과</span>
                  <ul className="space-y-1">
                    {checklistBlocks.map((block) =>
                      block.content.items.map((item) => (
                        <li key={item.id} className="flex items-center gap-2 text-sm">
                          {progress.checkedItems!.includes(item.id) ? (
                            <CheckCircle2 className="size-3 text-green-500" />
                          ) : (
                            <div className="size-3 rounded-full border" />
                          )}
                          <span>{item.label}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
