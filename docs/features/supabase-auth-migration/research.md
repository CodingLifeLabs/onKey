# Clerk → Supabase Auth 전면 교체

## 목표

Clerk 인증을 완전히 제거하고 Supabase Auth (Google + Kakao 소셜 로그인)로 교체. Polar 결제 모듈의 모든 구독 시나리오가 새 인증 시스템에서 오류 없이 동작하도록 보장.

---

## Agent 1 — 아키텍처 (Clerk 전체 의존성 맵핑)

### Clerk이 사용되는 모든 위치

| 파일 | Clerk 함수/컴포넌트 | 용도 |
|------|-------------------|------|
| `src/app/layout.tsx` | `ClerkProvider`, `koKR` | 루트 레이아웃 인증 컨텍스트 |
| `src/middleware.ts` | `clerkMiddleware`, `createRouteMatcher` | 라우트 보호, 인증 리다이렉트 |
| `src/lib/clerk/server.ts` | `auth()`, `currentUser()` | 서버 사이드 사용자 조회 |
| `src/components/dashboard/app-sidebar.tsx` | `UserButton` | 사이드바 사용자 메뉴 |
| `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` | `SignIn` | 로그인 페이지 |
| `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx` | `SignUp` | 회원가입 페이지 |
| `src/app/api/webhooks/clerk/route.ts` | `svix` (Clerk webhook) | user.created/updated/deleted |

### `src/lib/clerk/server.ts`를 import하는 모든 파일 (getOwnerProfile)

- `src/app/actions/create-checkout.ts`
- `src/app/actions/create-portal-session.ts`
- `src/app/actions/create-session.ts`
- `src/app/actions/complete-session.ts`
- `src/app/actions/update-progress.ts`
- `src/app/actions/update-profile.ts`
- `src/app/actions/get-session-by-token.ts`
- `src/app/actions/get-user-plan.ts`
- `src/app/api/checkout/route.ts`
- `src/app/api/portal/route.ts`
- `src/app/(dashboard)/settings/page.tsx`
- `src/app/(dashboard)/settings/billing/page.tsx`
- `src/app/(dashboard)/sessions/new/page.tsx`

