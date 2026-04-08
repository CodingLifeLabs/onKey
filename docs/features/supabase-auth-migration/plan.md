# Clerk → Supabase Auth 전면 교체 + 구독 상태 머신 — Plan

## 전제
- 기존 데이터 초기화 (신규 DB 리셋)
- 소셜 로그인: Google + Kakao
- 구독 시스템을 상태 머신으로 설계
- 모든 Polar 구독 시나리오 오류 없이 동작

---

## 책임 분리: Polar vs 우리

### Polar가 처리 (우리 구현 불필요)
- 결제 처리 (카드, VAT, 영수증, 환불)
- 구독 lifecycle (생성, 갱신, 자동결제, trial, proration, 재시도)
- 고객 포털 (카드변경, 구독취소, 플랜변경 UI)
- Webhook 이벤트 발생

### 우리가 구현 (SaaS 권한 엔진)
- **Webhook endpoint**: 이벤트 수신 → DB 상태 동기화
- **DB 상태 관리**: plan + status + metadata 저장
- **Access Control**: hasAccess() / hasFeature() 권한 판단
- **UI 분기**: 플랜/상태에 따른 화면 제어
- **Idempotency**: 중복 webhook 처리 방지

---

## 핵심 설계: 구독 상태 머신

### 3축 모델
```
Plan (요금제) × Status (구독 상태) × Event (Webhook) → 결과 상태
```

### 타입
```typescript
type Plan = 'starter' | 'pro' | 'enterprise';
type SubscriptionStatus =
  | 'inactive'   // 구독 없음
  | 'active'     // 정상 구독
  | 'trialing'   // 체험 기간
  | 'past_due'   // 결제 실패 (유예)
  | 'canceled'   // 취소 (기간 끝까지 접근 가능할 수 있음)
  | 'expired';   // 완전 만료
```

### 권한 판단 (서버에서만)
```typescript
function hasAccess(plan: Plan, status: SubscriptionStatus): boolean {
  if (plan === 'starter') return true;
  return status === 'active' || status === 'trialing';
}
```

### DB 필드
```
plan, subscription_status, current_period_end, cancel_at_period_end,
polar_customer_id, polar_subscription_id
```

### 상태 전이표

| 현재 | 이벤트 | 결과 | 플랜 | 비고 |
|-----|--------|------|------|------|
| inactive | subscription.created | active/trialing | → pro/enterprise | 첫 구독 |
| trialing | subscription.active | active | 유지 | 체험→유료 |
| active | subscription.updated | active | 플랜 변경 | 업/다운그레이드 |
| active | subscription.canceled (EOP) | canceled | 유지 | 기간 끝까지 접근 |
| active | subscription.canceled (즉시) | canceled | → starter | 즉시 다운그레이드 |
| active | subscription.revoked | expired | → starter | 즉시 만료 |
| active | invoice.failed | past_due | 유지 | 유예 기간 |
| past_due | invoice.paid | active | 유지 | 결제 복구 |
| past_due | subscription.canceled | canceled | → starter | 재시도 실패 |
| canceled | subscription.uncanceled | active | 복원 | 취소 철회 |
| canceled | (period_end 도래) | expired | → starter | 자동 만료 |
| * | 동일 이벤트 재수신 | 무시 | 무시 | 멱등성 |

---

## Phase 1: 인프라 (DB + Auth + 구독 모듈)

### 1-1. DB 마이그레이션
- [ ] `supabase/migrations/010_auth_reset.sql` — 전체 스키마 재생성
  - `profiles`: `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`
  - `subscription_status` CHECK 제약 (6가지 상태)
  - `subscription_events` 로그 테이블 (idempotency): `polar_event_id TEXT UNIQUE`
  - RLS: `auth.uid()` 기반
  - `auth.users` 트리거: INSERT → profile 자동 생성, UPDATE → 동기화, DELETE → CASCADE
  - 기존 001~007 통합

### 1-2. 구독 상태 머신 모듈
- [ ] `src/domain/subscription/types.ts` — 타입 정의
- [ ] `src/domain/subscription/transitions.ts` — 전이 테이블 + applyTransition()
- [ ] `src/domain/subscription/access.ts` — hasAccess(), hasFeature()
- [ ] `src/domain/subscription/idempotency.ts` — 이벤트 중복 방지
- [ ] `src/domain/subscription/index.ts` — 통합 export

### 1-3. Auth 유틸리티
- [ ] `src/lib/auth/server.ts` — getCurrentUserId(), requireUserId(), getOwnerProfile()
- [ ] `src/lib/auth/client.ts` — signInWithGoogle(), signInWithKakao(), signOut()

