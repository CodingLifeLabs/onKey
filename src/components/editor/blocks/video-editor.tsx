'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { VideoBlock } from '@/types/block';
import { Video } from 'lucide-react';

interface VideoEditorProps {
  content: VideoBlock['content'];
  preview: boolean;
  onChange: (content: VideoBlock['content']) => void;
}

function getEmbedUrl(url: string): string {
  if (!url) return '';
  
  // YouTube
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/);
  if (vimeoMatch && vimeoMatch[3]) {
    return `https://player.vimeo.com/video/${vimeoMatch[3]}`;
  }

  return url;
}

export function VideoEditor({ content, preview, onChange }: VideoEditorProps) {
  if (preview) {
    if (!content.embed_url) {
      return (
        <div className="flex h-32 items-center justify-center rounded-md border border-dashed bg-muted/30 text-sm text-muted-foreground">
          동영상 URL이 없습니다.
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-black">
          <iframe
            src={content.embed_url}
            className="absolute left-0 top-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Embedded Video"
          />
        </div>
        {content.caption && (
          <p className="text-sm text-muted-foreground">{content.caption}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {content.embed_url ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-black">
          <iframe
            src={content.embed_url}
            className="absolute left-0 top-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/30 text-muted-foreground">
          <Video className="size-6" />
          <span className="text-sm">YouTube 또는 Vimeo URL을 입력하세요.</span>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={content.url}
            onChange={(e) => {
              const url = e.target.value;
              onChange({ ...content, url, embed_url: getEmbedUrl(url) });
            }}
            placeholder="동영상 URL (예: https://youtube.com/watch?v=...)"
            className="flex-1"
          />
          {content.url && (
            <Button
              variant="outline"
              onClick={() => onChange({ ...content, url: '', embed_url: '' })}
            >
              지우기
            </Button>
          )}
        </div>
        
        {content.embed_url && (
          <Input
            value={content.caption ?? ''}
            onChange={(e) => onChange({ ...content, caption: e.target.value })}
            placeholder="동영상 설명 (캡션)"
          />
        )}
      </div>
    </div>
  );
}
