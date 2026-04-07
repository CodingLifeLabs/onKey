# Feature 4: 세션 생성 폼 (3단계 위저드) + 토큰 발급 — Implement

## 패키지 설치

- [x] react-hook-form, @hookform/resolvers 설치
- [x] shadcn/ui label, textarea, select 설치

## Zod 스키마

- [x] `src/lib/validations/session.ts` 생성 — Step 1 폼 검증 (roomNumber, tenantName, moveInDate, expiresAt, memo)

## Server Actions

- [x] `src/app/actions/create-session.ts` 생성 — 세션 생성 (getOwnerProfile + nanoid 토큰 + template 스냅샷)
- [x] `src/app/actions/get-templates.ts` — 시스템 템플릿 목록 (이미 존재)

## 위저드 컴포넌트

- [x] `src/components/sessions/step-indicator.tsx` 생성 — 3단계 진행 표시기
- [x] `src/components/sessions/create-wizard.tsx` 생성 — 3단계 위저드 메인 (client component)
- [x] `src/components/sessions/step-basic-info.tsx` 생성 — Step 1 폼 (react-hook-form + zod)
- [x] `src/components/sessions/step-template-picker.tsx` 생성 — Step 2 템플릿 선택 카드 그리드
- [x] `src/components/sessions/step-link-share.tsx` 생성 — Step 3 링크 공유 (복사 + 만료일 + 미리보기)

## 라우트

- [x] `src/app/(dashboard)/sessions/new/page.tsx` — Server Component에서 템플릿 로드 후 CreateWizard 렌더

## 테스트

- [x] TypeScript 타입 체크 통과
- [x] 전체 8개 테스트 통과

## Fix Log

- `createSession` → `createSessionAction` 함수명 변경 (Server Action 네이밍 컨벤션)
- shadcn/ui v4 Button에 `asChild` 없음 → Link로 감싸는 패턴 적용
