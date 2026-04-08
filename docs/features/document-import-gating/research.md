# Research: 문서 가져오기 기능 Gating

## 목표

Pro 이상 요금제에 한정된 "문서 가져오기" 기능이 현재 모든 요금제에 노출되어 있음. Starter 사용자에게 숨기고 Pro/Enterprise에만 표시.

## Agent 1 — 아키텍처

### 현재 상태

- `documentImport`는 `PRO_FEATURES`에 정의됨 (`access.ts`)
- `hasFeature(plan, status, 'documentImport')` → Pro/Enterprise만 true
- **하지만 ImportContentDialog에 plan 체크 없음** — 모든 사용자가 사용 가능

### ImportContentDialog 사용 위치

| 위치 | 파일 |
|------|------|
| 템플릿 에디터 | `template-editor.tsx` |
| 세션 콘텐츠 에디터 | `step-content-editor.tsx` |

## Agent 2 — 유사 기능

### 기존 Feature Gating 패턴

- PDF 버튼: `sessions/[id]/page.tsx`에서 `isPro` 조건부 렌더링
- 템플릿 생성: `templates/page.tsx`에서 `isPro` 조건부 렌더링
- ImportContentDialog는 **조건부 렌더링 없음** — 항상 표시

### 재사용 가능

- `ImportContentDialog` 컴포넌트 자체는 그대로 사용
- 감싸는 쪽(부모)에서 plan 체크 후 조건부 렌더링하는 패턴 재사용

## Agent 3 — 의존성

### 수정 필요 없음

- `import-content.ts` 파서는 클라이언트 전용 유틸리티 → plan 체크 불필요
- 서버 액션에 documentImport 관련 별도 엔드포인트 없음
- 추가 패키지 불필요

### 접근 방식

부모 컴포넌트에서 `isPro` 상태를 사용해 ImportContentDialog를 조건부 렌더링.

- `template-editor.tsx`: 이미 template prop에 접근 가능하나 plan 정보 없음 → plan prop 추가 필요
- `step-content-editor.tsx`: 세션 생성 위저드의 일부 → plan 조회 필요

## Agent 4 — 테스트

### 기존 테스트

- `import-content.test.ts`에 파서 테스트 존재
- UI gating 테스트 없음

### 이번 수정에 필요한 테스트

- 없음 (조건부 렌더링은 E2E 테스트 영역)

## 결론 및 추천 방향

**원인**: ImportContentDialog가 plan 체크 없이 모든 사용자에게 노출됨.

**수정 방안**: 부모 컴포넌트에서 Pro/Enterprise 여부를 전달받아 ImportContentDialog를 조건부 렌더링.

- `template-editor.tsx` → `canImport` prop 추가
- `step-content-editor.tsx` → `canImport` prop 추가
- 각 에디터를 사용하는 페이지에서 plan 조회 후 전달
