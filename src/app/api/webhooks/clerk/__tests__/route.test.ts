import { describe, it, expect, vi, beforeEach } from 'vitest';

// Supabase service client mock
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: () => ({
    from: mockFrom,
  }),
}));

// Svix mock
vi.mock('svix', () => ({
  Webhook: vi.fn().mockImplementation(() => ({
    verify: vi.fn().mockReturnValue({
      type: 'user.created',
      data: {
        id: 'user_test123',
        email_addresses: [{ email_address: 'test@onkey.app' }],
        first_name: '테스트',
        last_name: '사용자',
      },
    }),
  })),
}));

describe('Clerk Webhook Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
      eq: vi.fn().mockReturnThis(),
    });
  });

  it('svix 헤더가 없으면 400 반환', async () => {
    const { POST } = await import('../route');
    const req = new Request('http://localhost/api/webhooks/clerk', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('user.created 이벤트 시 profiles INSERT 호출', async () => {
    const { Webhook } = await import('svix');
    const mockVerify = vi.fn().mockReturnValue({
      type: 'user.created',
      data: {
        id: 'user_new123',
        email_addresses: [{ email_address: 'new@onkey.app' }],
        first_name: '새',
        last_name: '유저',
      },
    });
    vi.mocked(Webhook).mockImplementation(
      () =>
        ({
          verify: mockVerify,
        }) as unknown as InstanceType<typeof Webhook>,
    );

    const { POST } = await import('../route');
    const req = new Request('http://localhost/api/webhooks/clerk', {
      method: 'POST',
      headers: {
        'svix-id': 'svix_id_123',
        'svix-timestamp': '1234567890',
        'svix-signature': 'svix_sig_123',
      },
      body: JSON.stringify({ type: 'user.created', data: {} }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockFrom).toHaveBeenCalledWith('profiles');
  });

  it('user.deleted 이벤트 시 profiles DELETE 호출', async () => {
    const { Webhook } = await import('svix');
    const mockVerify = vi.fn().mockReturnValue({
      type: 'user.deleted',
      data: { id: 'user_del123' },
    });
    vi.mocked(Webhook).mockImplementation(
      () =>
        ({
          verify: mockVerify,
        }) as unknown as InstanceType<typeof Webhook>,
    );

    const { POST } = await import('../route');
    const req = new Request('http://localhost/api/webhooks/clerk', {
      method: 'POST',
      headers: {
        'svix-id': 'svix_id_456',
        'svix-timestamp': '1234567890',
        'svix-signature': 'svix_sig_456',
      },
      body: JSON.stringify({ type: 'user.deleted', data: {} }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it('user.updated 이벤트 시 profiles UPDATE 호출', async () => {
    const { Webhook } = await import('svix');
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    const mockVerify = vi.fn().mockReturnValue({
      type: 'user.updated',
      data: {
        id: 'user_upd123',
        email_addresses: [{ email_address: 'updated@onkey.app' }],
        first_name: '수정된',
        last_name: '이름',
      },
    });
    vi.mocked(Webhook).mockImplementation(
      () =>
        ({
          verify: mockVerify,
        }) as unknown as InstanceType<typeof Webhook>,
    );

    mockFrom.mockReturnValue({
      update: mockUpdate,
    });

    const { POST } = await import('../route');
    const req = new Request('http://localhost/api/webhooks/clerk', {
      method: 'POST',
      headers: {
        'svix-id': 'svix_id_upd',
        'svix-timestamp': '1234567890',
        'svix-signature': 'svix_sig_upd',
      },
      body: JSON.stringify({ type: 'user.updated', data: {} }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockFrom).toHaveBeenCalledWith('profiles');
    expect(mockUpdate).toHaveBeenCalled();
  });
});
