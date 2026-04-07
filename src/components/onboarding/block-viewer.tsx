'use client';

import type { Block } from '@/types/block';
import { HeadingViewer } from './blocks/heading-viewer';
import { TextViewer } from './blocks/text-viewer';
import { ImageViewer } from './blocks/image-viewer';
import { DividerViewer } from './blocks/divider-viewer';
import { ChecklistViewer } from './blocks/checklist-viewer';
import { SignatureViewer } from './blocks/signature-viewer';
import { ContactViewer } from './blocks/contact-viewer';
import { VideoViewer } from './blocks/video-viewer';

interface BlockViewerProps {
  block: Block;
  sessionId: string;
  checkedItems: string[];
  onCheck: (itemId: string, checked: boolean) => void;
  onSigned: (name: string, imageUrl: string) => void;
}

export function BlockViewer({
  block,
  sessionId,
  checkedItems,
  onCheck,
  onSigned,
}: BlockViewerProps) {
  switch (block.type) {
    case 'heading':
      return <HeadingViewer block={block} />;
    case 'text':
      return <TextViewer block={block} />;
    case 'image':
      return <ImageViewer block={block} />;
    case 'divider':
      return <DividerViewer />;
    case 'checklist':
      return (
        <ChecklistViewer
          block={block}
          checkedItems={checkedItems}
          onCheck={onCheck}
        />
      );
    case 'signature':
      return (
        <SignatureViewer
          block={block}
          sessionId={sessionId}
          onSigned={onSigned}
        />
      );
    case 'contact':
      return <ContactViewer block={block} />;
    case 'video':
      return <VideoViewer block={block} />;
    default:
      return null;
  }
}