### 환경 변수

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/home
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/home
```

### 패키지

```json
"@clerk/nextjs": "^7.0.8"
"@clerk/localizations": "^4.3.0"
"svix": "^1.89.0"
```

---

## Agent 2 — Supabase Auth 역량

### 이미 구축된 것

- `@supabase/ssr` ^0.10.0 설치됨
- `src/lib/supabase/server.ts` — `createServerClient` + cookie 기반 세션 이미 구현됨
- `src/lib/supabase/client.ts` — 브라우저 클라이언트
- `src/lib/supabase/service.ts` — service_role 클라이언트 (웹훅용)

### Supabase Auth 지원 기능

| 기능 | 지원 |
|------|------|
| Google 소셜 로그인 | O (`signInWithOAuth({ provider: 'google' })`) |
| Kakao 소셜 로그인 | O (`signInWithOAuth({ provider: 'kakao' })`) |
| 이메일/비밀번호 | O (`signInWithPassword`) |
| Magic Link | O (`signInWithOtp`) |
| RLS 통합 | O (`auth.uid()`, `auth.jwt()`) |
| Webhook (user 생성/수정/삭제) | O (Supabase Database Webhooks or pg_cron) |
| 사용자 메타데이터 | O (`raw_user_meta_data`, `raw_app_meta_data`) |
| 세션 관리 | O (JWT + cookie, 자동 갱신) |

### 핵심 차이점

| 항목 | Clerk | Supabase Auth |
|------|-------|--------------|
| User ID 포맷 | `user_xxx` | UUID |
| 이메일 제공 | 소셜에서 즉시 또는 fake | 소셜에서 즉시 (확인됨) |
| Webhook | Svix 서명 (Clerk Dashboard) | Supabase 트리거 또는 pg_cron |
| RLS | auth.jwt() → 불가 (Clerk JWT 아님) | auth.uid() → 가능 (Supabase auth) |
| UI 컴포넌트 | `<SignIn/>`, `<UserButton/>` 제공 | 직접 구현 필요 |
| 미들웨어 | `clerkMiddleware` | `createServerClient` + `getUser()` |

### Supabase Auth Webhook 대안

Clerk처럼 HTTP webhook이 기본 제공되지 않음. 대안:
1. **Supabase Database Trigger**: `auth.users` 테이블에 INSERT/UPDATE/DELETE 트리거 → `public.profiles` 동기화
2. **pg_cron + pg_net**: 주기적 체크 (비추천)
3. **클라이언트 사이드**: 로그인/가입 시 직접 profile upsert

→ **Database Trigger 방식이 가장 견고함**

---

## Agent 3 — Polar 결제 영향 분석

### 현재 결제 흐름 (Clerk 기반)

```
1. 사용자 → createCheckoutAction()
2. getOwnerProfile() → Clerk auth → Supabase profile 조회
3. Polar checkout 생성 (externalCustomerId: clerkUserId)
4. Polar → webhook (findProfile: polar_customer_id → email → metadata.clerkUserId)
5. Profile 업데이트 (plan, subscription_status, etc.)
```

### 변경 후 결제 흐름 (Supabase Auth 기반)

```
1. 사용자 → createCheckoutAction()
2. getOwnerProfile() → Supabase auth.getUser() → profile 조회 (auth.uid = profile.clerk_user_id → user_id로 변경)
3. Polar checkout 생성 (externalCustomerId: user.id)
4. Polar → webhook (findProfile: polar_customer_id → email → metadata.userId)
5. Profile 업데이트
```

### Polar 영향 파일

| 파일 | 변경 사항 |
|------|----------|
| `create-checkout.ts` | `getOwnerProfile()` 소스 변경, `externalCustomerId`를 Supabase auth UID로 |
| `api/checkout/route.ts` | 동일 |
| `polar/route.ts` | `findProfile`에서 `clerk_user_id` → `user_id`로 조회 변경 |
| `api/portal/route.ts` | `getCustomerId`에서 auth 방식 변경 |
| `create-portal-session.ts` | `getOwnerProfile()` 소스 변경 |

### 전체 구독 시나리오 검증

| 시나리오 | 현재 동작 | Supabase Auth 후 동작 | 리스크 |
|---------|----------|---------------------|--------|
| 신규 가입 → 첫 결제 | Clerk user.created → profile 생성 → checkout | Trigger → profile 생성 → checkout | Trigger가 정상 동작해야 함 |
| Active → 업그레이드 (Pro→Unlimited) | Portal 유도 | 동일 | `polar_customer_id` 매핑 필요 |
| Active → 취소 (remaining period) | webhook canceled + cancelAtPeriodEnd | 동일 | `current_period_end` 저장 필요 |
| Canceled → uncanceled | webhook uncanceled | 동일 | 정상 동작 예상 |
| Canceled → expired | period 종료 후 starter로 | 동일 | 자동 처리 필요 (현재 webhook에 의존) |
| Subscription revoked | webhook revoked → 즉시 starter | 동일 | 정상 동작 예상 |
| Payment failure (past_due) | webhook status 업데이트 | 동일 | 정상 동작 예상 |
| Fake email | 문제의 원인! | Supabase는 소셜에서 실제 이메일 제공 | **해결됨** |
| 기존 고객 마이그레이션 | clerkUserId 기반 profile | userId 기반으로 전환 | 기존 데이터 이관 필요 |

### RLS 정책 변경

현재:
```sql
-- clerk_user_id 기반 (Clerk JWT 불가로 사실상 무력화됨, service_role로 우회)
CREATE POLICY "profiles_owner_select" ON profiles
  FOR SELECT USING (clerk_user_id = auth.jwt() ->> 'sub');
```

변경 후:
```sql
-- auth.uid() 기반 (Supabase Auth JWT에서 직접 동작)
CREATE POLICY "profiles_owner_select" ON profiles
  FOR SELECT USING (user_id = auth.uid());
