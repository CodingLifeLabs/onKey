'use client';

import { nanoid } from 'nanoid';
import type { ChecklistBlock, ChecklistItem } from '@/types/block';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, CheckSquare } from 'lucide-react';

interface ChecklistEditorProps {
  content: ChecklistBlock['content'];
  preview: boolean;
  onChange: (content: ChecklistBlock['content']) => void;
}

export function ChecklistEditor({ content, preview, onChange }: ChecklistEditorProps) {
  if (preview) {
    return (
      <div className="space-y-2">
        {content.title && <p className="font-medium">{content.title}</p>}
        {content.items.length === 0 && (
          <p className="text-sm text-muted-foreground">체크리스트 항목이 없습니다</p>
        )}
        <ul className="space-y-1">
          {content.items.map((item) => (
            <li key={item.id} className="flex items-center gap-2 text-sm">
              <CheckSquare className="size-4 shrink-0 text-muted-foreground" />
              <span>{item.label || '항목 없음'}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const handleAddItem = () => {
    const newItem: ChecklistItem = { id: nanoid(8), label: '', required: true };
    onChange({ ...content, items: [...content.items, newItem] });
  };

  const handleRemoveItem = (itemId: string) => {
    onChange({ ...content, items: content.items.filter((i) => i.id !== itemId) });
  };

  const handleItemChange = (itemId: string, label: string) => {
    onChange({
      ...content,
      items: content.items.map((i) => (i.id === itemId ? { ...i, label } : i)),
    });
  };

  return (
    <div className="space-y-3">
      <Input
        value={content.title ?? ''}
        onChange={(e) => onChange({ ...content, title: e.target.value })}
        placeholder="체크리스트 제목 (선택)"
      />
      <div className="space-y-2">
        {content.items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <CheckSquare className="size-4 shrink-0 text-muted-foreground" />
            <Input
              value={item.label}
              onChange={(e) => handleItemChange(item.id, e.target.value)}
              placeholder="항목을 입력하세요"
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 text-destructive"
              onClick={() => handleRemoveItem(item.id)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" className="gap-2" onClick={handleAddItem}>
        <Plus className="size-4" />
        항목 추가
      </Button>
    </div>
  );
}
