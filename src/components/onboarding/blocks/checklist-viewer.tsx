'use client';

import type { ChecklistBlock } from '@/types/block';
import { CheckSquare, Square } from 'lucide-react';

interface ChecklistViewerProps {
  block: ChecklistBlock;
  checkedItems: string[];
  onCheck: (itemId: string, checked: boolean) => void;
}

export function ChecklistViewer({ block, checkedItems, onCheck }: ChecklistViewerProps) {
  const { title, items } = block.content;

  return (
    <div className="space-y-2">
      {title && <p className="font-medium">{title}</p>}
      <ul className="space-y-2">
        {items.map((item) => {
          const isChecked = checkedItems.includes(item.id);
          return (
            <li key={item.id}>
              <button
                type="button"
                className="flex w-full items-center gap-2 text-left text-sm"
                onClick={() => onCheck(item.id, !isChecked)}
              >
                {isChecked ? (
                  <CheckSquare className="size-4 shrink-0 text-primary" />
                ) : (
                  <Square className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className={isChecked ? 'line-through text-muted-foreground' : ''}>
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
