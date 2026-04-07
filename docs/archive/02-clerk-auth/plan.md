# Feature 2: Clerk 인증 연동 + 프로필 웹훅 — Plan

## Domain: UseCase / Repository 수정

- [ ] `getCurrentUser` 유틸리티 함수 (`src/lib/clerk/server.ts`)
- [ ] 기존 Repository에 owner_id 기반 필터링 패턴 적용 검토

## Data: DataSource 연결

- [ ] Supabase service_role 클라이언트 (`src/lib/supabase/service.ts`) — 웹훅에서 사용
- [ ] `svix` 패키지 설치

## Presentation: 인증 페이지

- [ ] Auth 레이아웃 (`src/app/(auth)/layout.tsx`)
- [ ] Sign-in 페이지 (`src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`)
- [ ] Sign-up 페이지 (`src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`)

## API: 웹훅 라우트

- [ ] Clerk 웹훅 핸들러 (`src/app/api/webhooks/clerk/route.ts`)
  - user.created → profiles INSERT
  - user.deleted → profiles CASCADE DELETE

## DB: 마이그레이션

- [ ] RLS 정책 수정 (`supabase/migrations/002_fix_rls.sql`)
  - profiles: service_role만 INSERT 가능하도록 정책 수정
  - 다른 테이블: service_role로 API에서 접근하므로 기존 정책 유지 가능

## Test

- [ ] Clerk 목 유틸리티 (`src/test/clerk-mock.ts`)
- [ ] 웹훅 핸들러 테스트
