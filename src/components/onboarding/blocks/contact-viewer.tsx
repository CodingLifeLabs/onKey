'use client';

import type { ContactBlock } from '@/types/block';
import { Phone } from 'lucide-react';

interface ContactViewerProps {
  block: ContactBlock;
}

export function ContactViewer({ block }: ContactViewerProps) {
  const { content } = block;

  return (
    <div className="space-y-4">
      {content.title && <h3 className="font-semibold text-lg">{content.title}</h3>}
      
      {content.entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">등록된 연락처가 없습니다.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {content.entries.map((entry, idx) => (
            <a
              key={idx}
              href={entry.phone ? `tel:${entry.phone}` : '#'}
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <Phone className="size-5" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-medium text-sm text-foreground">{entry.label}</p>
                <p className="text-sm text-muted-foreground">{entry.phone}</p>
                {entry.available && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {entry.available}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
