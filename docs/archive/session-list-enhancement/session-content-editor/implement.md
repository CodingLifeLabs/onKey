## 구현 체크리스트

- [x] 1. createSessionAction 수정 (templateId 대신 blocks 직접 전달, 템플릿 내용 조회는 StepTemplatePicker에서 수행)
- [x] 2. StepContentEditor 컴포넌트 신규 생성
- [x] 3. CreateWizard 수정 (4단계 확장, contentBlocks 상태 추가)
- [x] 4. StepTemplatePicker 수정 (onNext가 templateId + content 함께 전달, 세션 생성 버튼 제거)
- [x] 5. StepIndicator 수정 없음 (steps 배열 길이에 따라 자동 처리됨)
- [x] 6. TypeScript 확인
