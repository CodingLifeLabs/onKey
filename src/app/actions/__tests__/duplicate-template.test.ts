import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFrom = vi.fn();

vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: () => ({
    from: mockFrom,
  }),
}));

vi.mock('@clerk/nextjs/server', () => ({
  auth: () =>
    Promise.resolve({
      userId: 'user_test123',
      sessionId: 'session_test',
      getToken: () => Promise.resolve('mock-token'),
    }),
}));

describe('duplicateTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('시스템 템플릿을 복제한다', async () => {
    const sourceData = {
      id: 'sys-1',
      owner_id: null,
      name: '기본 오피스텔',
      description: '기본',
      is_system: true,
      content: [{ type: 'heading', id: 'b1', content: { text: '환영합니다' } }],
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };

    const duplicatedData = {
      id: 'dup-1',
      owner_id: 'profile-1',
      name: '기본 오피스텔 (복사본)',
      description: '기본',
      is_system: false,
      content: sourceData.content,
      created_at: '2026-04-04T00:00:00Z',
      updated_at: '2026-04-04T00:00:00Z',
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
                single: vi.fn().mockResolvedValue({ data: sourceData }),
              }),
            }),
          };
        }
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: duplicatedData }),
            }),
          }),
        };
      }
      return {};
    });

    const { duplicateTemplate } = await import('../duplicate-template');
    const result = await duplicateTemplate('sys-1');

    expect(result.name).toBe('기본 오피스텔 (복사본)');
    expect(result.isSystem).toBe(false);
    expect(result.content).toHaveLength(1);
  });

  it('원본이 없으면 에러를 발생시킨다', async () => {
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
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
          }),
        }),
      };
    });

    const { duplicateTemplate } = await import('../duplicate-template');
    await expect(duplicateTemplate('nonexist')).rejects.toThrow(
      '원본 템플릿을 찾을 수 없습니다',
    );
  });
});
