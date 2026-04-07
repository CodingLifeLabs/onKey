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

describe('createTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('새 템플릿을 생성한다', async () => {
    const insertedData = {
      id: 'new-1',
      owner_id: 'profile-1',
      name: '새 템플릿',
      description: '설명',
      is_system: false,
      content: [],
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
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: insertedData }),
            }),
          }),
        };
      }
      return {};
    });

    const { createTemplate } = await import('../create-template');
    const result = await createTemplate({ name: '새 템플릿', description: '설명' });

    expect(result.name).toBe('새 템플릿');
    expect(result.isSystem).toBe(false);
    expect(result.content).toEqual([]);
  });

  it('프로필이 없으면 에러를 발생시킨다', async () => {
    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
    }));

    const { createTemplate } = await import('../create-template');
    await expect(
      createTemplate({ name: 'test' }),
    ).rejects.toThrow('프로필을 찾을 수 없습니다');
  });
});
