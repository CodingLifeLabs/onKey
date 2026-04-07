'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, LayoutTemplate, FileText, Share2, CheckCircle } from 'lucide-react';

const STEPS = [
  {
    icon: LayoutTemplate,
    title: '템플릿 선택',
    desc: '기본 템플릿을 선택하거나 직접 만들어보세요.',
    href: '/templates',
  },
  {
    icon: FileText,
    title: '세션 생성',
    desc: '입주자 정보를 입력하고 안내 세션을 만드세요.',
    href: '/sessions/new',
  },
  {
    icon: Share2,
    title: '링크 공유',
    desc: '생성된 링크를 입주자에게 전달하세요. QR코드도 가능합니다.',
    href: null,
  },
  {
    icon: CheckCircle,
    title: '완료 확인',
    desc: '대시보드에서 입주자의 진행 상태를 실시간으로 확인하세요.',
    href: '/sessions',
  },
];

const STORAGE_KEY = 'onkey-guide-dismissed';

export function QuickStartGuide() {
  const [dismissed, setDismissed] = useState(true); // SSR 안전: 기본값 숨김

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== 'true') {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  if (dismissed) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold">시작하기</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              4단계로 입주 온보딩을 시작해보세요
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="flex gap-3 rounded-lg bg-background/80 p-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                {i + 1}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <step.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                  <p className="text-sm font-medium truncate">{step.title}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {step.desc}
                </p>
                {step.href && (
                  <Link
                    href={step.href}
                    className="text-xs text-primary hover:underline mt-1 inline-block"
                  >
                    바로가기 →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
