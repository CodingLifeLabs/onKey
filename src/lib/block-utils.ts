import { nanoid } from 'nanoid';
import type {
  Block,
  BlockType,
  HeadingBlock,
  TextBlock,
  ImageBlock,
  DividerBlock,
  ChecklistBlock,
  SignatureBlock,
  VideoBlock,
  ContactBlock,
} from '@/types/block';

function createBlock(type: BlockType): Block {
  const base = { id: `blk_${nanoid(10)}`, order: 0, required: false };
  switch (type) {
    case 'heading':
      return { ...base, type: 'heading', content: { text: '', level: 2 } } satisfies HeadingBlock;
    case 'text':
      return { ...base, type: 'text', content: { html: '' } } satisfies TextBlock;
    case 'image':
      return { ...base, type: 'image', content: { url: '', alt: '' } } satisfies ImageBlock;
    case 'divider':
      return { ...base, type: 'divider', content: {} } satisfies DividerBlock;
    case 'checklist':
      return { ...base, type: 'checklist', required: true, content: { title: '', items: [] } } satisfies ChecklistBlock;
    case 'signature':
      return {
        ...base,
        type: 'signature',
        required: true,
        content: { title: '입주자 서명', description: '위 안내 사항을 모두 확인하였습니다', collect_name: true, collect_canvas: true },
      } satisfies SignatureBlock;
    case 'video':
      return { ...base, type: 'video', content: { url: '', embed_url: '', caption: '' } } satisfies VideoBlock;
    case 'contact':
      return { ...base, type: 'contact', content: { title: '비상연락망', entries: [] } } satisfies ContactBlock;
    default:
      return { ...base, type: 'divider', content: {} } satisfies DividerBlock;
  }
}

export function addBlock(
  blocks: Block[],
  type: BlockType,
  index?: number,
): Block[] {
  const newBlock = createBlock(type);
  const insertAt = index ?? blocks.length;
  const updated = [...blocks];
  updated.splice(insertAt, 0, newBlock);
  return updated.map((b, i) => ({ ...b, order: i }));
}

export function removeBlock(blocks: Block[], blockId: string): Block[] {
  return blocks
    .filter((b) => b.id !== blockId)
    .map((b, i) => ({ ...b, order: i }));
}

export function moveBlockUp(blocks: Block[], blockId: string): Block[] {
  const index = blocks.findIndex((b) => b.id === blockId);
  if (index <= 0) return blocks;

  const updated = [...blocks];
  [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
  return updated.map((b, i) => ({ ...b, order: i }));
}

export function moveBlockDown(blocks: Block[], blockId: string): Block[] {
  const index = blocks.findIndex((b) => b.id === blockId);
  if (index < 0 || index >= blocks.length - 1) return blocks;

  const updated = [...blocks];
  [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
  return updated.map((b, i) => ({ ...b, order: i }));
}

export function updateBlockContent(
  blocks: Block[],
  blockId: string,
  content: Block['content'],
): Block[] {
  return blocks.map((b) =>
    b.id === blockId ? ({ ...b, content } as Block) : b,
  );
}

export function duplicateBlock(blocks: Block[], blockId: string): Block[] {
  const index = blocks.findIndex((b) => b.id === blockId);
  if (index < 0) return blocks;

  const targetBlock = blocks[index];
  const newBlock = {
    ...targetBlock,
    id: `blk_${nanoid(10)}`,
    // deep copy the content to avoid reference sharing
    content: JSON.parse(JSON.stringify(targetBlock.content)),
  };

  const updated = [...blocks];
  updated.splice(index + 1, 0, newBlock as Block);
  return updated.map((b, i) => ({ ...b, order: i }));
}
