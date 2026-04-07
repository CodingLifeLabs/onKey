'use client';

import { useState, useRef } from 'react';
import type { ImageBlock } from '@/types/block';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { uploadTemplateImage } from '@/app/actions/upload-template-image';

interface ImageEditorProps {
  content: ImageBlock['content'];
  preview: boolean;
  onChange: (content: ImageBlock['content']) => void;
}

export function ImageEditor({ content, preview, onChange }: ImageEditorProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { url } = await uploadTemplateImage(file);
      onChange({ ...content, url });
    } catch (err) {
      alert(err instanceof Error ? err.message : '업로드에 실패했습니다');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  if (preview) {
    if (!content.url) {
      return (
        <div className="flex h-32 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
          이미지 없음
        </div>
      );
    }
    return (
      <div className="space-y-1">
        <img
          src={content.url}
          alt={content.alt}
          loading="lazy"
          className="max-w-full rounded-md"
        />
        {content.caption && (
          <p className="text-sm text-muted-foreground">{content.caption}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {content.url ? (
        <div className="relative">
          <img
            src={content.url}
            alt={content.alt}
            className="max-w-full rounded-md border"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 size-7"
            onClick={() => onChange({ ...content, url: '', alt: '' })}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex h-32 w-full items-center justify-center rounded-md border border-dashed gap-2 text-sm text-muted-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
        >
          <Upload className="size-4" />
          {uploading ? '업로드 중...' : '이미지 업로드'}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {content.url && (
        <>
          <Input
            value={content.alt}
            onChange={(e) => onChange({ ...content, alt: e.target.value })}
            placeholder="이미지 설명 (대체 텍스트)"
          />
          <Input
            value={content.caption ?? ''}
            onChange={(e) => onChange({ ...content, caption: e.target.value })}
            placeholder="캡션 (선택)"
          />
        </>
      )}
    </div>
  );
}
