'use client';

import type { Block } from '@/types/block';
import { HeadingEditor } from './blocks/heading-editor';
import { TextEditor } from './blocks/text-editor';
import { ImageEditor } from './blocks/image-editor';
import { DividerEditor } from './blocks/divider-editor';
import { ChecklistEditor } from './blocks/checklist-editor';
import { SignatureEditor } from './blocks/signature-editor';
import { ContactEditor } from './blocks/contact-editor';
import { VideoEditor } from './blocks/video-editor';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Trash2, Copy } from 'lucide-react';
import { BlockToolbar } from './block-toolbar';
import { Card } from '@/components/ui/card';

interface BlockListProps {
  blocks: Block[];
  preview: boolean;
  onRemove: (blockId: string) => void;
  onMoveUp: (blockId: string) => void;
  onMoveDown: (blockId: string) => void;
  onDuplicate: (blockId: string) => void;
  onInsertAt: (type: Block['type'], index: number) => void;
  onContentChange: (blockId: string, content: Block['content']) => void;
}

function BlockEditor({
  block,
  preview,
  onContentChange,
}: {
  block: Block;
  preview: boolean;
  onContentChange: (content: Block['content']) => void;
}) {
  switch (block.type) {
    case 'heading':
      return (
        <HeadingEditor
          content={block.content}
          preview={preview}
          onChange={onContentChange}
        />
      );
    case 'text':
      return (
        <TextEditor
          content={block.content}
          preview={preview}
          onChange={onContentChange}
        />
      );
    case 'image':
      return (
        <ImageEditor
          content={block.content}
          preview={preview}
          onChange={onContentChange}
        />
      );
    case 'divider':
      return <DividerEditor />;
    case 'checklist':
      return (
        <ChecklistEditor
          content={block.content}
          preview={preview}
          onChange={onContentChange}
        />
      );
    case 'signature':
      return (
        <SignatureEditor
          content={block.content}
          preview={preview}
          onChange={onContentChange}
        />
      );
    case 'contact':
      return (
        <ContactEditor
          content={block.content}
          preview={preview}
          onChange={onContentChange}
        />
      );
    case 'video':
      return (
        <VideoEditor
          content={block.content}
          preview={preview}
          onChange={onContentChange}
        />
      );
    default:
      return null;
  }
}

export function BlockList({
  blocks,
  preview,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onInsertAt,
  onContentChange,
}: BlockListProps) {
  if (blocks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
        <div className="space-y-1">
          <p className="font-medium text-foreground">템플릿이 비어있습니다.</p>
          <p className="text-sm">상단의 [블록 추가] 버튼을 눌러 입주 안내, 연락처, 서명 등을 추가해 보세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => (
        <Card key={block.id} className="p-4">
          {!preview && (
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {block.type === 'heading' && '제목'}
                {block.type === 'text' && '텍스트'}
                {block.type === 'image' && '이미지'}
                {block.type === 'divider' && '구분선'}
                {block.type === 'checklist' && '체크리스트'}
                {block.type === 'signature' && '서명'}
                {block.type === 'video' && '동영상'}
                {block.type === 'contact' && '연락처'}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  disabled={index === 0}
                  onClick={() => onMoveUp(block.id)}
                >
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  disabled={index === blocks.length - 1}
                  onClick={() => onMoveDown(block.id)}
                >
                  <ArrowDown className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => onDuplicate(block.id)}
                >
                  <Copy className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-destructive"
                  onClick={() => onRemove(block.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
          <BlockEditor
            block={block}
            preview={preview}
            onContentChange={(content) => onContentChange(block.id, content)}
          />
          
          {!preview && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 opacity-0 transition-opacity focus-within:opacity-100 hover:opacity-100 pb-1">
              <BlockToolbar onAdd={(type) => onInsertAt(type, index + 1)} />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
