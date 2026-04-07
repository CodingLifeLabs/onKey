import { z } from 'zod';

export const createSessionStep1Schema = z
  .object({
    roomNumber: z.string().min(1, '호실 번호를 입력해주세요'),
    tenantName: z.string().min(1, '입주자 이름을 입력해주세요'),
    moveInDate: z.string().min(1, '입주 예정일을 선택해주세요'),
    expiresAt: z.string().min(1, '만료일을 선택해주세요'),
    memo: z.string().max(500, '메모는 500자 이내로 입력해주세요').optional(),
  })
  .refine((data) => new Date(data.expiresAt) > new Date(data.moveInDate), {
    message: '만료일은 입주일 이후여야 합니다',
    path: ['expiresAt'],
  });

export type CreateSessionStep1 = z.infer<typeof createSessionStep1Schema>;
