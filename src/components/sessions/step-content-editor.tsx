'use client';

import { useState } from 'react';
import type { Block } from '@/types/block';
import {
  addBlock,
  removeBlock,
  moveBlockUp,
  moveBlockDown,
  updateBlockContent,
  duplicateBlock,
} from '@/lib/block-utils';
import { BlockToolbar } from '@/components/editor/block-toolbar';
import { BlockList } from '@/components/editor/block-list';
import { ImportContentDialog } from '@/components/editor/import-content-dialog';
import { Button } from '@/components/ui/button';

interface StepContentEditorProps {
  initialBlocks: Block[];
  onNext: (blocks: Block[]) => void;
  onBack: () => void;
  canImport?: boolean;
}

export function StepContentEditor({
  initialBlocks,
  onNext,
  onBack,
  canImport,
}: StepContentEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [preview, setPreview] = useState(false);

  function handleAdd(type: Block['type']) {
    setBlocks((prev) => addBlock(prev, type));
  }

  function handleRemove(blockId: string) {
    setBlocks((prev) => removeBlock(prev, blockId));
  }

  function handleMoveUp(blockId: string) {
    setBlocks((prev) => moveBlockUp(prev, blockId));
  }

  function handleMoveDown(blockId: string) {
    setBlocks((prev) => moveBlockDown(prev, blockId));
  }

  function handleContentChange(blockId: string, content: Block['content']) {
    setBlocks((prev) => updateBlockContent(prev, blockId, content));
  }

  function handleDuplicate(blockId: string) {
    setBlocks((prev) => duplicateBlock(prev, blockId));
  }

  function handleInsertAt(type: Block['type'], index: number) {
    setBlocks((prev) => addBlock(prev, type, index));
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">콘텐츠 편집</h2>
        <p className="text-sm text-muted-foreground">
          입주자에게 안내할 내용을 작성하세요. 블록을 추가·편집·순서 변경할 수 있습니다.
        </p>
      </div>

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
        <span className="text-sm text-muted-foreground">
          {blocks.length}개 블록
        </span>
      </div>

      {!preview && (
        <div className="flex items-center gap-2">
          <BlockToolbar onAdd={handleAdd} />
          {canImport && (
            <ImportContentDialog
              onImport={(imported) => {
                setBlocks((prev) => {
                  const merged = [...prev, ...imported];
                  return merged.map((b, i) => ({ ...b, order: i }));
                });
              }}
            />
          )}
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

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          이전
        </Button>
        <Button
          onClick={() => {
            const hasSignature = blocks.some((b) => b.type === 'signature');
            if (!hasSignature) {
              const ok = window.confirm('서명 블록이 없습니다. 입주자 서명이 수집되지 않습니다.\n\n계속 진행하시겠습니까?');
              if (!ok) return;
            }
            onNext(blocks);
          }}
        >
          세션 생성
        </Button>
      </div>
    </div>
  );
}
