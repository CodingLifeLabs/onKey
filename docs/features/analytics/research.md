# 기능: 분석 (Analytics) — Research

## 목표

운영자가 세션 완료율, 평균 소요 시간, 템플릿별 통계, 월간 트렌드를 한눈에 볼 수 있는 분석 대시보드 구현

## Agent 1 — 아키텍처

### 데이터 모델 (분석에 활용 가능한 컬럼)

**sessions**
- `status`: pending | in_progress | completed | expired
- `created_at`, `completed_at`: 완료 소요 시간 계산
- `template_id`: 템플릿별 통계
- `owner_id`: 운영자별 필터링

**session_progress**
- `viewed_sections`: JSONB (블록 ID 배열)
- `checked_items`: JSONB (체크리스트 항목 ID 배열)
- `signature_name`, `signature_image_url`: 서명 수집 여부
- `submitted_at`: 제출 시점

**profiles**
- `session_count_this_month`: 월간 사용량
- `plan`: 플랜별 한도

### 레이어 위치

- `src/app/actions/get-analytics.ts` — Server Action (Supabase 집계 쿼리)
- `src/app/(dashboard)/analytics/page.tsx` — 서버 컴포넌트
- `src/components/dashboard/analytics-*.tsx` — 클라이언트 차트 컴포넌트

### 기존 패턴

- 서버 컴포넌트에서 `getOwnerProfile()` → ownerId 획득 → Supabase 쿼리
- 클라이언트 컴포넌트는 `'use client'` 선언 후 인터랙티브 요소만 담당

## Agent 2 — 유사 기능

### 재사용 가능

| 컴포넌트 | 경로 | 활용 |
|----------|------|------|
| Card | `src/components/ui/card.tsx` | 통계 카드 컨테이너 |
| Badge | `src/components/ui/badge.tsx` | 상태 뱃지 |
| UsageMeter | `src/components/dashboard/usage-meter.tsx` | 프로그레스 바 패턴 |
| DashboardHeader | `src/components/dashboard/dashboard-header.tsx` | 페이지 헤더 |
| Select | `src/components/ui/select.tsx` | 기간 필터 |

### 새로 만들 것

- `StatusDistributionChart` — 원형 차트 (세션 상태별 분포)
- `MonthlyTrendChart` — 막대 그래프 (월간 세션 생성/완료 추이)
- `StatsCard` — 지표 카드 (총 세션 수, 완료율, 평균 소요 시간)
- `TemplateUsageTable` — 템플릿별 사용 현황 테이블

## Agent 3 — 의존성

### 설치 필요

| 라이브러리 | 용도 | 버전 |
|-----------|------|------|
| recharts | 차트 (원형, 막대, 영역) | ^2.x |
| date-fns | 날짜 계산 (최근 7일/30일) | ^4.x |

### 설치 불필요

- shadcn/ui 컴포넌트: Card, Badge, Select 등 이미 설치됨
- Supabase client: server/service 클라이언트 이미 구성됨
- Tailwind CSS v4: 이미 구성됨

### 충돌 위험

- recharts는 React 19와 호환 (recharts ^2.12 이상)
- date-fns v4는 ESM 전용 — Next.js에서 문제없음

## Agent 4 — 테스트

### 기존 테스트 패턴

- **Runner**: Vitest (jsdom 환경)
- **Mock**: `vi.mock('@/lib/supabase/service')` + `vi.mock('@clerk/nextjs/server')`
- **위치**: `src/app/actions/__tests__/*.test.ts`
- **패턴**: `beforeEach`에서 mock 초기화, `await import()`로 동적 import

### 분석 기능 테스트 범위

- `get-analytics.ts` Server Action 단위 테스트
  - 총 세션 수, 상태별 카운트, 평균 소요 시간 계산 로직
  - 기간 필터 (7일/30일/전체)
  - ownerId 필터링

## 결론 및 추천 방향

### MVP 분석 지표

1. **핵심 지표 카드** (4개)
   - 총 세션 수
   - 완료율 (%)
   - 평균 완료 소요 시간
   - 이번 달 생성 수

2. **세션 상태 분포** (원형 차트)
   - completed / in_progress / pending / expired 비율

3. **월간 트렌드** (막대 그래프)
   - 최근 6개월 생성 수 vs 완료 수

4. **템플릿별 통계** (테이블)
   - 템플릿명, 세션 수, 완료율, 평균 소요 시간

### 구현 순서 추천

1. `recharts`, `date-fns` 설치
2. `get-analytics.ts` Server Action (Supabase 집계 쿼리)
3. StatsCard 컴포넌트 4개
4. 상태 분포 원형 차트
5. 월간 트렌드 막대 그래프
6. 템플릿별 통계 테이블
7. analytics/page.tsx 통합
