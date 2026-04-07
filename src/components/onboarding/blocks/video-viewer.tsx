'use client';

import type { VideoBlock } from '@/types/block';

interface VideoViewerProps {
  block: VideoBlock;
}

export function VideoViewer({ block }: VideoViewerProps) {
  const { content } = block;

  if (!content.embed_url) return null;

  return (
    <div className="space-y-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-black">
        <iframe
          src={content.embed_url}
          className="absolute left-0 top-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={content.caption || 'Video'}
        />
      </div>
      {content.caption && (
        <p className="text-sm text-muted-foreground">{content.caption}</p>
      )}
    </div>
  );
}
