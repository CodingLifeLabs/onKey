'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrCodeButton } from '@/components/ui/qr-code-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Copy, ExternalLink, Home } from 'lucide-react';

interface StepLinkShareProps {
  link: string;
  expiresAt: string;
  tenantName: string;
  onGoToDashboard: () => void;
}

export function StepLinkShare({
  link,
  expiresAt,
  tenantName,
  onGoToDashboard,
}: StepLinkShareProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">온보딩 링크가 생성되었습니다</h2>
        <p className="text-sm text-muted-foreground">
          아래 링크를 <strong>{tenantName}</strong>님에게 공유해주세요.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle className="h-5 w-5 text-green-500" />
            링크 생성 완료
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={link} readOnly className="font-mono text-sm" />
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              만료일:{' '}
              {new Date(expiresAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <a href={link} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                미리보기
              </Button>
            </a>
            <QrCodeButton url={link} title={`${tenantName} 입주 안내 QR`} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center pt-4">
        <Button onClick={onGoToDashboard}>
          <Home className="mr-2 h-4 w-4" />
          대시보드로 이동
        </Button>
      </div>
    </div>
  );
}
