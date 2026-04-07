# Feature 3: 대시보드 레이아웃 + 세션 현황 — Plan

## Presentation: 레이아웃

- [ ] shadcn/ui 컴포넌트 설치 (sidebar, card, badge, dropdown-menu, avatar, separator, tooltip)
- [ ] 대시보드 레이아웃 (`src/app/(dashboard)/layout.tsx`)
- [ ] 사이드바 컴포넌트 (`src/components/dashboard/app-sidebar.tsx`)
- [ ] 헤더 컴포넌트 (`src/components/dashboard/dashboard-header.tsx`)

## Domain: UseCase

- [ ] ownerId 해결 유틸리티 (`src/lib/clerk/server.ts` 확장 — getOwnerProfile)

## Presentation: 세션 목록

- [ ] 대시보드 홈 (`src/app/(dashboard)/page.tsx`) — 메트릭 카드 + 최근 세션
- [ ] 세션 목록 페이지 (`src/app/(dashboard)/sessions/page.tsx`)
- [ ] 세션 카드 컴포넌트 (`src/components/sessions/session-card.tsx`)
- [ ] 상태 뱃지 컴포넌트 (`src/components/sessions/status-badge.tsx`)
- [ ] Empty State 컴포넌트 (`src/components/dashboard/empty-state.tsx`)

## Test

- [ ] StatusBadge 단위 테스트
- [ ] EmptyState 단위 테스트
