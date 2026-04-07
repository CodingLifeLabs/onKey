'use client';

import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { CompletionCertificate } from '@/emails/completion-certificate';
import type { Session } from '@/domain/entities/session.entity';
import type { SessionProgress } from '@/domain/entities/session-progress.entity';

interface PdfDownloadButtonProps {
  session: Session;
  progress: SessionProgress;
  label?: string;
}

export function PdfDownloadButton({
  session,
  progress,
  label = 'PDF 다운로드',
}: PdfDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = useCallback(async () => {
    setIsGenerating(true);
    try {
      const doc = <CompletionCertificate session={session} progress={progress} />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${session.tenantName}_입주확인서.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [session, progress]);

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isGenerating}
      className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isGenerating ? '생성 중...' : label}
    </button>
  );
}
