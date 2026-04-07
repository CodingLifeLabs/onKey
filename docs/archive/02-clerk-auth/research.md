# Feature 2: Clerk 인증 연동 + 프로필 웹훅 — Research

## 목표

Clerk 인증을 연동하고, 회원가입 시 웹훅으로 profiles 테이블에 자동 생성. 로그인/회원가입 커스텀 페이지 구현.

## Agent 1 — 아키텍처 (위치할 레이어 / 기존 패턴)

### Clerk + Next.js App Router 구조

- 인증 페이지: `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` (catch-all 라우트)
- 웹훅: `src/app/api/webhooks/clerk/route.ts`
- 미들웨어: `src/middleware.ts` (이미 구현됨)
- Server Component에서 `auth()`, `currentUser()` 사용

### 핵심 변경: RLS 정책 수정

현재 RLS는 `auth.jwt() ->> 'sub'` 사용 → Supabase Auth 전용.
Clerk 사용 시:
- API Route에서 `auth()`로 Clerk userId 획득
- Supabase service_role 클라이언트로 쿼리 (RLS 우회)
- 애플리케이션 레이어에서 owner_id 필터링

### 추가 필요 파일

- `src/lib/supabase/service.ts` — service_role 클라이언트
- `src/lib/clerk/server.ts` — Clerk 유틸리티 (getCurrentUser)
- `svix` 패키지 — 웹훅 서명 검증

## Agent 2 — 유사 기능 (재사용 가능 / 새로 만들 것)

### 재사용

- `ProfileRepository` (Feature 1에서 구현) — 웹훅에서 사용
- `createClient()` (server) — 웹훅에서는 service_role 필요하므로 새로 생성

### 새로 생성

- Clerk 웹훅 라우트 핸들러
- Sign-in / Sign-up 페이지
- Auth 레이아웃
- Service role Supabase 클라이언트

## Agent 3 — 의존성 (필요한 것 / 충돌 위험)

### 추가 설치 필요

- `svix` — Clerk 웹훅 서명 검증

### 환경 변수 추가

- `CLERK_WEBHOOK_SECRET` — 웹훅 검증용

### 호환성

- Clerk 7.x에서 `<SignIn />`, `<SignUp />` 컴포넌트 정상 동작
- `auth()`는 Server Component, Route Handler에서 사용 가능
- `currentUser()`는 Server Component에서만 사용 (Route Handler에서는 `auth()`만)

## Agent 4 — 테스트 (위치 / 범위)

### 테스트 전략

- `@clerk/testing` 공식 패키지 없음 → 커스텀 목 사용
- 웹훅 핸들러: svix 서명 모킹하여 테스트
- Auth 상태: `vi.mock('@clerk/nextjs/server')`로 모킹

### 테스트 파일

- `src/app/api/webhooks/clerk/__tests__/route.test.ts` — 웹훅 테스트
- `src/lib/clerk/__tests__/server.test.ts` — 유틸리티 테스트

## 결론 및 추천 방향

1. `svix` 패키지 설치
2. Supabase service_role 클라이언트 생성
3. Clerk 유틸리티 함수 (`getCurrentUser`) 생성
4. 웹훅 라우트 핸들러 (`user.created`, `user.deleted`)
5. Sign-in / Sign-up 커스텀 페이지
6. Auth 레이아웃
7. 기존 Repository 구현체에 Clerk auth 연동 (owner_id 필터링)
8. RLS 정책 수정 (service_role 사용으로 실질적 변경은 minimal)
