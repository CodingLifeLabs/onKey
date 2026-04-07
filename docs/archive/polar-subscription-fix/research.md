# Polar 구독 결제 플로우 수정 + 시나리오 보완

## 목표

Clerk 소셜 로그인 시 발생하는 fake email 문제로 인해 Polar 결제가 실패하는 이슈를 해결하고, 누락된 구독 시나리오(취소 후 잔여 기간, 업그레이드)를 보완한다.

---

## Agent 1 — 아키텍처 (현재 결제 흐름 분석)

### Clerk 웹훅 → Supabase Profile 생성 흐름

**파일**: `src/app/api/webhooks/clerk/route.ts:32-52`

```
Clerk user.created 웹훅
→ email_addresses[0].email_address 추출
→ profiles INSERT (clerk_user_id, email, full_name)
```

**핵심 문제**: 소셜 로그인(Google, Kakao 등) 시 Clerk가 `email_addresses` 배열을 즉시 채우지 않거나, 확인되지 않은 가짜 이메일을 제공할 수 있음. 특히:
- Kakao 소셜 로그인은 이메일 제공이 선택사항
- 확인되지 않은 이메일이 `example.com` 도메인으로 들어올 수 있음
- Clerk에서 `user.updated` 이벤트 발생 시 이메일이 변경되어도 DB 업데이트 없음

### 결제 흐름

**체크아웃 생성** (`src/app/actions/create-checkout.ts:17-31`):
- `owner.profile.email`을 metadata에 저장하지만 `customerEmail` 파라미터로는 전달하지 않음
- `owner.profile.polarCustomerId`가 있으면 `customerId`로 전달

**API 체크아웃** (`src/app/api/checkout/route.ts:19-26`):
- `customerEmail` 미전달, `customerId` 미전달
- metadata에 profileId와 clerkUserId만 저장

### Polar 웹훅 → Profile 업데이트 흐름

**파일**: `src/app/api/webhooks/polar/route.ts:13-44`

```
findProfile(customerId, customerEmail)
→ 1차: polar_customer_id로 조회
→ 2차: email로 fallback + polar_customer_id 저장
```

**문제점**: fake email이 DB에 저장된 경우, Polar에서 실제 이메일을 받아도 매칭 안 됨. Clerk의 `user.updated` 이벤트를 핸들링하지 않아 이메일 업데이트가 반영되지 않음.

### 결제 관리 포털

**파일**: `src/app/api/portal/route.ts`
- CustomerPortal 사용 (Polar 제공)
- 취소, 결제 수단 변경 등은 Polar 포털에서 처리 → 웹훅으로 상태 동기화

---

## Agent 2 — 유사 기능 (기존 코드 분석)

### 이미 구현된 것

| 기능 | 파일 | 상태 |
|------|------|------|
| 구독 취소 웹훅 | `polar/route.ts:111-133` | O (cancelAtPeriodEnd 분기 처리) |
| 구독 복구(uncancel) | `polar/route.ts:152-171` | O |
| 구독 해지(revoke) | `polar/route.ts:136-150` | O |
| 구독 상태 표시 | `billing-content.tsx:53-56` | O (canceled 경고 배너) |
| Polar 고객 포털 | `api/portal/route.ts` | O (결제 관리 버튼) |
| 플랜 업그레이드 | `billing-content.tsx:141-148` | O (checkout 링크) |
| Feature gating | `lib/polar.ts:39-52` | O |

### 누락된 것

| 기능 | 설명 |
|------|------|
| **Clerk user.updated 핸들링** | 이메일/이름 변경 시 DB 업데이트 없음 |
| **취소 후 잔여 기간 표시** | "현재 기간 종료 후" 메시지만 있고, 정확한 날짜 미표시 |
| **Pro → Unlimited 업그레이드** | 결제 페이지에는 있으나, 이미 active 구독이 있는 경우 Polar에서 `AlreadyActiveSubscriptionError` 발생 가능 |
| **subscription_id 기반 업그레이드** | Polar CheckoutCreate에 `subscriptionId` 파라미터가 있으나 미사용 |
| **DB에 current_period_end 저장** | 취소 시 잔여 기간 계산 불가 (DB에 날짜 없음) |

---

## Agent 3 — 의존성 (Polar SDK 기능 분석)

### SDK 버전
- `@polar-sh/sdk`: ^0.47.0
- `@polar-sh/nextjs`: ^0.9.5

### Polar CheckoutCreate 지원 파라미터 (확인 완료)

**파일**: `node_modules/@polar-sh/sdk/.../checkoutcreate.d.ts`

