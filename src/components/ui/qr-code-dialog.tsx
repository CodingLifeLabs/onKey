'use client';

import { useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface QrCodeDialogProps {
  url: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
}

export function QrCodeDialog({
  url,
  open,
  onOpenChange,
  title = 'QR 코드',
}: QrCodeDialogProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(() => {
    const svgEl = qrRef.current?.querySelector('svg');
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();

    img.onload = () => {
      const size = 1024;
      canvas.width = size;
      canvas.height = size;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);

      const a = document.createElement('a');
      a.download = 'onkey-qr.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    };

    img.src =
      'data:image/svg+xml;base64,' +
      btoa(unescape(encodeURIComponent(svgData)));
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <div
            ref={qrRef}
            className="rounded-xl border bg-white p-4"
          >
            <QRCodeSVG
              value={url}
              size={220}
              level="M"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#1a1a1a"
            />
          </div>

          <p className="text-xs text-muted-foreground text-center break-all px-2">
            {url}
          </p>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            PNG 다운로드
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
