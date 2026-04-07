import { describe, it, expect } from 'vitest';
import {
  headingContentSchema,
  textContentSchema,
  imageContentSchema,
  dividerContentSchema,
  checklistContentSchema,
  signatureContentSchema,
} from '@/lib/validations/block';

describe('headingContentSchema', () => {
  it('유효한 heading content를 통과시킨다', () => {
    const result = headingContentSchema.safeParse({
      text: '관리비 납부 안내',
      level: 2,
    });
    expect(result.success).toBe(true);
  });

  it('빈 text는 실패한다', () => {
    const result = headingContentSchema.safeParse({ text: '', level: 2 });
    expect(result.success).toBe(false);
  });

  it('level이 1~3이 아니면 실패한다', () => {
    const result = headingContentSchema.safeParse({ text: '제목', level: 4 });
    expect(result.success).toBe(false);
  });
});

describe('textContentSchema', () => {
  it('유효한 html content를 통과시킨다', () => {
    const result = textContentSchema.safeParse({
      html: '<p>안내 내용입니다.</p>',
    });
    expect(result.success).toBe(true);
  });

  it('빈 html은 실패한다', () => {
    const result = textContentSchema.safeParse({ html: '' });
    expect(result.success).toBe(false);
  });
});

describe('imageContentSchema', () => {
  it('유효한 image content를 통과시킨다', () => {
    const result = imageContentSchema.safeParse({
      url: 'https://example.com/img.png',
      alt: '안내 이미지',
    });
    expect(result.success).toBe(true);
  });

  it('caption과 width는 선택이다', () => {
    const result = imageContentSchema.safeParse({
      url: 'https://example.com/img.png',
      alt: '이미지',
      caption: '캡션',
      width: 'half',
    });
    expect(result.success).toBe(true);
  });

  it('url이 아니면 실패한다', () => {
    const result = imageContentSchema.safeParse({
      url: 'not-a-url',
      alt: '이미지',
    });
    expect(result.success).toBe(false);
  });

  it('alt가 없으면 실패한다', () => {
    const result = imageContentSchema.safeParse({
      url: 'https://example.com/img.png',
      alt: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('dividerContentSchema', () => {
  it('빈 객체를 통과시킨다', () => {
    const result = dividerContentSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('값이 있으면 실패한다', () => {
    const result = dividerContentSchema.safeParse({ foo: 'bar' });
    expect(result.success).toBe(false);
  });
});

describe('checklistContentSchema', () => {
  it('유효한 checklist content를 통과시킨다', () => {
    const result = checklistContentSchema.safeParse({
      title: '입주 전 확인사항',
      items: [{ id: 'abc12345', label: '열쇠 수령', required: true }],
    });
    expect(result.success).toBe(true);
  });

  it('title 없이도 통과한다', () => {
    const result = checklistContentSchema.safeParse({
      items: [{ id: 'abc12345', label: '확인', required: true }],
    });
    expect(result.success).toBe(true);
  });

  it('items가 빈 배열이면 실패한다', () => {
    const result = checklistContentSchema.safeParse({ title: '제목', items: [] });
    expect(result.success).toBe(false);
  });

  it('항목 label이 빈 문자열이면 실패한다', () => {
    const result = checklistContentSchema.safeParse({
      items: [{ id: 'abc12345', label: '', required: true }],
    });
    expect(result.success).toBe(false);
  });
});

describe('signatureContentSchema', () => {
  it('유효한 signature content를 통과시킨다', () => {
    const result = signatureContentSchema.safeParse({
      title: '입주자 서명',
      description: '위 안내 사항을 모두 확인하였습니다',
      collect_name: true,
      collect_canvas: true,
    });
    expect(result.success).toBe(true);
  });

  it('title과 description 없이도 통과한다', () => {
    const result = signatureContentSchema.safeParse({
      collect_name: false,
      collect_canvas: true,
    });
    expect(result.success).toBe(true);
  });

  it('collect_name이 boolean이 아니면 실패한다', () => {
    const result = signatureContentSchema.safeParse({
      collect_name: 'yes',
      collect_canvas: true,
    });
    expect(result.success).toBe(false);
  });

  it('collect_canvas가 누락되면 실패한다', () => {
    const result = signatureContentSchema.safeParse({
      collect_name: true,
    });
    expect(result.success).toBe(false);
  });
});
