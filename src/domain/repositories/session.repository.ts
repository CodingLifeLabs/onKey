import type { Session, SessionStatus } from '@/domain/entities/session.entity';
import type { SessionProgress } from '@/domain/entities/session-progress.entity';
import type { Block } from '@/types/block';

export interface ISessionRepository {
  findById(id: string): Promise<Session | null>;
  findByToken(token: string): Promise<Session | null>;
  findByOwnerId(ownerId: string): Promise<Session[]>;
  findByOwnerIdFiltered(
    ownerId: string,
    options?: {
      status?: SessionStatus;
      search?: string;
      sortBy?: 'created_at' | 'expires_at' | 'tenant_name';
      sortOrder?: 'asc' | 'desc';
      page?: number;
      pageSize?: number;
    },
  ): Promise<{
    sessions: Session[];
    counts: Record<SessionStatus, number>;
    totalFiltered: number;
  }>;
  create(data: {
    ownerId: string;
    templateId?: string;
    tenantName: string;
    roomNumber?: string;
    moveInDate?: Date;
    expiresAt: Date;
    contentSnapshot: Block[];
  }): Promise<Session>;
  updateStatus(id: string, status: SessionStatus): Promise<Session>;
  delete(id: string): Promise<void>;
}

export interface ISessionProgressRepository {
  findBySessionId(sessionId: string): Promise<SessionProgress | null>;
  create(sessionId: string): Promise<SessionProgress>;
  updateProgress(data: {
    sessionId: string;
    viewedSections?: string[];
    checkedItems?: string[];
    signatureName?: string;
    signatureImageUrl?: string;
    submittedAt?: Date;
  }): Promise<SessionProgress>;
}
