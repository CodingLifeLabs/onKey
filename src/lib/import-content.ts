import { nanoid } from 'nanoid';
import type { Block, HeadingBlock, TextBlock, DividerBlock } from '@/types/block';

/**
 * 텍스트/마크다운을 Block[]으로 변환합니다.
 *
 * 변환 규칙:
 * - # → h1, ## → h2, ### → h3
 * - --- / *** / ___ → divider
 * - 빈 줄 → 블록 구분
 * - 나머지 텍스트 → text 블록 (여러 줄은 하나의 text 블록으로 병합)
 */
export function parseTextToBlocks(input: string): Block[] {
  const lines = input.split('\n');
  const blocks: Block[] = [];
  let pendingTextLines: string[] = [];

  function flushText() {
    if (pendingTextLines.length === 0) return;

    const text = pendingTextLines.join('\n').trim();
    if (text) {
      blocks.push({
        id: `blk_${nanoid(10)}`,
        type: 'text',
        order: 0,
        required: false,
        content: { html: text },
      } satisfies TextBlock);
    }
    pendingTextLines = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // 빈 줄 = 블록 구분
    if (line === '') {
      flushText();
      continue;
    }

    // 구분선
    if (/^[-*_]{3,}$/.test(line)) {
      flushText();
      blocks.push({
        id: `blk_${nanoid(10)}`,
        type: 'divider',
        order: 0,
        required: false,
        content: {},
      } satisfies DividerBlock);
      continue;
    }

    // 제목 — markdown 헤딩
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushText();
      const level = headingMatch[1].length as 1 | 2 | 3;
      blocks.push({
        id: `blk_${nanoid(10)}`,
        type: 'heading',
        order: 0,
        required: false,
        content: { text: headingMatch[2].trim(), level },
      } satisfies HeadingBlock);
      continue;
    }

    // 일반 텍스트 누적
    pendingTextLines.push(rawLine);
  }

  flushText();

  // order 재부여
  return blocks.map((b, i) => ({ ...b, order: i }));
}
