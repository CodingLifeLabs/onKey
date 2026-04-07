import type { Block } from '@/types/block';

export type SessionStatus = 'pending' | 'in_progress' | 'completed' | 'expired';

export interface Session {
  id: string;
  ownerId: string;
  templateId: string | null;
  token: string;
  tenantName: string;
  roomNumber: string | null;
  moveInDate: Date | null;
  expiresAt: Date;
  status: SessionStatus;
  contentSnapshot: Block[];
  tenantIp: string | null;
  createdAt: Date;
  completedAt: Date | null;
}
