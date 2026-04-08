import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/auth/callback',
];

const PUBLIC_PATTERNS = [
  /^\/onboarding\/(.*)/,
  /^\/api\/webhooks\/(.*)/,
  /^\/api\/sessions\/(.*)/,
];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  return PUBLIC_PATTERNS.some((pattern) => pattern.test(pathname));
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  // 인증된 사용자가 랜딩(/)에 접속하면 /home으로 리다이렉트
  if (user && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // 인증되지 않은 사용자가 보호된 라우트에 접속하면 /login으로 리다이렉트
  if (!user && !isPublicRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
