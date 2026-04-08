import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFrom = vi.fn();

vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: () => ({
    from: mockFrom,
  }),
}));

vi.mock('@/lib/auth/server', () => ({
  requireUserId: vi.fn().mockResolvedValue('user_test123'),
}));

describe('deleteTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('사용자 템플릿을 삭제한다', async () => {
    const templateData = {
      owner_id: 'profile-1',
      is_system: false,
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: 'profile-1' } }),
            }),
          }),
        };
      }
      if (table === 'templates') {
        const callCount = mockFrom.mock.calls.filter(
          (c: string[]) => c[0] === 'templates',
        ).length;
        if (callCount === 1) {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: templateData }),
              }),
            }),
          };
        }
        return {
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        };
      }
      return {};
    });

    const { deleteTemplate } = await import('../delete-template');
    await expect(deleteTemplate('user-1')).resolves.toBeUndefined();
  });

  it('시스템 템플릿은 삭제할 수 없다', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: 'profile-1' } }),
            }),
          }),
        };
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { owner_id: null, is_system: true },
            }),
          }),
        }),
      };
    });

    const { deleteTemplate } = await import('../delete-template');
    await expect(deleteTemplate('sys-1')).rejects.toThrow(
      '시스템 템플릿은 삭제할 수 없습니다',
    );
  });

  it('다른 사용자의 템플릿은 삭제할 수 없다', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: 'profile-1' } }),
            }),
          }),
        };
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { owner_id: 'other-profile', is_system: false },
            }),
          }),
        }),
      };
    });

    const { deleteTemplate } = await import('../delete-template');
    await expect(deleteTemplate('other-1')).rejects.toThrow(
      '삭제 권한이 없습니다',
    );
  });

  it('템플릿이 없으면 에러를 발생시킨다', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: 'profile-1' } }),
            }),
          }),
        };
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null }),
          }),
        }),
      };
    });

    const { deleteTemplate } = await import('../delete-template');
    await expect(deleteTemplate('nonexist')).rejects.toThrow(
      '템플릿을 찾을 수 없습니다',
    );
  });
});
