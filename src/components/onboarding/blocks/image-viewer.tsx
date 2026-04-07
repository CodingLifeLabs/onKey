'use client';

import { useState } from 'react';
import type { ImageBlock } from '@/types/block';
import { ImageIcon } from 'lucide-react';

export function ImageViewer({ block }: { block: ImageBlock }) {
  const { url, alt, caption } = block.content;
  const [error, setError] = useState(false);

  if (!url) return null;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/50 py-8 text-muted-foreground">
        <ImageIcon className="h-8 w-8" />
        <p className="text-sm">이미지를 불러올 수 없습니다</p>
      </div>
    );
  }

  return (
    <figure className="space-y-1">
      <img
        src={url}
        alt={alt || ''}
        loading="lazy"
        onError={() => setError(true)}
        className="w-full rounded-lg"
      />
      {caption && (
        <figcaption className="text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
