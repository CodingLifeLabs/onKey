'use client';

import { useState } from 'react';
import { QrCode } from 'lucide-react';
import { QrCodeDialog } from '@/components/ui/qr-code-dialog';

interface QrCodeButtonProps {
  url: string;
  title?: string;
}

export function QrCodeButton({ url, title }: QrCodeButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9 cursor-pointer"
        title="QR 코드"
      >
        <QrCode className="h-4 w-4" />
      </button>
      <QrCodeDialog
        url={url}
        open={open}
        onOpenChange={setOpen}
        title={title}
      />
    </>
  );
}
