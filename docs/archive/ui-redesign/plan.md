# 기능 #12: 전체 페이지 UI 리디자인 — Plan

## 디자인 컨셉: "Urban Nest (도시의 둥지)"

따뜻한 테라코타 + 딥틸 조합. 한국 미학(여백, 정갈함) + 현대 SaaS 폴리싱.

## 1. 테마 시스템 (globals.css)

- [ ] CSS 변수 교체 — Primary: Warm Terracotta, Accent: Deep Teal, Background: Warm White
- [ ] 폰트 Geist → Pretendard 교체 (CDN)
- [ ] 노이즈 텍스처 배경 추가 (SVG data URI)
- [ ] 다크 모드 색상 조정

## 2. 레이아웃

- [ ] 루트 레이아웃 (layout.tsx) — 폰트 교체, 배경 텍스처
- [ ] 대시보드 레이아웃 (dashboard/layout.tsx) — 사이드바 스타일 개선
- [ ] 사이드바 (app-sidebar.tsx) — 브랜드 강화, 메뉴 스타일 개선
- [ ] 헤더 (dashboard-header.tsx) — 하단 보더 색상, 여백 조정

## 3. 대시보드 페이지

- [ ] 메인 대시보드 (dashboard/page.tsx) — 메트릭 카드 디자인, 테이블 스타일

## 4. 세션 페이지

- [ ] 세션 목록 (sessions/page.tsx) — 카드 디자인 개선
- [ ] 세션 카드 (session-card.tsx) — 호버 효과, 레이아웃 개선
- [ ] 상태 배지 (status-badge.tsx) — 컬러 개선
- [ ] 세션 상세 (sessions/[id]/page.tsx) — 정보 카드 레이아웃

## 5. 세션 생성 위저드

- [ ] 위저드 컨테이너 (create-wizard.tsx) — 카드 디자인
- [ ] 스텝 인디케이터 (step-indicator.tsx) — 프로그레스 스타일
- [ ] 스텝 폼 컴포넌트들 — 일관된 폼 스타일

## 6. 템플릿 페이지

- [ ] 템플릿 목록 (templates/page.tsx) — 섹션 구분 개선
- [ ] 템플릿 카드 (template-card.tsx) — 호버 효과, 액션 개선

## 7. 에디터

- [ ] 템플릿 에디터 (template-editor.tsx) — 토글, 툴바 스타일
- [ ] 블록 툴바 (block-toolbar.tsx) — 드롭다운 스타일
- [ ] 블록 리스트 (block-list.tsx) — 블록 카드 스타일

## 8. 온보딩 (입주자)

- [ ] 온보딩 페이지 (onboarding-page.tsx) — 모바일 디자인 개선
- [ ] 블록 뷰어 (block-viewer.tsx) — 읽기 경험 개선

## 9. 공통 컴포넌트

- [ ] 빈 상태 (empty-state.tsx) — 일러스트 느낌 개선
- [ ] 다이얼로그 (create/delete-template-dialog) — 패딩, 보더 개선

## Test

- [ ] 전체 타입체크 통과 확인
- [ ] 기존 테스트 통과 확인
- [ ] 브라우저에서 시각 확인
