'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createTemplate } from '@/app/actions/create-template';

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTemplateDialog({
  open,
  onOpenChange,
}: CreateTemplateDialogProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsCreating(true);
    try {
      const template = await createTemplate({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      onOpenChange(false);
      setName('');
      setDescription('');
      router.push(`/templates/${template.id}/edit`);
    } catch (err) {
      alert(err instanceof Error ? err.message : '생성에 실패했습니다');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setName('');
      setDescription('');
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 템플릿</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">이름</Label>
            <Input
              id="template-name"
              placeholder="예: 원룸 입주 안내"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isCreating}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-description">설명 (선택)</Label>
            <Input
              id="template-description"
              placeholder="템플릿에 대한 간단한 설명"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isCreating}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isCreating}
            >
              취소
            </Button>
            <Button type="submit" disabled={!name.trim() || isCreating}>
              {isCreating ? '생성 중...' : '생성'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
