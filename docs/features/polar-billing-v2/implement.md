# Polar 결제 + 요금제 관리 v2 — Implement

## 1. Bug Fix

- [x] `src/app/actions/create-session.ts` — 중복 `const supabase = createServiceClient()` 제거 (55, 57행)

## 2. Domain

- [x] `src/domain/repositories/profile.repository.ts` — `updateSubscription(id, data)` 메서드 시그니처 추가

## 3. Data

- [x] `src/data/repositories/profile.repository.impl.ts` — `updateSubscription()` 구현 (plan, polarSubscriptionId, subscriptionStatus 업데이트)

## 4. Infrastructure — 웹훅

- [x] `src/app/api/webhooks/polar/route.ts` — HMAC-SHA256 signature 검증 함수 추가
- [x] `src/app/api/webhooks/polar/route.ts` — subscription.created / subscription.updated 핸들러 개선 (cancel_at_period_end 대응)
- [x] `src/app/api/webhooks/polar/route.ts` — subscription.canceled 핸들러 개선 (cancel_at_period_end 체크)
- [x] `src/app/api/webhooks/polar/route.ts` — subscription.revoked 핸들러 추가 (즉시 starter 다운그레이드)
- [x] `src/app/api/webhooks/polar/route.ts` — order.created 핸들러 추가 (결제 성공 로그)

## 5. Infrastructure — 체크아웃

- [x] `src/app/actions/create-checkout.ts` — 기존 polarCustomerId 있으면 customer_id 파라미터 전달

## 6. Presentation — 고객 포털

- [x] `src/app/actions/create-portal-session.ts` — Polar 고객 포털 세션 생성 Server Action 신규 생성

## 7. Presentation — UI 컴포넌트

- [x] `src/components/dashboard/plan-badge.tsx` — PlanBadge 컴포넌트 신규 생성
- [x] `src/components/dashboard/limit-reached-modal.tsx` — LimitReachedModal 컴포넌트 신규 생성

## 8. Presentation — 결제 페이지

- [x] `src/app/(dashboard)/settings/billing/page.tsx` — 서버 컴포넌트 + 클라이언트 컴포넌트 분리 구조로 리팩토링
- [x] `src/app/(dashboard)/settings/billing/page.tsx` — 현재 플랜 / 구독 상태 / 사용량 동적 렌더링
- [x] `src/app/(dashboard)/settings/billing/page.tsx` — 구독 상태별 UI (past_due 경고, trialing 배지, canceled 경고)
- [x] `src/app/(dashboard)/settings/billing/page.tsx` — UsageMeter 통합
- [x] `src/app/(dashboard)/settings/billing/page.tsx` — Pro 구독 시 고객 포털 버튼, Starter 시 업그레이드 버튼

## 9. 타입체크

- [x] `npx tsc --noEmit` 통과 확인
