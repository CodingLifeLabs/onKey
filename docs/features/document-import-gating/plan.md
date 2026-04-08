# Plan: 문서 가져오기 기능 Gating

## 변경 설계

### 문제

ImportContentDialog가 plan 체크 없이 모든 사용자에게 노출됨. Pro/Enterprise 전용이어야 함.

### 변경 사항

- [ ] Presentation: `template-editor.tsx`에 `canImport` prop 추가 → ImportContentDialog 조건부 렌더링
- [ ] Presentation: `step-content-editor.tsx`에 `canImport` prop 추가 → ImportContentDialog 조건부 렌더링
- [ ] Page: 템플릿 편집 페이지에서 plan 조회 후 `canImport` 전달
- [ ] Page: 세션 생성 위저드에서 plan 조회 후 `canImport` 전달
