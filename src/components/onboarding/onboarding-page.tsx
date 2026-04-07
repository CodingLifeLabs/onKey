'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Block } from '@/types/block';
import type { Session } from '@/domain/entities/session.entity';
import type { SessionProgress } from '@/domain/entities/session-progress.entity';
import { BlockViewer } from './block-viewer';
import { NativeButton } from '@/components/ui/button-native';
import { updateProgress } from '@/app/actions/update-progress';
import { completeSession } from '@/app/actions/complete-session';
import { CheckCircle2, Eye, CheckSquare, PenLine } from 'lucide-react';

interface OnboardingPageProps {
  session: Session;
  progress: SessionProgress | null;
  blocks: Block[];
}

export function OnboardingPage({ session, progress, blocks }: OnboardingPageProps) {
  const [checkedItems, setCheckedItems] = useState<string[]>(progress?.checkedItems ?? []);
  const [viewedSections, setViewedSections] = useState<string[]>(progress?.viewedSections ?? []);
  const [signatureName, setSignatureName] = useState<string | null>(progress?.signatureName ?? null);
  const [signatureImageUrl, setSignatureImageUrl] = useState<string | null>(progress?.signatureImageUrl ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ref로 최신 상태 추적 (debounce 콜백에서 stale closure 방지)
  const viewedRef = useRef(viewedSections);
  const checkedRef = useRef(checkedItems);
  viewedRef.current = viewedSections;
  checkedRef.current = checkedItems;

  // debounce 타이머
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedSave = useCallback((sessionId: string) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      updateProgress({
        sessionId,
        viewedSections: viewedRef.current,
        checkedItems: checkedRef.current,
      });
    }, 2000);
  }, []);

  // Intersection Observer로 블록 열람 자동 추적
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        let hasNew = false;
        setViewedSections((prev) => {
          let updated = prev;
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const blockId = entry.target.getAttribute('data-block-id');
              if (blockId && !updated.includes(blockId)) {
                updated = [...updated, blockId];
                hasNew = true;
              }
            }
          }
          return updated;
        });
        if (hasNew) {
          debouncedSave(session.id);
        }
      },
      { threshold: 0.5 },
    );

    return () => {
      observerRef.current?.disconnect();
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [session.id, debouncedSave]);

  // 블록 요소 관찰 등록
  useEffect(() => {
    const blockElements = document.querySelectorAll('[data-block-id]');
    blockElements.forEach((el) => {
      observerRef.current?.observe(el);
    });
  }, [blocks]);

  // 체크리스트 항목 토글
  const handleCheck = useCallback(
    (itemId: string, checked: boolean) => {
      setCheckedItems((prev) =>
        checked ? [...prev, itemId] : prev.filter((id) => id !== itemId),
      );
    },
    [],
  );

  // 서명 완료 콜백
  const handleSigned = useCallback((name: string, imageUrl: string) => {
    setSignatureName(name);
    setSignatureImageUrl(imageUrl);
  }, []);

  // 진행률 계산
  const requiredBlocks = blocks.filter((b) => b.required);
  const totalRequired = requiredBlocks.length;

  const allViewed =
    totalRequired === 0 || requiredBlocks.every((b) => viewedSections.includes(b.id));

  const checklistBlocks = requiredBlocks.filter((b) => b.type === 'checklist');
  const allChecked =
    checklistBlocks.length === 0 ||
    checklistBlocks.every((b) => {
      if (b.type !== 'checklist') return true;
      return b.content.items.every((item) => checkedItems.includes(item.id));
    });

  const signatureBlocks = requiredBlocks.filter((b) => b.type === 'signature');
  const hasSignature = signatureBlocks.length > 0;
  const signatureDone = !hasSignature || (signatureName !== null && signatureImageUrl !== null);

  const canComplete = allViewed && allChecked && signatureDone;

  // 진행률 단계 계산
  const steps: { label: string; done: boolean; icon: typeof Eye }[] = [];
  if (totalRequired > 0) {
    steps.push({ label: '열람', done: allViewed, icon: Eye });
  }
  if (checklistBlocks.length > 0) {
    steps.push({ label: '체크', done: allChecked, icon: CheckSquare });
  }
  if (hasSignature) {
    steps.push({ label: '서명', done: signatureDone, icon: PenLine });
  }
  const completedSteps = steps.filter((s) => s.done).length;
  const totalSteps = steps.length;

  // 저장
  const handleSave = useCallback(async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    await updateProgress({
      sessionId: session.id,
      viewedSections,
      checkedItems,
    });
  }, [session.id, viewedSections, checkedItems]);

  // 완료
  const handleComplete = useCallback(async () => {
    if (!canComplete) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await completeSession({
        sessionId: session.id,
        signatureName: signatureName ?? undefined,
        signatureImageUrl: signatureImageUrl ?? undefined,
        checkedItems,
      });
      if ('success' in result) {
        setIsCompleted(true);
      } else if ('error' in result) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '완료 처리에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  }, [canComplete, session.id, signatureName, signatureImageUrl, checkedItems]);

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <CheckCircle2 className="mb-4 size-16 text-green-500" />
        <h2 className="text-xl font-semibold">온보딩이 완료되었습니다</h2>
        <p className="mt-2 text-muted-foreground">
          모든 입주 안내 사항을 확인해주셔서 감사합니다.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-20">
      {/* 헤더 */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">입주 안내</h1>
        {session.tenantName && (
          <p className="text-lg font-medium">
            {session.tenantName}님, 환영합니다!
          </p>
        )}
      </div>

      {/* 진행률 바 */}
      {totalSteps > 0 && (
        <div className="space-y-2">
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${Math.round((completedSteps / totalSteps) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            {steps.map((step) => (
              <span
                key={step.label}
                className={`inline-flex items-center gap-1 ${step.done ? 'text-primary font-medium' : ''}`}
              >
                <step.icon className="h-3 w-3" />
                {step.label}
              </span>
            ))}
            <span>{completedSteps}/{totalSteps} 완료</span>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 블록 목록 */}
      <div className="space-y-6">
        {blocks.map((block) => (
          <div key={block.id} data-block-id={block.id}>
            <BlockViewer
              block={block}
              sessionId={session.id}
              checkedItems={checkedItems}
              onCheck={handleCheck}
              onSigned={handleSigned}
            />
          </div>
        ))}
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-3">
        <NativeButton variant="outline" onClick={handleSave} className="flex-1">
          임시 저장
        </NativeButton>
        <NativeButton
          onClick={handleComplete}
          disabled={!canComplete || isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? '처리 중...' : '완료'}
        </NativeButton>
      </div>
    </div>
  );
}
