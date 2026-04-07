import { vi } from 'vitest';

export function mockClerkAuth(userId: string | null = 'user_test123') {
  vi.mock('@clerk/nextjs/server', () => ({
    auth: () =>
      Promise.resolve({
        userId,
        sessionId: userId ? 'session_test' : null,
        getToken: () => Promise.resolve('mock-token'),
      }),
    currentUser: () =>
      userId
        ? Promise.resolve({
            id: userId,
            primaryEmailAddress: { emailAddress: 'test@onkey.app' },
            fullName: '테스트 사용자',
            imageUrl: '',
          })
        : Promise.resolve(null),
    clerkMiddleware: vi.fn(),
    createRouteMatcher: vi.fn(() => () => true),
  }));
}

export function mockClerkAuthUnauthenticated() {
  return mockClerkAuth(null);
}
