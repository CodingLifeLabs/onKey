# 기능 #12: 전체 페이지 UI 리디자인

## 목표

OnKey 전체 UI를 디자인 시스템 수준으로 리디자인한다. 기본 shadcn 테마에서 벗어나 OnKey 브랜드 정체성에 맞는 독자적인 시각적 경험을 구축한다.

---

## Agent 1 — 아키텍처 (현재 상태)

### 페이지 (10개)

| 페이지 | 경로 | 현재 상태 |
|--------|------|-----------|
| 루트 레이아웃 | layout.tsx | Geist 폰트, 기본 테마 |
| 대시보드 레이아웃 | (dashboard)/layout.tsx | SidebarProvider 패턴 |
| 대시보드 | (dashboard)/page.tsx | 메트릭 카드 + 세션 테이블 |
| 세션 목록 | (dashboard)/sessions/page.tsx | 카드 그리드 |
| 세션 생성 | (dashboard)/sessions/new/page.tsx | 위저드 |
| 세션 상세 | (dashboard)/sessions/[id]/page.tsx | 정보 카드 + 진행 상태 |
| 템플릿 목록 | (dashboard)/templates/page.tsx | 카드 그리드 |
| 템플릿 편집 | (dashboard)/templates/[id]/edit/page.tsx | 에디터 |
| 로그인 | (auth)/sign-in/ | Clerk 기본 |
| 온보딩 | onboarding/[token]/ | 모바일 퍼스트 |

### 컴포넌트 (20+)

- 대시보드: app-sidebar, dashboard-header, empty-state, template-card, create/delete-dialog
- 세션: session-card, status-badge, step-indicator, step-basic-info, step-template-picker, step-content-editor, step-link-share, create-wizard
- 에디터: template-editor, block-toolbar, block-list
- 온보딩: onboarding-page, block-viewer
- UI 기초: Card, Button, Badge, Input, Dialog, Dropdown 등 (shadcn/ui v4)

### 현재 테마

- **색상**: OKLCH 그레이스케일 (무채색 기본 shadcn 테마) — 브랜드 컬러 없음
- **폰트**: Geist Sans / Geist Mono — 한국어 최적화 안됨
- **배경**: 순백 (#FFFFFF) — 따뜻함 없음
- **레이아웃**: 기본 shadcn 패턴 — 개성 없음

---

## Agent 2 — 유사 기능 (디자인 방향성)

### 브랜드 정체성 분석

- **OnKey (온키)**: 'On' (켜다, 시작) + 'Key' (열쇠, 핵심)
- **타겟**: 30~60대 임대인 → 신뢰감, 편의성 중요
- **제품**: 원룸/오피스텔 입주 온보딩 → '집', '시작', '안내'의 이미지

### 디자인 컨셉: "Urban Nest (도시의 둥지)"

| 요소 | 현재 | 리디자인 |
|------|------|----------|
| Primary | 무채색 블랙 | Warm Terracotta (테라코타) — 집, 온기, 한국 기와 |
| Background | 순백 | Warm Off-White/Cream — 종이 질감 |
| Accent | 없음 | Deep Teal (딥틸) — 신뢰, 전문성 |
| 폰트 | Geist | Pretendard (한국어 최적화) |
| 카드 | 평면 | 미세한 그림자 + 따뜻한 보더 |
| 배경 | 단색 | 미세한 노이즈 텍스처 |

### 색상 팔레트

```
Primary:    Terracotta    oklch(0.65 0.12 30)   — 따뜻한 주홍/갈색
Secondary:  Warm Cream    oklch(0.97 0.01 80)   — 따뜻한 크림
Accent:     Deep Teal     oklch(0.45 0.1 200)   — 깊은 청록
Background: Warm White    oklch(0.99 0.005 80)  — 따뜻한 흰색
Muted:      Warm Gray     oklch(0.92 0.01 80)   — 따뜻한 회색
Destructive:Soft Red      oklch(0.55 0.2 25)    — 부드러운 빨강
```

---

## Agent 3 — 의존성

### 폰트 교체

- **현재**: Geist Sans (Google Fonts)
- **목표**: Pretendard (한국어 최적화, CDN 또는 로컬)
- 설치: `npm install pretendard` 또는 CDN `@import`

### shadcn/ui 테마

- globals.css CSS 변수 수정으로 전체 테마 변경
- 추가 패키지 불필요 — CSS 변수만 교체

### 노이즈 텍스처

- SVG 데이터 URI를 CSS background로 사용
- 추가 패키지 불필요

---

## Agent 4 — 테스트

### UI 리디자인 테스트 범위

- 시각적 회귀 테스트는 수동 확인
- 타입체크로 리팩토링 오류 방지
- 기존 기능 테스트가 깨지지 않도록 확인

### 접근성

- 색상 대비 WCAG 2.1 AA 기준 충족 필요
- 폰트 가독성 (한국어 본문 16px 이상)

---

## 결론 및 추천 방향

### 리디자인 범위

1. **테마 시스템**: globals.css CSS 변수 전면 교체 (색상 + 폰트)
2. **레이아웃**: 사이드바, 헤더, 페이지 구조 개선
3. **컴포넌트**: 카드, 버튼, 배지 등 개별 컴포넌트 스타일 개선
4. **폰트**: Geist → Pretendard 교체
5. **디테일**: 노이즈 텍스처, 미세한 애니메이션, 호버 효과

### 리스크

- 낮음 — CSS 변수와 클래스 변경이므로 로직 영향 없음
- Pretendard 한국어 폰트 로딩 시간 주의 (subset 사용)
