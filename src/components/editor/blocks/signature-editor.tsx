'use client';

import type { SignatureBlock } from '@/types/block';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PenLine } from 'lucide-react';

interface SignatureEditorProps {
  content: SignatureBlock['content'];
  preview: boolean;
  onChange: (content: SignatureBlock['content']) => void;
}

export function SignatureEditor({ content, preview, onChange }: SignatureEditorProps) {
  if (preview) {
    return (
      <div className="space-y-3">
        <p className="font-medium">{content.title || '입주자 서명'}</p>
        {content.description && (
          <p className="text-sm text-muted-foreground">{content.description}</p>
        )}
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          <PenLine className="mx-auto mb-2 size-6" />
          서명 영역
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          {content.collect_name && <span>이름 서명</span>}
          {content.collect_canvas && <span>서명 캔버스</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="sig-title">제목</Label>
        <Input
          id="sig-title"
          value={content.title ?? ''}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          placeholder="입주자 서명"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="sig-desc">설명</Label>
        <Input
          id="sig-desc"
          value={content.description ?? ''}
          onChange={(e) => onChange({ ...content, description: e.target.value })}
          placeholder="위 안내 사항을 모두 확인하였습니다"
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={content.collect_name}
            onChange={(e) => onChange({ ...content, collect_name: e.target.checked })}
          />
          이름 서명 수집
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={content.collect_canvas}
            onChange={(e) => onChange({ ...content, collect_canvas: e.target.checked })}
          />
          서명 캔버스 수집
        </label>
      </div>
    </div>
  );
}
