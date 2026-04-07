'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

interface UpgradePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string;
}

export function UpgradePromptDialog({
  open,
  onOpenChange,
  feature,
}: UpgradePromptDialogProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Pro 전용 기능
          </DialogTitle>
          <DialogDescription>
            {feature}은(는) Pro 요금제에서 사용할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
          <p className="text-sm font-medium">Pro 요금제 혜택</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>&#8226; 커스텀 템플릿 무제한 생성</li>
            <li>&#8226; 템플릿 편집 및 복제</li>
            <li>&#8226; 월 50개 세션 생성</li>
            <li>&#8226; 우선 지원</li>
          </ul>
          <p className="text-sm font-semibold pt-1">$9 <span className="font-normal text-muted-foreground">/월</span></p>
        </div>
        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-9 px-4 cursor-pointer"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              router.push('/settings/billing');
            }}
            className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 cursor-pointer"
          >
            Pro로 업그레이드
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
