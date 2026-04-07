'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import SignaturePad from 'signature_pad';
import type { SignatureBlock } from '@/types/block';
import { Input } from '@/components/ui/input';
import { NativeButton } from '@/components/ui/button-native';
import { Label } from '@/components/ui/label';
import { PenLine, RotateCcw } from 'lucide-react';
import { uploadSignatureImage } from '@/app/actions/upload-signature-image';

interface SignatureViewerProps {
  block: SignatureBlock;
  sessionId: string;
  onSigned: (name: string, imageUrl: string) => void;
}

export function SignatureViewer({ block, sessionId, onSigned }: SignatureViewerProps) {
  const { collect_name, collect_canvas } = block.content;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);

  const [name, setName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !collect_canvas) return;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(ratio, ratio);

    const pad = new SignaturePad(canvas, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(0, 0, 0)',
      minWidth: 0.5,
      maxWidth: 2.5,
    });
    padRef.current = pad;

    return () => {
      pad.off();
      padRef.current = null;
    };
  }, [collect_canvas]);

  const handleClear = useCallback(() => {
    padRef.current?.clear();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (collect_name && !name.trim()) return;
    if (collect_canvas && (!padRef.current || padRef.current.isEmpty())) return;

    setIsUploading(true);
    try {
      let imageUrl = '';

      if (collect_canvas && padRef.current) {
        const dataUrl = padRef.current.toDataURL('image/png');
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], 'signature.png', { type: 'image/png' });

        const result = await uploadSignatureImage(file, sessionId);
        imageUrl = result.url;
      }

      onSigned(name.trim(), imageUrl);
    } catch {
      // 서명 업로드 실패 시 무시 (버튼 비활성화로 재시도 가능)
    } finally {
      setIsUploading(false);
    }
  }, [collect_name, collect_canvas, name, sessionId, onSigned]);

  return (
    <div className="space-y-3">
      <div>
        <p className="font-medium">{block.content.title || '입주자 서명'}</p>
        {block.content.description && (
          <p className="text-sm text-muted-foreground">{block.content.description}</p>
        )}
      </div>

      {collect_name && (
        <div className="space-y-1">
          <Label htmlFor="sig-name">이름</Label>
          <Input
            id="sig-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력하세요"
          />
        </div>
      )}

      {collect_canvas && (
        <div className="space-y-2">
          <div className="rounded-md border bg-white">
            <canvas
              ref={canvasRef}
              className="w-full touch-none h-[200px] sm:h-[240px] md:h-[280px]"
            />
          </div>
          <div className="flex gap-2">
            <NativeButton variant="outline" size="sm" className="gap-1" onClick={handleClear}>
              <RotateCcw className="size-3.5" />
              초기화
            </NativeButton>
            <NativeButton
              size="sm"
              className="gap-1"
              onClick={handleSubmit}
              disabled={isUploading || (collect_name && !name.trim())}
            >
              <PenLine className="size-3.5" />
              {isUploading ? '업로드 중...' : '서명 완료'}
            </NativeButton>
          </div>
        </div>
      )}
    </div>
  );
}
