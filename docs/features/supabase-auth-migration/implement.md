# Clerk → Supabase Auth + 구독 상태 머신 — Implement

## Phase 1: 인프라

### 1-1. DB 마이그레이션
- [x] `supabase/migrations/010_auth_reset.sql` 생성

### 1-2. 구독 상태 머신
- [x] `src/domain/subscription/types.ts` 생성
- [x] `src/domain/subscription/transitions.ts` 생성
- [x] `src/domain/subscription/access.ts` 생성
- [x] `src/domain/subscription/idempotency.ts` 생성
- [x] `src/domain/subscription/index.ts` 생성

### 1-3. Auth 유틸리티
- [x] `src/lib/auth/server.ts` 생성
- [x] `src/lib/auth/client.ts` 생성

### 1-4. 미들웨어
- [x] `src/middleware.ts` 재작성

## Phase 2: UI 교체

- [x] `src/app/(auth)/login/page.tsx` 생성
- [x] `src/app/(auth)/auth/callback/route.ts` 생성
- [x] `src/components/dashboard/user-menu.tsx` 생성
- [x] `src/app/layout.tsx` 수정 (ClerkProvider 제거)
- [x] `src/app/(auth)/sign-in/` 삭제
- [x] `src/app/(auth)/sign-up/` 삭제
- [x] `src/components/dashboard/app-sidebar.tsx` 수정
- [x] `src/app/page.tsx` 수정 (useClerk 제거)
- [x] `src/app/(dashboard)/layout.tsx` 수정 (유저 props 전달)

## Phase 3: 비즈니스 로직

### Domain/Data
- [x] `src/domain/entities/profile.entity.ts` 수정 (clerkUserId → userId)
- [x] `src/domain/repositories/profile.repository.ts` 수정 (findByUserId, findByPolarCustomerId)
- [x] `src/data/repositories/profile.repository.impl.ts` 수정 (user_id 쿼리)
- [x] `src/data/datasources/supabase.datasource.ts` 수정 (매핑 변경)
- [x] `src/lib/polar.ts` 수정 (도메인 타입 통합)

### Polar Webhook
- [x] `src/app/api/webhooks/polar/route.ts` 재작성 (상태 머신 + 멱등성)

### Server Actions
- [x] `src/app/actions/create-session.ts` 수정
- [x] `src/app/actions/complete-session.ts` 수정
- [x] `src/app/actions/update-progress.ts` 수정
- [x] `src/app/actions/update-profile.ts` 수정
- [x] `src/app/actions/get-session-by-token.ts` 수정
- [x] `src/app/actions/get-user-plan.ts` 수정
- [x] `src/app/actions/create-template.ts` 수정
- [x] `src/app/actions/delete-template.ts` 수정
- [x] `src/app/actions/duplicate-template.ts` 수정
- [x] `src/app/actions/update-template-content.ts` 수정
- [x] `src/app/actions/get-template.ts` 수정
- [x] `src/app/actions/upload-template-image.ts` 수정
- [x] `src/app/actions/get-all-templates.ts` 수정
- [x] `src/app/actions/get-analytics.ts` 수정
- [x] `src/app/actions/bulk-delete-sessions.ts` 수정
- [x] `src/app/actions/create-checkout.ts` 수정 (externalCustomerId → userId)
- [x] `src/app/actions/create-portal-session.ts` 수정

### Polar 결제
- [x] `src/app/api/checkout/route.ts` 수정
- [x] `src/app/api/portal/route.ts` 수정

### Pages
- [x] `src/app/(dashboard)/settings/page.tsx` 수정
- [x] `src/app/(dashboard)/settings/billing/page.tsx` 수정
- [x] `src/app/(dashboard)/sessions/new/page.tsx` 수정 (변경 없음)
- [x] `src/app/(dashboard)/settings/profile-content.tsx` 수정
- [x] `src/app/(dashboard)/home/page.tsx` 수정
- [x] `src/app/(dashboard)/sessions/page.tsx` 수정

## Phase 4: 정리

- [x] `src/lib/clerk/` 삭제
- [x] `src/app/api/webhooks/clerk/` 삭제
- [x] `src/test/clerk-mock.ts` 삭제
- [x] 테스트 파일 Clerk → Supabase auth mock 업데이트 (4개)
- [x] `package.json` 수정 (`@clerk/nextjs`, `@clerk/localizations`, `svix` 제거)
- [x] `npm install` 실행
- [x] 빌드 + 타입체크 통과 ✓

## Fix Log

1. `user-menu.tsx` (client component)에서 `@/lib/auth/server` import 제거 → server-only 모듈을 client bundle에 포함시키는 문제 해결. 대신 dashboard layout에서 props로 전달.
