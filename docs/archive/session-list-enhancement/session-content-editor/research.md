## 목표

세션 생성 위저드에 콘텐츠 편집 단계를 추가하여, 템플릿 선택 후 또는 빈 템플릿으로 시작 시 사용자가 직접 블록을 편집/생성할 수 있도록 함.

## Agent 1 — 아키텍처 (위치할 레이어 / 기존 패턴)

### 현재 위저드 구조
- 3단계: 기본 정보 → 템플릿 선택 → 링크 공유
- 상태 관리: CreateWizard의 useState로 step별 데이터 관리
- Step 2에서 템플릿 선택 즉시 createSessionAction 호출 → Step 3은 결과만 표시

### 변경 방향
- 4단계: 기본 정보 → 템플릿 선택 → **콘텐츠 편집** → 링크 공유
- Step 2에서는 템플릿 선택만 (세션 생성하지 않음)
- Step 3에서 선택한 템플릿의 블록을 편집 (빈 템플릿이면 빈 에디터)
- Step 4에서 편집된 블록과 함께 세션 생성

### 재사용 가능한 컴포넌트
- `BlockToolbar` (블록 추가 툴바) → 그대로 재사용
- `BlockList` (블록 렌더링/편집) → 그대로 재사용
- `block-utils.ts` (addBlock, removeBlock 등) → 그대로 재사용

## Agent 2 — 유사 기능 (재사용 가능 / 새로 만들 것)

### 재사용
- `TemplateEditor` 패턴 (blocks 상태 + CRUD 핸들러) 동일하게 적용
- `BlockToolbar`, `BlockList` 컴포넌트 그대로 사용

### 새로 만들 것
- `StepContentEditor` 컴포넌트: 위저드용 에디터 스텝 (TemplateEditor 로직과 동일하나 저장 액션 없이 상태만 관리)
- `createSessionAction` 수정: templateId 대신 직접 blocks 배열을 받도록 시그니처 변경

## Agent 3 — 의존성 (필요한 것 / 충돌 위험)

- 추가 설치 필요 없음
- 기존 block-utils, BlockToolbar, BlockList 그대로 사용
- TipTap 등 에디터 의존성은 이미 설치됨

## Agent 4 — 테스트 (위치 / 범위)

- `src/__tests__/block-utils.test.ts` 기존 테스트 패턴 참고
- 새로운 테스트: createSessionAction에 blocks 직접 전달 시 동작 확인
- StepContentEditor는 UI 컴포넌트이므로 수동 테스트

## 결론 및 추천 방향

1. 위저드를 4단계로 확장 (기본 정보 → 템플릿 → 콘텐츠 편집 → 링크)
2. StepContentEditor 신규 생성 (BlockToolbar + BlockList 조합)
3. createSessionAction 수정 (blocks 직접 전달)
4. 기존 에디터 컴포넌트 최대 재사용
