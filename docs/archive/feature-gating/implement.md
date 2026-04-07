## Implement 체크리스트

### Phase 1: Feature Gating 인프라
- [x] `src/lib/polar.ts` — `hasFeature()` feature 키 확장 (`documentImport` | `emailNotification` | `customBranding`)
- [x] `src/app/(dashboard)/settings/billing/billing-content.tsx` — PLANS features 목록 업데이트

### Phase 2: 문서 가져오기 기능
- [x] `src/lib/import-content.ts` — 텍스트/마크다운 → Block[] 변환 파서 생성
- [x] `src/components/editor/import-content-dialog.tsx` — 가져오기 다이얼로그 컴포넌트 생성
- [x] `src/components/editor/template-editor.tsx` — 템플릿 에디터에 가져오기 버튼 추가
- [x] `src/components/sessions/step-content-editor.tsx` — 세션 에디터에 가져오기 버튼 추가