```

→ **RLS가 실제로 동작하게 됨** (Clerk 때는 service_role로 우회했던 것과 다름)

---

## Agent 4 — 전체 영향 범위

### 파일 수정/삭제 대상

#### 삭제 (8파일)
1. `src/lib/clerk/server.ts` — Clerk 서버 유틸리티
2. `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` — Clerk SignIn 컴포넌트
3. `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx` — Clerk SignUp 컴포넌트
4. `src/app/api/webhooks/clerk/route.ts` — Clerk webhook
5. `src/app/api/webhooks/clerk/__tests__/route.test.ts` — Clerk webhook 테스트

#### 수정 (15+파일)
1. `src/app/layout.tsx` — ClerkProvider 제거
2. `src/middleware.ts` — clerkMiddleware → Supabase auth 미들웨어
3. `src/components/dashboard/app-sidebar.tsx` — UserButton → 커스텀 사용자 메뉴
4. `src/app/actions/create-checkout.ts` — auth 소스 변경
5. `src/app/actions/create-portal-session.ts` — auth 소스 변경
6. `src/app/actions/create-session.ts` — auth 소스 변경
7. `src/app/actions/complete-session.ts` — auth 소스 변경
8. `src/app/actions/update-progress.ts` — auth 소스 변경
9. `src/app/actions/update-profile.ts` — auth 소스 변경
10. `src/app/actions/get-session-by-token.ts` — auth 소스 변경
11. `src/app/actions/get-user-plan.ts` — auth 소스 변경
12. `src/app/api/checkout/route.ts` — auth 소스 변경
13. `src/app/api/portal/route.ts` — auth 소스 변경
14. `src/app/(dashboard)/settings/page.tsx` — auth 소스 변경
15. `src/app/(dashboard)/settings/billing/page.tsx` — auth 소스 변경
16. `src/app/(dashboard)/sessions/new/page.tsx` — auth 소스 변경

#### 신규 생성
1. `src/lib/auth/server.ts` — Supabase Auth 서버 유틸리티 (getCurrentUserId, getOwnerProfile)
2. `src/lib/auth/client.ts` — 클라이언트 Auth 유틸리티
3. `src/app/(auth)/login/page.tsx` — 커스텀 로그인 페이지
4. `src/app/(auth)/auth/callback/route.ts` — OAuth 콜백 핸들러
5. `supabase/migrations/008_supabase_auth_migration.sql` — 스키마 + 트리거
6. `src/components/dashboard/user-menu.tsx` — 커스텀 사용자 메뉴

#### DB 스키마 변경
- `profiles.clerk_user_id` → `profiles.user_id` (FK → auth.users.id)
- RLS 정책 전면 재작성 (auth.uid() 기반)
- `auth.users` 트리거 생성 (profile 자동 동기화)

#### 패키지 변경
- 제거: `@clerk/nextjs`, `@clerk/localizations`, `svix`
- 유지: `@supabase/supabase-js`, `@supabase/ssr`

---

## 결론 및 추천 방향

### 핵심 아키텍처 결정

1. **인증 흐름**: Supabase Auth (Google + Kakao) → cookie-based SSR 세션
2. **Profile 동기화**: `auth.users` 트리거 → `public.profiles` INSERT/UPDATE
3. **RLS 활성화**: service_role 우회 제거 → auth.uid() 기반 실제 RLS
4. **Polar 연동**: `externalCustomerId`를 Supabase auth UID로, metadata에 userId 저장
5. **DB 마이그레이션**: `clerk_user_id` → `user_id` 컬럼명 변경 + 기존 데이터 이관

### 작업 순서 (추천)

**Phase 1: 기반 인프라**
1. Supabase Auth 설정 (Google/Kakao OAuth 활성화)
2. DB 마이그레이션 (user_id 컬럼, 트리거, RLS 재작성)
3. Auth 유틸리티 생성 (server/client)
4. 미들웨어 교체

**Phase 2: UI 교체**
5. 로그인/회원가입 페이지 (커스텀)
6. OAuth 콜백 핸들러
7. 사이드바 사용자 메뉴
8. 루트 레이아웃 (ClerkProvider 제거)

**Phase 3: 비즈니스 로직**
9. 모든 Server Actions auth 소스 교체
10. Polar checkout/webhook/portal auth 소스 교체
11. 기존 Clerk webhook → 삭제

**Phase 4: 정리**
12. Clerk 패키지/환경변수 제거
13. 기존 데이터 이관 스크립트
14. 테스트

### 리스크

| 항목 | 위험도 | 대응 |
|------|--------|------|
| 기존 유저 데이터 이관 | **높음** | clerk_user_id → user_id 매핑 스크립트 필요 |
| RLS 활성화로 인한 기존 쿼리 실패 | **높음** | 모든 쿼리 service_role → auth 기반 전환 필요 |
| Polar 기존 고객 매핑 끊김 | **중간** | polar_customer_id는 유지되므로 OK |
| Kakao 소셜 로그인 이메일 누락 | **중간** | Kakao는 이메일 선택 제공 → fallback 처리 |
