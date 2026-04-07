import type { TextBlock } from '@/types/block';

export function TextViewer({ block }: { block: TextBlock }) {
  return (
    <div
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: block.content.html || '<p></p>' }}
    />
  );
}
