import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(1, '이름을 입력해주세요')
    .max(50, '이름은 50자 이내로 입력해주세요'),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
