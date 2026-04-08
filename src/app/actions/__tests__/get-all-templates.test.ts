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

const profileData = { id: 'profile-1' };

const systemTemplates = [
  {
    id: 'sys-1',
    owner_id: null,
    name: '기본 오피스텔',
    description: '기본 안내',
    is_system: true,
    content: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

const userTemplates = [
  {
    id: 'user-1',
    owner_id: 'profile-1',
    name: '내 템플릿',
    description: null,
    is_system: false,
    content: [{ type: 'heading', id: 'b1', content: { text: '제목' } }],
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
  },
];

describe('getAllTemplates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('시스템 + 사용자 템플릿을 분리해서 반환한다', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: profileData }),
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
                order: vi.fn().mockResolvedValue({ data: systemTemplates }),
              }),
            }),
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: userTemplates }),
            }),
          }),
        };
      }
      return {};
    });

    const { getAllTemplates } = await import('../get-all-templates');
    const result = await getAllTemplates();

    expect(result.system).toHaveLength(1);
    expect(result.system[0].name).toBe('기본 오피스텔');
    expect(result.system[0].isSystem).toBe(true);
    expect(result.user).toHaveLength(1);
    expect(result.user[0].name).toBe('내 템플릿');
    expect(result.user[0].isSystem).toBe(false);
  });

  it('프로필이 없으면 빈 배열을 반환한다', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null }),
            }),
          }),
        };
      }
      return {};
    });

    const { getAllTemplates } = await import('../get-all-templates');
    const result = await getAllTemplates();
    expect(result).toEqual({ system: [], user: [] });
  });
});
