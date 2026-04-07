# Polar 결제 + 요금제 관리 v2 — Plan

## 현황 분석

### 이미 구현된 것
- Polar SDK 초기화 + 플랜 한도 상수 (`src/lib/polar.ts`)
- 기본 웹훅 핸들러 (`src/app/api/webhooks/polar/route.ts`) — signature 검증 없음
- 체크아웃 Server Action (`src/app/actions/create-checkout.ts`)
- 결제 페이지 (`src/app/(dashboard)/settings/billing/page.tsx`) — 정적 하드코딩
- UsageMeter 컴포넌트 (`src/components/dashboard/usage-meter.tsx`)
- 세션 생성 시 한도 체크 + 월간 리셋 (`src/app/actions/create-session.ts`)
- DB 스키마: plan, polar_customer_id, polar_subscription_id, subscription_status 컬럼

### 미구현 / 문제점
1. **웹훅 signature 검증 없음** — 보안 취약점
2. **subscription.revoked 이벤트 미처리** — 즉시 다운그레이드 누락
3. **subscription.canceled가 즉시 다운그레이드** — cancel_at_period_end 체크 필요
4. **결제 페이지가 정적** — 현재 플랜 동적 반영 안 됨
5. **Polar 고객 포털 연동 없음** — 결제 수단 변경/해지 불가
6. **기존 고객 재구매 시 customer_id 미전달** — Polar에 중복 고객 생성 가능
7. **PlanBadge, LimitReachedModal 컴포넌트 없음**
8. **create-session.ts에 중복 `const supabase = createServiceClient()` 선언** (버그)

---

## 레이어별 설계

### Domain

- [ ] `src/domain/repositories/profile.repository.ts` — `updateSubscription()` 메서드 추가
  ```
  updateSubscription(id: string, data: {
    plan: PlanType;
    polarSubscriptionId?: string;
    subscriptionStatus?: string;
  }): Promise<Profile>
  ```

### Data

- [ ] `src/data/repositories/profile.repository.impl.ts` — `updateSubscription()` 구현체 추가

### Infrastructure — 웹훅

- [ ] `src/app/api/webhooks/polar/route.ts` — 전면 개선
  - [ ] 웹훅 signature 검증 로직 추가 (HMAC-SHA256 검증)
  - [ ] `subscription.created` / `subscription.updated`: plan 매핑 + status 반영
  - [ ] `subscription.canceled`: `cancel_at_period_end` 확인 → true면 상태만 업데이트, false면 즉시 starter 다운그레이드
  - [ ] `subscription.revoked`: 즉시 starter 다운그레이드 + subscription_status = 'canceled'
  - [ ] `order.created`: 결제 성공 로그
  - [ ] 에러 핸들링: 개별 이벤트 실패가 전체 응답에 영향 안 주도록 try/catch 분리

### Infrastructure — 체크아웃

- [ ] `src/app/actions/create-checkout.ts` — 기존 고객 customer_id 전달
  ```
  기존 polarCustomerId가 있으면 checkout 생성 시 customer_id 파라미터 전달
  없으면 기존처럼 metadata로 전달
  ```

### Presentation — 결제 페이지

- [ ] `src/app/(dashboard)/settings/billing/page.tsx` — 서버 컴포넌트로 전환 + 동적 데이터
  - [ ] 현재 플랜 / 구독 상태 / 사용량 서버에서 조회
  - [ ] 현재 플랜 카드에 "현재 플랜" 배지 표시
  - [ ] 구독 상태별 UI:
    - `active`: 정상 배지
    - `past_due`: "결제 필요" 경고 배너
    - `trialing`: "체험 중" 배지 + 만료일
    - `canceled`: "해지 예정" 경고 + 만료일
  - [ ] 사용량 프로그레스 바 (UsageMeter 통합)
  - [ ] Pro 구독 중이면 "결제 관리" 버튼 → Polar 고객 포털 리다이렉트
  - [ ] Starter면 Pro 업그레이드 버튼 유지

### Presentation — 고객 포털

- [ ] `src/app/actions/create-portal-session.ts` — Polar 고객 포털 세션 생성 Server Action

### Presentation — UI 컴포넌트

- [ ] `src/components/dashboard/plan-badge.tsx` — 현재 플랜 배지
  - starter: "Starter" 회색
  - pro: "Pro" primary
  - trialing: "Pro (체험 중)" 파란색
- [ ] `src/components/dashboard/limit-reached-modal.tsx` — 한도 도달 시 업그레이드 모달
  - 세션 생성 에러 응답이 한도 초과면 자동 표시
  - 현재 사용량 표시 + "Pro로 업그레이드" 버튼

### Bug Fix

- [ ] `src/app/actions/create-session.ts` — 중복 `const supabase = createServiceClient()` 제거 (55, 57행)

---

## 처리하지 않는 것

- Enterprise 플랜 구현 (MVP 범위 외)
- 청구서/인보이스 히스토리 UI
- pg_cron 월간 리셋 (애플리케이션 레벨 리셋 유지)
- Proration (비례 계산) 처리
