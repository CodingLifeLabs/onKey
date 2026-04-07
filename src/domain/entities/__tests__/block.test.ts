import { describe, it, expect } from 'vitest';
import type {
  Block,
  HeadingBlock,
  TextBlock,
  ImageBlock,
  ChecklistBlock,
  SignatureBlock,
  ContactBlock,
} from '@/types/block';

describe('Block 타입 검증', () => {
  const headingBlock: HeadingBlock = {
    id: 'blk_001',
    type: 'heading',
    order: 0,
    required: false,
    content: { text: '관리비 납부 안내', level: 2 },
  };

  const textBlock: TextBlock = {
    id: 'blk_002',
    type: 'text',
    order: 1,
    required: false,
    content: { html: '<p>안내 내용입니다.</p>' },
  };

  const imageBlock: ImageBlock = {
    id: 'blk_003',
    type: 'image',
    order: 2,
    required: false,
    content: { url: 'https://example.com/img.png', alt: '안내 이미지' },
  };

  const checklistBlock: ChecklistBlock = {
    id: 'blk_004',
    type: 'checklist',
    order: 3,
    required: true,
    content: {
      title: '확인 사항',
      items: [
        { id: 'itm_001', label: '도어락 변경', required: true },
        { id: 'itm_002', label: '자동이체 신청', required: true },
      ],
    },
  };

  const contactBlock: ContactBlock = {
    id: 'blk_005',
    type: 'contact',
    order: 4,
    required: false,
    content: {
      title: '비상 연락처',
      entries: [
        { label: '관리자', phone: '010-1234-5678', available: '평일 09~18시' },
      ],
    },
  };

  const signatureBlock: SignatureBlock = {
    id: 'blk_006',
    type: 'signature',
    order: 5,
    required: true,
    content: {
      title: '입주자 서명',
      description: '위 안내 사항을 모두 확인하였습니다.',
      collect_name: true,
      collect_canvas: true,
    },
  };

  it('모든 블록 타입이 올바른 구조를 가진다', () => {
    const blocks: Block[] = [
      headingBlock,
      textBlock,
      imageBlock,
      checklistBlock,
      contactBlock,
      signatureBlock,
    ];

    expect(blocks).toHaveLength(6);
    blocks.forEach((block) => {
      expect(block.id).toBeTruthy();
      expect(block.type).toBeTruthy();
      expect(typeof block.order).toBe('number');
      expect(typeof block.required).toBe('boolean');
    });
  });

  it('checklist는 항상 required이다', () => {
    expect(checklistBlock.required).toBe(true);
  });

  it('signature는 항상 required이다', () => {
    expect(signatureBlock.required).toBe(true);
  });

  it('checklist 항목에 id와 label이 있다', () => {
    checklistBlock.content.items.forEach((item) => {
      expect(item.id).toBeTruthy();
      expect(item.label).toBeTruthy();
      expect(typeof item.required).toBe('boolean');
    });
  });

  it('contact 항목에 label과 phone이 있다', () => {
    contactBlock.content.entries.forEach((entry) => {
      expect(entry.label).toBeTruthy();
      expect(entry.phone).toBeTruthy();
    });
  });
});
