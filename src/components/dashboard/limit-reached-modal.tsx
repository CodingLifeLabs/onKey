'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createCheckoutAction } from '@/app/actions/create-checkout';
import { Loader2, Zap } from 'lucide-react';
import { getSessionLimit } from '@/lib/polar';

interface LimitReachedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCount: number;
  currentPlan: string;
  proProductId: string | undefined;
}

export function LimitReachedModal({
  open,
  onOpenChange,
  currentCount,
  currentPlan,
  proProductId,
}: LimitReachedModalProps) {
  const [loading, setLoading] = useState(false);
  const limit = getSessionLimit(currentPlan);

  const handleUpgrade = async () => {
    if (!proProductId) return;
    setLoading(true);
    try {
      const result = await createCheckoutAction(proProductId);
      if (result.url) {
        window.location.href = result.url;
      } else if (result.error) {
        alert(result.error);
      }
    } catch {
      alert('결제 페이지를 여는 데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>세션 생성 한도 도달</DialogTitle>
          <DialogDescription>
            이번 달 세션 생성 한도에 도달했습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">현재 플랜</span>
              <span className="font-medium capitalize">{currentPlan}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">사용량</span>
              <span className="font-medium text-destructive">
                {currentCount} / {limit}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pro 한도</span>
              <span className="font-medium text-emerald-600">월 20개 세션</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <button
            type="button"
            onClick={handleUpgrade}
            disabled={loading || !proProductId}
            className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            {loading ? '이동 중...' : 'Pro로 업그레이드'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
