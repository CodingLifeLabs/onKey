# Polar 구독 결제 플로우 수정 — Implement

## 작업 체크리스트

### 1. DB 스키마 변경
- [x] `supabase/migrations/007_add_subscription_period.sql` 생성

### 2. Domain 레이어
- [x] `src/domain/entities/profile.entity.ts` — `currentPeriodEnd`, `cancelAtPeriodEnd` 필드 추가
- [x] `src/data/datasources/supabase.datasource.ts` — mapProfileFromRow에 새 필드 매핑
- [x] `src/domain/repositories/profile.repository.ts` — updateSubscription 파라미터 확장

### 3. Data 레이어
- [x] `src/data/repositories/profile.repository.impl.ts` — updateSubscription에 새 필드 반영

### 4. Clerk Webhook 수정
- [x] `src/app/api/webhooks/clerk/route.ts` — `user.updated` 핸들러 추가

### 5. Polar Checkout 수정
- [x] `src/app/actions/create-checkout.ts` — `externalCustomerId`, `customerEmail` 전달 + 구독 중이면 Portal 유도
- [x] `src/app/api/checkout/route.ts` — 동일하게 수정

### 6. Polar Webhook 수정
- [x] `src/app/api/webhooks/polar/route.ts` — findProfile에 metadata 조회 추가, `current_period_end` / `cancel_at_period_end` 저장

### 7. Billing UI 수정
- [x] `src/app/(dashboard)/settings/billing/billing-content.tsx` — 잔여 기간 표시 + 업그레이드 버튼 로직 수정
- [x] `src/app/(dashboard)/settings/billing/page.tsx` — currentPeriodEnd prop 전달

### 8. 테스트
- [x] `src/app/api/webhooks/clerk/__tests__/route.test.ts` — user.updated 테스트 추가
- [ ] `src/app/api/webhooks/polar/__tests__/route.test.ts` — Polar webhook 테스트 (별도 작업)

## Fix Log
- tsc 에러: repository impl 인라인 타입이 인터페이스 변경을 반영하지 않아 발생 → 타입 시그니처 업데이트로 해결
