# Implement: 문서 가져오기 기능 Gating

## 체크리스트

- [x] `src/components/editor/template-editor.tsx` — `canImport` prop 추가, ImportContentDialog 조건부 렌더링
- [x] `src/components/sessions/step-content-editor.tsx` — `canImport` prop 추가, ImportContentDialog 조건부 렌더링
- [x] `src/app/(dashboard)/templates/[templateId]/edit/page.tsx` — plan 조회 후 `canImport` 전달
- [x] `src/app/(dashboard)/sessions/new/page.tsx` — plan 조회 후 `canImport` → CreateWizard → StepContentEditor 전달