### 1-4. 미들웨어
- [ ] `src/middleware.ts` — Supabase auth 미들웨어

## Phase 2: UI 교체

- [ ] `src/app/(auth)/login/page.tsx` — 커스텀 로그인 (Google + Kakao)
- [ ] `src/app/(auth)/auth/callback/route.ts` — OAuth 콜백
- [ ] `src/components/dashboard/user-menu.tsx` — 커스텀 사용자 메뉴
- [ ] `src/app/layout.tsx` — ClerkProvider 제거
- [ ] `src/app/(auth)/sign-in/` — 삭제
- [ ] `src/app/(auth)/sign-up/` — 삭제
- [ ] `src/components/dashboard/app-sidebar.tsx` — UserButton → UserMenu
- [ ] `src/app/page.tsx` — useClerk → Supabase client auth

## Phase 3: 비즈니스 로직 교체

### Domain/Data
- [ ] `src/domain/entities/profile.entity.ts` — clerkUserId → userId
- [ ] `src/domain/repositories/profile.repository.ts` — findByClerkUserId → findByUserId
- [ ] `src/data/repositories/profile.repository.impl.ts` — user_id 쿼리
- [ ] `src/data/datasources/supabase.datasource.ts` — 매핑 변경
- [ ] `src/lib/polar.ts` — 도메인 타입 통합

### Polar Webhook (상태 머신 기반)
- [ ] `src/app/api/webhooks/polar/route.ts` — applyTransition() 호출, 멱등성 보장

### Server Actions (auth 소스 변경)
- [ ] `src/app/actions/create-session.ts`
- [ ] `src/app/actions/complete-session.ts`
- [ ] `src/app/actions/update-progress.ts`
- [ ] `src/app/actions/update-profile.ts`
- [ ] `src/app/actions/get-session-by-token.ts`
- [ ] `src/app/actions/get-user-plan.ts` — hasAccess() 기반
- [ ] `src/app/actions/create-template.ts`
- [ ] `src/app/actions/delete-template.ts`
- [ ] `src/app/actions/duplicate-template.ts`
- [ ] `src/app/actions/update-template-content.ts`

### Polar 결제
- [ ] `src/app/actions/create-checkout.ts` — externalCustomerId → Supabase UID
- [ ] `src/app/api/checkout/route.ts` — 동일
- [ ] `src/app/api/portal/route.ts` — Supabase auth 기반 getCustomerId
- [ ] `src/app/actions/create-portal-session.ts` — auth 소스 변경

### Pages
- [ ] `src/app/(dashboard)/settings/page.tsx`
- [ ] `src/app/(dashboard)/settings/billing/page.tsx`
- [ ] `src/app/(dashboard)/settings/billing/billing-content.tsx` — 상태 머신 기반 UI
- [ ] `src/app/(dashboard)/sessions/new/page.tsx`
- [ ] `src/app/(dashboard)/settings/profile-content.tsx`

## Phase 4: 정리

- [ ] `src/lib/clerk/` 삭제
- [ ] `src/app/api/webhooks/clerk/` 삭제
- [ ] `package.json`에서 `@clerk/nextjs`, `@clerk/localizations`, `svix` 제거
- [ ] `.env` Clerk 변수 제거
- [ ] npm install + 빌드 + 타입체크

## Phase 5: 시나리오 검증

### A. 진입 (5)
- [ ] 무료 → 프로 (Google)
- [ ] 무료 → 무제한 (Kakao)
- [ ] 무료 → 프로 체험 (trialing)
- [ ] 체험 → 유료 전환
- [ ] 결제 실패 → 생성 안 됨

### B. 업그레이드/다운그레이드 (4)
- [ ] 프로 → 무제한
- [ ] 프로(월) → 프로(연)
- [ ] 무제한 → 프로
- [ ] 프로 → 무료 (만료 시점)

### C. 취소/만료 (5)
- [ ] 즉시 취소 (기간 유지)
- [ ] 무제한 취소
- [ ] trial 중 취소
- [ ] 결제 실패 → 자동 취소
- [ ] 만료 → starter 전환

### D. 결제 (4)
- [ ] 결제 성공 → active 유지
- [ ] 결제 실패 → past_due
- [ ] 재시도 성공 → active 복귀
- [ ] 계속 실패 → canceled

### E. 예외 (5)
- [ ] 중복 구독 생성 차단
- [ ] webhook 중복 호출 → 멱등성
- [ ] 플랜 변경 중 결제 실패
- [ ] 환불 → revoked → starter
- [ ] 취소 철회 → uncanceled → active
