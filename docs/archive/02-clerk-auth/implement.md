# Feature 2: Clerk 인증 연동 + 프로필 웹훅 — Implement

## 의존성 설치

- [x] `svix` 패키지 설치
- [x] `.env.example`에 `CLERK_WEBHOOK_SECRET` 추가

## Supabase service_role 클라이언트

- [x] `src/lib/supabase/service.ts` 생성

## Clerk 유틸리티

- [x] `src/lib/clerk/server.ts` 생성 — getCurrentUserId, requireUserId, getCurrentUserProfile

## 인증 페이지

- [x] `src/app/(auth)/layout.tsx` 생성 — Auth 전용 레이아웃
- [x] `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` 생성
- [x] `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx` 생성

## 웹훅 라우트

- [x] `src/app/api/webhooks/clerk/route.ts` 생성
  - [x] svix 서명 검증 (req.headers 직접 사용)
  - [x] user.created → profiles INSERT (service_role 사용)
  - [x] user.deleted → profiles DELETE (service_role 사용)

## DB 마이그레이션

- [x] `supabase/migrations/002_fix_rls.sql` 생성
  - [x] 기존 auth.jwt() 기반 RLS 정책 제거 (Clerk와 호환되지 않음)
  - [x] service_role로 RLS 우회 + 애플리케이션 레이어에서 owner_id 검증
  - [x] 시스템 템플릿 owner_id를 NULL로 변경

## Repository 업데이트

- [x] 3개 Repository 구현체를 createServiceClient()로 변경
- [x] RLS 우회 + 애플리케이션 레이어 인증 처리

## 테스트

- [x] `src/test/clerk-mock.ts` 생성
- [x] `src/app/api/webhooks/clerk/__tests__/route.test.ts` 생성 (3 tests passed)
- [x] TypeScript 타입 체크 통과
- [x] 전체 8개 테스트 통과

## Fix Log

- `next/headers`의 `headers()` 대신 `req.headers` 직접 사용 — 테스트 환경에서 Next.js request context 없음
- RLS 정책을 `auth.jwt()` 기반에서 service_role 우회 방식으로 변경
- 테스트 mock 체인 수정 (delete().eq() 메서드 체이닝)
