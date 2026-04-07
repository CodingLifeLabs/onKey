'use client';

import type { BlockType } from '@/types/block';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Plus, Heading, Type, ImageIcon, Minus, CheckSquare, PenLine, Video, Phone } from 'lucide-react';

interface BlockToolbarProps {
  onAdd: (type: BlockType) => void;
}

const blockOptions: { type: BlockType; label: string; icon: React.ReactNode }[] = [
  { type: 'heading', label: '제목', icon: <Heading className="size-4" /> },
  { type: 'text', label: '텍스트', icon: <Type className="size-4" /> },
  { type: 'image', label: '이미지', icon: <ImageIcon className="size-4" /> },
  { type: 'divider', label: '구분선', icon: <Minus className="size-4" /> },
  { type: 'checklist', label: '체크리스트', icon: <CheckSquare className="size-4" /> },
  { type: 'contact', label: '연락처', icon: <Phone className="size-4" /> },
  { type: 'video', label: '동영상', icon: <Video className="size-4" /> },
  { type: 'signature', label: '서명', icon: <PenLine className="size-4" /> },
];

export function BlockToolbar({ onAdd }: BlockToolbarProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="size-4" />
            블록 추가
          </Button>
        }
      />
      <DropdownMenuContent>
        {blockOptions.map((opt) => (
          <DropdownMenuItem key={opt.type} onClick={() => onAdd(opt.type)}>
            <span className="flex items-center gap-2">
              {opt.icon}
              {opt.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
