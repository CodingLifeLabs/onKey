## 세션 콘텐츠 편집 기능 설계

### 변경 개요
위저드 3단계 → 4단계 확장, 템플릿 선택 후 블록 편집 가능

---

- [ ] Domain: 없음 (기존 Block 타입 재사용)
- [ ] Data: createSessionAction 시그니처 변경 (templateId + blocks → blocks 직접)
- [ ] Presentation:
  - [ ] StepContentEditor 컴포넌트 신규 (BlockToolbar + BlockList 조합)
  - [ ] CreateWizard 수정 (4단계로 확장, 상태 관리 변경)
  - [ ] StepTemplatePicker 수정 (선택만 하고 세션 생성하지 않음)
  - [ ] StepIndicator 수정 (4단계 표시)
- [ ] Test: createSessionAction 수정 후 기존 동작 확인
