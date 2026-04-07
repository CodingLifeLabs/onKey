'use client';

import type { HeadingBlock } from '@/types/block';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HeadingEditorProps {
  content: HeadingBlock['content'];
  preview: boolean;
  onChange: (content: HeadingBlock['content']) => void;
}

export function HeadingEditor({ content, preview, onChange }: HeadingEditorProps) {
  if (preview) {
    const sizeClass =
      content.level === 1
        ? 'text-2xl font-bold'
        : content.level === 2
          ? 'text-xl font-semibold'
          : 'text-lg font-medium';

    if (content.level === 1) return <h1 className={sizeClass}>{content.text || '제목 없음'}</h1>;
    if (content.level === 2) return <h2 className={sizeClass}>{content.text || '제목 없음'}</h2>;
    return <h3 className={sizeClass}>{content.text || '제목 없음'}</h3>;
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Select
          value={String(content.level)}
          onValueChange={(val) =>
            onChange({ ...content, level: Number(val) as 1 | 2 | 3 })
          }
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">H1 대제목</SelectItem>
            <SelectItem value="2">H2 중제목</SelectItem>
            <SelectItem value="3">H3 소제목</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Input
        value={content.text}
        onChange={(e) => onChange({ ...content, text: e.target.value })}
        placeholder="제목을 입력하세요"
      />
    </div>
  );
}
