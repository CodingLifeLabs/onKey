'use client';

import { useState } from 'react';
import type { Template } from '@/domain/entities/template.entity';
import type { Block } from '@/types/block';
import {
  addBlock,
  removeBlock,
  moveBlockUp,
  moveBlockDown,
  updateBlockContent,
  duplicateBlock,
} from '@/lib/block-utils';
import { updateTemplateContent } from '@/app/actions/update-template-content';
import { BlockToolbar } from './block-toolbar';
import { BlockList } from './block-list';
import { ImportContentDialog } from './import-content-dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useEffect } from 'react';

interface TemplateEditorProps {
  template: Template;
}

export function TemplateEditor({ template }: TemplateEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(template.content);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  function handleAdd(type: Block['type']) {
    setBlocks((prev) => addBlock(prev, type));
    setIsDirty(true);
  }

  function handleInsertAt(type: Block['type'], index: number) {
    setBlocks((prev) => addBlock(prev, type, index));
    setIsDirty(true);
  }

  function handleDuplicate(blockId: string) {
    setBlocks((prev) => duplicateBlock(prev, blockId));
    setIsDirty(true);
  }

  function handleRemove(blockId: string) {
    setBlocks((prev) => removeBlock(prev, blockId));
    setIsDirty(true);
  }

  function handleMoveUp(blockId: string) {
    setBlocks((prev) => moveBlockUp(prev, blockId));
    setIsDirty(true);
  }

  function handleMoveDown(blockId: string) {
    setBlocks((prev) => moveBlockDown(prev, blockId));
    setIsDirty(true);
  }

  function handleContentChange(blockId: string, content: Block['content']) {
    setBlocks((prev) => updateBlockContent(prev, blockId, content));
    setIsDirty(true);
  }

  async function handleSave() {
    // 필수 블록 검증
    const hasChecklist = blocks.some((b) => b.type === 'checklist');
    const hasSignature = blocks.some((b) => b.type === 'signature');
    const warnings: string[] = [];
    if (!hasSignature) warnings.push('서명 블록이 없습니다 — 입주자 서명이 수집되지 않습니다');
    if (!hasChecklist) warnings.push('체크리스트 블록이 없습니다 — 입주자 확인 체크가 생략됩니다');
    if (warnings.length > 0) {
      const proceed = window.confirm(
        `저장 전 확인:\n\n${warnings.join('\n')}\n\n그래도 저장하시겠습니까?`,
      );
      if (!proceed) return;
    }

    setSaving(true);
    try {
      await updateTemplateContent(template.id, blocks);
      setIsDirty(false);
      toast.success('템플릿이 저장되었습니다.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={preview ? 'outline' : 'default'}
            size="sm"
            onClick={() => setPreview(false)}
          >
            편집
          </Button>
          <Button
            variant={preview ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreview(true)}
          >
            미리보기
          </Button>
        </div>
        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? '저장 중...' : '저장'}
        </Button>
      </div>

      {!preview && (
        <div className="flex items-center gap-2">
          <BlockToolbar onAdd={handleAdd} />
          <ImportContentDialog
            onImport={(imported) => {
              setBlocks((prev) => {
                const merged = [...prev, ...imported];
                return merged.map((b, i) => ({ ...b, order: i }));
              });
              setIsDirty(true);
            }}
          />
        </div>
      )}

      <BlockList
        blocks={blocks}
        preview={preview}
        onRemove={handleRemove}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onDuplicate={handleDuplicate}
        onInsertAt={handleInsertAt}
        onContentChange={handleContentChange}
      />
    </div>
  );
}
