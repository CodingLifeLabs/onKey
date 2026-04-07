# 기능 #16: Polar 결제 + 요금제 관리 (전체 케이스)

## 모든 경우의 수

### 1. 세션 생성 한도

| 상황 | starter (5/월) | pro (50/월) | enterprise (무제한) |
|------|---------------|------------|-------------------|
| 한도 내 | 정상 생성 | 정상 생성 | 정상 생성 |
| 한도 도달 | 에러 + 업그레이드 유도 | 에러 + 업그레이드 유도 | N/A |
| 한도 초과 시도 | 차단 | 차단 | 정상 생성 |

### 2. 구독 상태별 동작

| 상태 | 세션 생성 | UI 표시 |
|------|----------|---------|
| active | 정상 (해당 플랜 한도) | 현재 플랜 배지 |
| past_due | 정상 (유예 기간) | "결제 필요" 경고 |
| canceled | starter 한도 적용 | "다운그레이드 예정" 또는 "무료 플랜" |
| trialing | pro 한도 적용 | "체험 중" 배지 |
| incomplete | starter 한도 | "결제 대기" |
| null (미구독) | starter 한도 | "무료 플랜" |

### 3. 플랜 변경 시나리오

| 변경 | 효과 | 세션 카운트 |
|------|------|-----------|
| starter → pro | 즉시 | 유지 (월 한도만 증가) |
| pro → starter | 기간 종료 시 | 유지 (다음 달부터 starter 한도) |
| trial → pro | 즉시 | 유지 |
| trial 만료 | starter로 전환 | 다음 달 리셋 |

### 4. 웹훅 이벤트

| 이벤트 | 처리 |
|--------|------|
| subscription.created | plan 업데이트, subscription_status = active |
| subscription.updated | plan 변경 반영 |
| subscription.canceled | cancel_at_period_end 여부 확인, 기간 종료 시 다운그레이드 |
| order.created | 결제 성공 로그 |
| subscription.revoked | 즉시 starter로 다운그레이드 |

### 5. 월간 리셋

- session_count_this_month 매월 1일 리셋
- session_reset_at 업데이트
- Supabase pg_cron 또는 애플리케이션에서 체크

### 6. 청구서 설정 페이지

| 섹션 | 내용 |
|------|------|
| 현재 요금제 | 플랜명, 상태, 다음 결제일 |
| 사용량 | 이번 달 세션 수 / 한도, 프로그레스 바 |
| 요금제 변경 | Starter/Pro 카드, 업그레이드/다운그레이드 |
| 구독 관리 | Polar 고객 포털 링크 (결제 수단 변경, 해지) |

### 7. UI 컴포넌트 필요

- UsageMeter: 프로그레스 바 (사용량/한도)
- PlanBadge: 현재 플랜 표시
- PlanCard: 요금제 카드 (가격, 기능, CTA 버튼)
- LimitReachedModal: 한도 도달 시 업그레이드 모달
