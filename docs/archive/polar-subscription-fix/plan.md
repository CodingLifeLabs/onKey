# Polar 구독 결제 플로우 수정 — Plan

## 작업 범위

fake email 문제 해결, Clerk user.updated 핸들링, 업그레이드 시나리오 보완, 취소 후 잔여 기간 표시

---

## 1. DB 스키마 변경

- [ ] `007_add_subscription_period.sql` 마이그레이션 생성
  - `current_period_end TIMESTAMPTZ` 추가 (취소 시 잔여 기간 계산)
  - `cancel_at_period_end BOOLEAN DEFAULT false` 추가

## 2. Domain 레이어

- [ ] `profile.entity.ts`에 `currentPeriodEnd`, `cancelAtPeriodEnd` 필드 추가
- [ ] `supabase.datasource.ts` mapProfileFromRow에 새 필드 매핑 추가
- [ ] `profile.repository.ts` 인터페이스에 `currentPeriodEnd`, `cancelAtPeriodEnd` 업데이트 파라미터 반영

## 3. Data 레이어

- [ ] `profile.repository.impl.ts` updateSubscription에 `currentPeriodEnd`, `cancelAtPeriodEnd` 지원

## 4. Clerk Webhook 수정

- [ ] `src/app/api/webhooks/clerk/route.ts`에 `user.updated` 이벤트 핸들러 추가
  - 이메일 변경 시 `profiles.email` 업데이트
  - 이름 변경 시 `profiles.full_name` 업데이트

## 5. Polar Checkout 수정

- [ ] `create-checkout.ts`에 `externalCustomerId: owner.profile.clerkUserId` 전달
- [ ] `create-checkout.ts`에 email이 fake가 아닌 경우만 `customerEmail`로 전달
- [ ] `api/checkout/route.ts`에 동일하게 `externalCustomerId`, `customerEmail` 전달
- [ ] 이미 active 구독이 있는 경우 checkout 대신 portal로 리다이렉트 로직 추가

## 6. Polar Webhook 수정

- [ ] `findProfile`에 metadata 기반 조회 추가 (3차 fallback: clerkUserId로 조회)
- [ ] `onSubscriptionCreated`에서 `polar_customer_id`, `current_period_end` 저장
- [ ] `onSubscriptionUpdated`에서 `current_period_end` 업데이트
- [ ] `onSubscriptionActive`에서 `current_period_end` 업데이트
- [ ] `onSubscriptionCanceled`에서 `cancel_at_period_end`, `current_period_end` 저장
- [ ] `onSubscriptionRevoked`에서 `current_period_end` 초기화
- [ ] `onSubscriptionUncanceled`에서 `cancel_at_period_end = false` 설정

## 7. Billing UI 수정

- [ ] `billing-content.tsx`에 취소 시 잔여 기간 표시 (currentPeriodEnd 기반)
- [ ] `billing-content.tsx`에 업그레이드 버튼 로직 수정 (이미 구독 중이면 Portal 유도)

## 8. 테스트

- [ ] Polar webhook 테스트 (`src/app/api/webhooks/polar/__tests__/route.test.ts`)
- [ ] Clerk webhook user.updated 테스트 추가
