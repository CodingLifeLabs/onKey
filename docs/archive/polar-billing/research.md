# 기능 #16: Polar 결제 연동

## 목표
Polar 결제를 연동하여 요금제 관리, 세션 생성 한도, 구독 관리 기능을 구현한다.

## 현재 상태
- Profile에 `plan` (starter/pro/enterprise), `polarCustomerId`, `sessionCountThisMonth`, `sessionResetAt` 이미 존재
- 월간 세션 카운트 트래킹 이미 구현됨
- 결제 설정 페이지는 "준비 중" 상태

## Polar API
- SDK: `@polar-sh/sdk`
- Sandbox: https://sandbox-api.polar.sh/v1
- 인증: OAT (Organization Access Token)
- 웹훅: checkout, subscription 이벤트
- Customer Portal: 고객 셀프 서비스

## 요금제 설계
| 플랜 | 월간 세션 | 가격 |
|------|----------|------|
| Starter | 5 | 무료 |
| Pro | 50 | 유료 |