```typescript
interface CheckoutCreate {
  products: string[];                    // 필수
  customerId?: string;                   // 기존 고객 연결
  customerEmail?: string;                // 이메일 사전 입력
  customerName?: string;                 // 이름 사전 입력
  externalCustomerId?: string;           // 외부 시스템 ID
  subscriptionId?: string;               // 업그레이드 대상 구독 ID
  metadata?: Record<string, string|number|boolean>;
  successUrl?: string;
  // ... 기타
}
```

**핵심 발견**:
- `customerEmail` 파라미터로 체크아웃에 이메일 사전 입력 가능 → Polar가 고객 생성 시 이 이메일 사용
- `subscriptionId`로 기존 구독 업그레이드 가능 → "free pricing에서만" 제약 (Polar 제한)
- `externalCustomerId`로 Clerk userId를 Polar에 전달 가능

### Polar SubscriptionUpdate 지원

```typescript
type CustomerSubscriptionUpdate =
  | { productId: string }           // 플랜 변경
  | { seats: number }               // 시트 변경
  | { cancelAtPeriodEnd?: boolean } // 취소/복구
```

→ Polar Customer Portal에서 플랜 업그레이드/다운그레이드 가능 (proration은 Polar가 처리)

### Polar CustomerPortalCustomerUpdate

```typescript
interface CustomerPortalCustomerUpdate {
  billingName?: string;
  billingAddress?: AddressInput;
  taxId?: string;
}
```

→ 이메일 업데이트 미지원 (결제 정보만 수정 가능)

### Polar 웹훅 이벤트 데이터 (Subscription)

- `data.currentPeriodStart` / `data.currentPeriodEnd` 제공 (확인 필요)
- `data.cancelAtPeriodEnd`: boolean
- `data.customerId`: Polar 고객 ID
- `data.productId`: 상품 ID
- `data.status`: subscription 상태

### AlreadyActiveSubscriptionError

SDK에 `alreadyactivesubscriptionerror.ts` 존재 → 이미 active 구독이 있으면 새 체크아웃 생성 시 에러 발생 가능

---

## Agent 4 — 테스트

### 기존 테스트
- `vitest` 사용
- 테스트 파일: `src/app/api/webhooks/clerk/__tests__/route.test.ts`
- Polar 관련 테스트: **없음**

### 테스트 패턴
- vitest + jsdom + @testing-library/react
- 테스트 환경에서 req.headers 직접 사용 (next/headers 대신)

---

## 결론 및 추천 방향

### 문제 1: Fake Email → Polar 결제 실패

**원인**: 소셜 로그인 시 Clerk가 fake email(`@example.com`)을 제공 → 이 이메일이 그대로 Supabase에 저장 → checkout 시 `customerEmail` 미전달 → Polar에서 이메일 수집 → webhook에서 `findProfile(email)` 매칭 실패

**해결 방안**:
1. Clerk `user.updated` 이벤트 핸들링 추가 → 이메일 변경 시 DB 업데이트
2. Checkout 생성 시 `externalCustomerId: clerkUserId` 전달 → Polar에서 Clerk ID로 고객 식별
3. Webhook `findProfile`에서 metadata의 `clerkUserId`로도 조회 (fallback 추가)
4. Fake email 필터링 로직 추가 (`@example.com` 등 제외)

### 문제 2: 업그레이드 시나리오 (Pro → Unlimited)

**원인**: 이미 active 구독이 있을 때 새 checkout 생성 시 `AlreadyActiveSubscriptionError` 발생 가능

**해결 방안**:
1. Polar Customer Portal이 업그레이드를 지원하므로, 현재 구독 중인 사용자는 Portal로 리다이렉트
2. 또는 `subscriptionId` 파라미터로 업그레이드 체크아웃 생성 (Polar 제약: free pricing에서만)
3. 가장 간단: 이미 구독 중이면 "결제 관리" 버튼만 노출 (Portal에서 업그레이드)

### 문제 3: 취소 후 잔여 기간 표시

**원인**: DB에 `current_period_end` 저장하지 않아 정확한 만료일 계산 불가

**해결 방안**:
1. `profiles` 테이블에 `current_period_end` 컬럼 추가
2. Polar webhook에서 `subscription.active`, `subscription.updated` 이벤트 시 저장
3. Billing UI에서 만료일까지 남은 일수 표시

### 권장 작업 순서

1. **DB 스키마 변경**: `current_period_end`, `cancel_at_period_end` 컬럼 추가
2. **Clerk webhook 수정**: `user.updated` 이벤트 핸들링 추가
3. **Checkout 수정**: `externalCustomerId`, `customerEmail` 전달
4. **Polar webhook 수정**: `current_period_end` 저장, metadata 기반 profile 조회 추가
5. **Billing UI 수정**: 잔여 기간 표시, 업그레이드 시나리오 개선
6. **테스트**: Polar webhook 테스트 추가
