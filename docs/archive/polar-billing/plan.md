# 기능 #16: Polar 결제 연동 — Plan

## 1. 인프라
- [ ] @polar-sh/sdk 설치
- [ ] src/lib/polar.ts — Polar 클라이언트 + 플랜 상수

## 2. DB 마이그레이션
- [ ] profiles에 polar_subscription_id, subscription_status 필드 추가

## 3. Domain
- [ ] profile.entity.ts — 구독 필드 추가
- [ ] supabase.datasource.ts — 매핑 추가

## 4. 세션 한도 검증
- [ ] plan-limits.ts — 플랜별 세션 한도 상수
- [ ] create-session.ts — 한도 체크 로직 추가

## 5. 결제 플로우
- [ ] checkout Action — Polar 체크아웃 세션 생성
- [ ] webhook Route — Polar 이벤트 수신 (subscription created/updated/deleted)

## 6. 빌링 설정 페이지
- [ ] settings/billing/page.tsx — 현재 플랜, 사용량, 업그레이드 버튼

## 7. 검증
- [ ] 타입체크 통과
- [ ] 기존 테스트 통과
