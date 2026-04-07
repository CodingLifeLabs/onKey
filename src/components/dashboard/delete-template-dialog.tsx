'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { deleteTemplate } from '@/app/actions/delete-template';
import type { Template } from '@/domain/entities/template.entity';

interface DeleteTemplateDialogProps {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function DeleteTemplateDialog({
  template,
  open,
  onOpenChange,
  onDeleted,
}: DeleteTemplateDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!template) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTemplate(template.id);
      onDeleted();
      onOpenChange(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>템플릿 삭제</DialogTitle>
          <DialogDescription>
            &quot;{template.name}&quot; 템플릿을 삭제하시겠습니까? 이 작업은 되돌릴
            수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
