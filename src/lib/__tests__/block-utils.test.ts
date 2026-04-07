import { describe, it, expect } from 'vitest';
import {
  addBlock,
  removeBlock,
  moveBlockUp,
  moveBlockDown,
  updateBlockContent,
  duplicateBlock,
} from '@/lib/block-utils';
import type { Block } from '@/types/block';

const headingBlock: Block = {
  id: 'blk_a',
  type: 'heading',
  order: 0,
  required: false,
  content: { text: '제목', level: 2 },
};

const textBlock: Block = {
  id: 'blk_b',
  type: 'text',
  order: 1,
  required: false,
  content: { html: '<p>내용</p>' },
};

const dividerBlock: Block = {
  id: 'blk_c',
  type: 'divider',
  order: 2,
  required: false,
  content: {},
};

describe('addBlock', () => {
  it('빈 배열에 블록을 추가한다', () => {
    const result = addBlock([], 'heading');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('heading');
    expect(result[0].order).toBe(0);
    expect(result[0].id).toMatch(/^blk_/);
  });

  it('특정 위치에 블록을 삽입한다', () => {
    const blocks = [headingBlock, textBlock];
    const result = addBlock(blocks, 'divider', 1);
    expect(result).toHaveLength(3);
    expect(result[1].type).toBe('divider');
    expect(result.map((b) => b.order)).toEqual([0, 1, 2]);
  });

  it('index를 생략하면 마지막에 추가한다', () => {
    const blocks = [headingBlock];
    const result = addBlock(blocks, 'text');
    expect(result).toHaveLength(2);
    expect(result[1].type).toBe('text');
  });

  it('heading 기본 content를 생성한다', () => {
    const result = addBlock([], 'heading');
    expect(result[0].content).toEqual({ text: '', level: 2 });
  });

  it('image 기본 content를 생성한다', () => {
    const result = addBlock([], 'image');
    expect(result[0].content).toEqual({ url: '', alt: '' });
  });

  it('checklist 기본 content를 생성한다', () => {
    const result = addBlock([], 'checklist');
    expect(result[0].type).toBe('checklist');
    expect(result[0].required).toBe(true);
    expect(result[0].content).toEqual({ title: '', items: [] });
  });

  it('signature 기본 content를 생성한다', () => {
    const result = addBlock([], 'signature');
    expect(result[0].type).toBe('signature');
    expect(result[0].required).toBe(true);
    expect(result[0].content).toEqual({
      title: '입주자 서명',
      description: '위 안내 사항을 모두 확인하였습니다',
      collect_name: true,
      collect_canvas: true,
    });
  });

  it('video 기본 content를 생성한다', () => {
    const result = addBlock([], 'video');
    expect(result[0].type).toBe('video');
    expect(result[0].content).toEqual({ url: '', embed_url: '', caption: '' });
  });

  it('contact 기본 content를 생성한다', () => {
    const result = addBlock([], 'contact');
    expect(result[0].type).toBe('contact');
    expect(result[0].content).toEqual({ title: '비상연락망', entries: [] });
  });
});

describe('removeBlock', () => {
  it('블록을 삭제하고 order를 재정렬한다', () => {
    const blocks = [headingBlock, textBlock, dividerBlock];
    const result = removeBlock(blocks, 'blk_b');
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('blk_a');
    expect(result[1].id).toBe('blk_c');
    expect(result.map((b) => b.order)).toEqual([0, 1]);
  });

  it('존재하지 않는 id면 그대로 반환한다', () => {
    const blocks = [headingBlock];
    const result = removeBlock(blocks, 'blk_z');
    expect(result).toEqual(blocks);
  });
});

describe('moveBlockUp', () => {
  it('두 번째 블록을 위로 이동한다', () => {
    const blocks = [headingBlock, textBlock, dividerBlock];
    const result = moveBlockUp(blocks, 'blk_b');
    expect(result[0].id).toBe('blk_b');
    expect(result[1].id).toBe('blk_a');
    expect(result.map((b) => b.order)).toEqual([0, 1, 2]);
  });

  it('첫 번째 블록이면 변경 없음', () => {
    const blocks = [headingBlock, textBlock];
    const result = moveBlockUp(blocks, 'blk_a');
    expect(result).toEqual(blocks);
  });
});

describe('moveBlockDown', () => {
  it('블록을 아래로 이동한다', () => {
    const blocks = [headingBlock, textBlock, dividerBlock];
    const result = moveBlockDown(blocks, 'blk_a');
    expect(result[0].id).toBe('blk_b');
    expect(result[1].id).toBe('blk_a');
    expect(result.map((b) => b.order)).toEqual([0, 1, 2]);
  });

  it('마지막 블록이면 변경 없음', () => {
    const blocks = [headingBlock, textBlock];
    const result = moveBlockDown(blocks, 'blk_b');
    expect(result).toEqual(blocks);
  });
});

describe('updateBlockContent', () => {
  it('지정한 블록의 content를 업데이트한다', () => {
    const blocks = [headingBlock, textBlock];
    const result = updateBlockContent(blocks, 'blk_a', {
      text: '변경된 제목',
      level: 1,
    });
    expect(result[0].content).toEqual({ text: '변경된 제목', level: 1 });
    expect(result[1]).toEqual(textBlock);
  });

  it('존재하지 않는 id면 변경 없음', () => {
    const blocks = [headingBlock];
    const result = updateBlockContent(blocks, 'blk_z', { text: 'x', level: 2 });
    expect(result).toEqual(blocks);
  });
});

describe('duplicateBlock', () => {
  it('지정한 블록을 복제하여 바로 뒤에 추가한다', () => {
    const blocks = [headingBlock, textBlock];
    const result = duplicateBlock(blocks, 'blk_a');
    expect(result).toHaveLength(3);
    // 원래 데이터 유지
    expect(result[0].id).toBe('blk_a');
    expect(result[0].content).toEqual(headingBlock.content);
    // 복제된 데이터
    expect(result[1].id).not.toBe('blk_a');
    expect(result[1].id).toMatch(/^blk_/);
    expect(result[1].type).toBe('heading');
    expect(result[1].content).toEqual(headingBlock.content);
    // order가 업데이트 되었는지
    expect(result.map((b) => b.order)).toEqual([0, 1, 2]);
    // 이후 블록은 밀림
    expect(result[2].id).toBe('blk_b');
  });

  it('존재하지 않는 id면 변경 없음', () => {
    const blocks = [headingBlock];
    const result = duplicateBlock(blocks, 'blk_z');
    expect(result).toEqual(blocks);
  });
});
