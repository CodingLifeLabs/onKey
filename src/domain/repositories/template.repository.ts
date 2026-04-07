import type { Template } from '@/domain/entities/template.entity';
import type { Block } from '@/types/block';

export interface ITemplateRepository {
  findById(id: string): Promise<Template | null>;
  findByOwnerId(ownerId: string): Promise<Template[]>;
  findSystemTemplates(): Promise<Template[]>;
  create(data: {
    ownerId: string;
    name: string;
    description?: string;
    content: Block[];
    isSystem?: boolean;
  }): Promise<Template>;
  update(id: string, data: {
    name?: string;
    description?: string;
    content?: Block[];
  }): Promise<Template>;
  delete(id: string): Promise<void>;
}
