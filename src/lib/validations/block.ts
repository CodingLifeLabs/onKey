import { z } from 'zod';

// Heading block content
export const headingContentSchema = z.object({
  text: z.string().min(1, '제목을 입력해주세요'),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
});

// Text block content
export const textContentSchema = z.object({
  html: z.string().min(1, '내용을 입력해주세요'),
});

// Image block content
export const imageContentSchema = z.object({
  url: z.string().url('올바른 이미지 URL을 입력해주세요'),
  alt: z.string().min(1, '이미지 설명을 입력해주세요'),
  caption: z.string().optional(),
  width: z.enum(['full', 'half']).optional(),
});

// Checklist block content
const checklistItemSchema = z.object({
  id: z.string(),
  label: z.string().min(1, '항목명을 입력해주세요'),
  required: z.boolean(),
});

export const checklistContentSchema = z.object({
  title: z.string().optional(),
  items: z.array(checklistItemSchema).min(1, '최소 1개의 항목이 필요합니다'),
});

// Signature block content
export const signatureContentSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  collect_name: z.boolean(),
  collect_canvas: z.boolean(),
});

// Divider block content
export const dividerContentSchema = z.record(z.string(), z.never());
