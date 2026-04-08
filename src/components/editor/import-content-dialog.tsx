'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileUp } from 'lucide-react';
import { parseTextToBlocks } from '@/lib/import-content';
import type { Block } from '@/types/block';

const blockLabel: Record<string, string> = {
  heading: '제목',
  text: '텍스트',
  divider: '구분선',
};

interface ImportContentDialogProps {
  onImport: (blocks: Block[]) => void;
}

export function ImportContentDialog({ onImport }: ImportContentDialogProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [previewBlocks, setPreviewBlocks] = useState<Block[]>([]);

  function handleParse() {
    const blocks = parseTextToBlocks(text);
    setPreviewBlocks(blocks);
  }

  function handleImport() {
    const blocks = previewBlocks.length > 0 ? previewBlocks : parseTextToBlocks(text);
    if (blocks.length > 0) {
      onImport(blocks);
      setOpen(false);
      setText('');
      setPreviewBlocks([]);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setPreviewBlocks([]); }}>
      <DialogTrigger
        render={<Button variant="outline" size="sm" className="gap-2" />}
      >
        <FileUp className="h-4 w-4" />
        가져오기
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>문서 가져오기</DialogTitle>
          <DialogDescription>
            기존 입주 안내 문서 내용을 붙여넣으세요. 제목과 텍스트 블록으로 자동 변환됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto min-h-0 flex-1">
          <Textarea
            placeholder={`# 입주 안내사항\n\n입주를 축하드립니다...\n\n## 주차 안내\n\n지하 1~2층 주차장을 사용하실 수 있습니다.\n\n---\n\n## 쓰레기 분리수거\n\n쓰레기 분리수거는 매일 오전 8시까지...`}
            value={text}
            onChange={(e) => { setText(e.target.value); setPreviewBlocks([]); }}
            rows={10}
            className="font-mono text-sm resize-none"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              # 제목, --- 구분선 자동 인식
            </span>
            <Button variant="outline" size="sm" onClick={handleParse} disabled={!text.trim()}>
              변환 미리보기
            </Button>
          </div>

          {previewBlocks.length > 0 && (
            <div className="rounded-md border bg-muted/50 p-3">
              <p className="text-xs font-medium mb-2">
                {previewBlocks.length}개 블록으로 변환됨
              </p>
              <div className="space-y-1">
                {previewBlocks.map((block) => (
                  <div key={block.id} className="flex items-center gap-2 text-xs">
                    <span className="rounded bg-background px-1.5 py-0.5 font-medium">
                      {blockLabel[block.type] ?? block.type}
                    </span>
                    <span className="text-muted-foreground truncate max-w-[300px]">
                      {block.type === 'heading'
                        ? (block.content as { text: string }).text
                        : block.type === 'text'
                          ? (block.content as { html: string }).html.slice(0, 60)
                          : '─────────'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0">
          <DialogClose render={<Button variant="outline" />}>
            취소
          </DialogClose>
          <Button onClick={handleImport} disabled={!text.trim()}>
            가져오기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
