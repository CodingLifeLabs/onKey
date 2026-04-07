import type { Block } from '@/types/block';

export interface Template {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  content: Block[];
  createdAt: Date;
  updatedAt: Date;
}
