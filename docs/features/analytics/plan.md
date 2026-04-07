# 기능: 분석 (Analytics) — Plan

## 레이어별 설계

### Infrastructure — 의존성

- [ ] `recharts` 설치
- [ ] `date-fns` 설치

### Domain — Analytics 타입

- [ ] `src/types/analytics.ts` — 분석 데이터 타입 정의
  ```
  interface AnalyticsOverview {
    totalSessions: number;
    completedRate: number;
    avgCompletionMinutes: number;
    thisMonthSessions: number;
  }

  interface SessionStatusDistribution {
    completed: number;
    inProgress: number;
    pending: number;
    expired: number;
  }

  interface MonthlyTrend {
    month: string;       // '2026-01' 형식
    created: number;
    completed: number;
  }

  interface TemplateStats {
    templateId: string;
    templateName: string;
    sessionCount: number;
    completedCount: number;
    completionRate: number;
  }
  ```

### Data — Analytics 조회

- [ ] `src/app/actions/get-analytics.ts` — Server Action
  ```
  getOwnerProfile() → ownerId로 세션 집계
  - getAnalyticsOverview(): 핵심 지표 4개
  - getStatusDistribution(): 상태별 분포
  - getMonthlyTrend(): 최근 6개월 트렌드
  - getTemplateStats(): 템플릿별 통계
  ```

### Presentation — UI 컴포넌트

- [ ] `src/components/dashboard/analytics-stats-cards.tsx` — 핵심 지표 카드 4개
  - 총 세션 수, 완료율, 평균 소요 시간/ 이번 달 생성 수
- [ ] `src/components/dashboard/analytics-status-chart.tsx` — 세션 상태 분포 원형 차트 (recharts PieChart)
- [ ] `src/components/dashboard/analytics-trend-chart.tsx` — 월간 트렌드 막대 그래프 (recharts BarChart)
- [ ] `src/components/dashboard/analytics-template-table.tsx` — 템플릿별 통계 테이블

### Presentation — 페이지

- [ ] `src/app/(dashboard)/analytics/page.tsx` — 서버 컴포넌트로 전환
  - getAnalytics Action 호출
  - 4개 섹션 레이아웃 (지표 카드 → 상태 차트 + 트렌드 차트 → 템플릿 테이블)

### 타입체크

- [ ] `npx tsc --noEmit` 통과 확인
