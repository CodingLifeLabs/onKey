# Feature 3: 대시보드 레이아웃 + 세션 현황 — Implement

## shadcn/ui 컴포넌트 설치

- [x] sidebar, card, badge, dropdown-menu, avatar, separator, tooltip 설치

## ownerId 해결 유틸리티

- [x] `src/lib/clerk/server.ts`에 getOwnerProfile 추가

## 대시보드 레이아웃

- [x] `src/app/(dashboard)/layout.tsx` 생성 — SidebarProvider + AppSidebar + SidebarInset
- [x] `src/components/dashboard/app-sidebar.tsx` 생성 — 네비게이션 + UserButton
- [x] `src/components/dashboard/dashboard-header.tsx` 생성 — SidebarTrigger + 타이틀 + 액션

## 대시보드 홈

- [x] `src/app/(dashboard)/page.tsx` 생성 — 메트릭 카드 4종 (총 세션, 진행 중, 완료, 이번 달 사용량) + 최근 세션 목록

## 세션 목록

- [x] `src/app/(dashboard)/sessions/page.tsx` 생성
- [x] `src/components/sessions/session-card.tsx` 생성 — 상태 뱃지 + 날짜 정보 + 액션 버튼
- [x] `src/components/sessions/status-badge.tsx` 생성 — 4종 상태 뱃지
- [x] `src/components/dashboard/empty-state.tsx` 생성 — 3종 Empty State

## 루트 페이지

- [x] `src/app/page.tsx` 수정 — 인증 시 /sessions로 리다이렉트

## 테스트

- [x] TypeScript 타입 체크 통과
- [x] 전체 8개 테스트 통과

## Fix Log

- shadcn/ui v4 Button에 `asChild` prop 없음 → Link로 Button 감싸는 패턴으로 변경
- Clerk UserButton에 `afterSignOutUrl` prop 없음 (v7) → 제거
- SidebarMenuButton에 `asChild` 없음 → Link를 children으로 직접 전달
