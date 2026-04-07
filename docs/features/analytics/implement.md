# 기능: 분석 (Analytics) — Implement

## 1. Infrastructure

- [x] `recharts` 설치
- [x] `date-fns` 설치

## 2. Domain

- [x] `src/types/analytics.ts` — Analytics 타입 정의

## 3. Data

- [x] `src/app/actions/get-analytics.ts` — 분석 데이터 조회 Server Action

## 4. Presentation — UI 컴포넌트

- [x] `src/components/dashboard/analytics-stats-cards.tsx` — 핵심 지표 카드
- [x] `src/components/dashboard/analytics-status-chart.tsx` — 상태 분포 원형 차트
- [x] `src/components/dashboard/analytics-trend-chart.tsx` — 월간 트렌드 막대 그래프
- [x] `src/components/dashboard/analytics-template-table.tsx` — 템플릿별 통계 테이블

## 5. Presentation — 페이지

- [x] `src/app/(dashboard)/analytics/page.tsx` — 서버 컴포넌트 + 4개 섹션 통합

## 6. 타입체크

- [x] `npx tsc --noEmit` 통과
