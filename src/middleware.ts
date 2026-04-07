import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding/(.*)',
  '/api/webhooks/(.*)',
  '/api/sessions/(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();

  // 인증된 사용자가 랜딩(/)에 접속하면 /home으로 리디렉트
  if (userId && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Next.js 내부 경로 및 정적 파일 제외
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
