'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Phone } from 'lucide-react';
import type { ContactBlock, ContactEntry } from '@/types/block';

interface ContactEditorProps {
  content: ContactBlock['content'];
  preview: boolean;
  onChange: (content: ContactBlock['content']) => void;
}

export function ContactEditor({ content, preview, onChange }: ContactEditorProps) {
  if (preview) {
    return (
      <div className="space-y-4">
        <p className="font-medium">{content.title || '비상연락망'}</p>
        <div className="space-y-3">
          {content.entries.length === 0 && (
            <p className="text-sm text-muted-foreground">등록된 연락처가 없습니다.</p>
          )}
          {content.entries.map((entry, index) => (
            <div key={index} className="flex items-start gap-3 rounded-lg border p-3">
              <div className="mt-0.5 rounded-full bg-primary/10 p-1.5 text-primary">
                <Phone className="size-4" />
              </div>
              <div>
                <p className="font-medium text-sm">{entry.label || '구분 없음'}</p>
                <p className="text-sm text-muted-foreground">{entry.phone || '번호 없음'}</p>
                {entry.available && (
                  <p className="text-xs text-muted-foreground mt-1">{entry.available}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleAddEntry = () => {
    onChange({
      ...content,
      entries: [...content.entries, { label: '', phone: '', available: '' }],
    });
  };

  const handleRemoveEntry = (index: number) => {
    const newEntries = [...content.entries];
    newEntries.splice(index, 1);
    onChange({ ...content, entries: newEntries });
  };

  const handleChangeEntry = (index: number, field: keyof ContactEntry, value: string) => {
    const newEntries = [...content.entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    onChange({ ...content, entries: newEntries });
  };

  return (
    <div className="space-y-4">
      <Input
        value={content.title ?? ''}
        onChange={(e) => onChange({ ...content, title: e.target.value })}
        placeholder="연락처 목록 제목 (예: 비상연락망)"
      />
      
      <div className="space-y-3">
        {content.entries.map((entry, index) => (
          <div key={index} className="flex flex-col gap-2 rounded-lg border p-3 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 size-7 text-destructive"
              onClick={() => handleRemoveEntry(index)}
            >
              <Trash2 className="size-3.5" />
            </Button>
            
            <div className="grid gap-2 pr-8">
              <Input
                value={entry.label}
                onChange={(e) => handleChangeEntry(index, 'label', e.target.value)}
                placeholder="구분 (예: 관리사무소, 긴급수리)"
                className="h-8 text-sm"
              />
              <Input
                value={entry.phone}
                onChange={(e) => handleChangeEntry(index, 'phone', e.target.value)}
                placeholder="전화번호 (예: 010-0000-0000)"
                className="h-8 text-sm"
              />
              <Input
                value={entry.available ?? ''}
                onChange={(e) => handleChangeEntry(index, 'available', e.target.value)}
                placeholder="가용 시간 (선택)"
                className="h-8 text-sm"
              />
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" className="w-full gap-2" onClick={handleAddEntry}>
        <Plus className="size-4" />
        연락처 추가
      </Button>
    </div>
  );
}
