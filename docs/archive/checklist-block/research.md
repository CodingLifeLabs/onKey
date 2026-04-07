# 체크리스트 블록 — Research

## 목표

템플릿 에디터에 체크리스트 블록을 추가한다. 운영자가 입주자가 확인/체크해야 할 항목 목록을 작성할 수 있게 한다.

## Agent 1 — 아키텍처 (위치할 레이어 / 기존 패턴)

### 기존 에디터 구조

- `Block[]` 배열을 `useState`로 관리하는 선언적 패턴
- `BlockList` → `BlockEditor` switch-case → 개별 `*Editor` 컴포넌트
- 각 Editor는 `{ content, preview, onChange }` props
- 저장: `updateTemplateContent` Server Action → Supabase JSONB

### 수정 필요 파일

| 파일 | 작업 |
|------|------|
| `src/lib/block-utils.ts` | `createBlock()` switch에 `case 'checklist'` 추가 |
| `src/lib/validations/block.ts` | `checklistContentSchema` 추가 |
| `src/components/editor/block-toolbar.tsx` | `blockOptions`에 checklist 항목 추가 |
| `src/components/editor/block-list.tsx` | `BlockEditor` switch에 `case 'checklist'` 추가 |
| `src/components/editor/blocks/checklist-editor.tsx` | **신규 생성** (핵심) |

### 수정 불필요 파일

- `src/types/block.ts` — ChecklistBlock 타입 이미 정의됨
- Domain/Repository/Data 계층 — Block[] JSONB로 저장되어 스키마 변경 없음
- `session-progress.entity.ts` — `checkedItems: string[]` 필드 이미 존재

### 패턴 일관성

heading-editor.tsx 패턴 준수: Input 기반 폼 UI, 편집/미리보기 분기, onChange로 content 업데이트. ChecklistBlock은 `required: true`가 타입 수준에서 고정.

## Agent 2 — 유사 기능 (재사용 가능 / 새로 만들 것)

### 재사용 가능

| 항목 | 비고 |
|------|------|
| BaseBlock 타입 | id/order/required/type 구조 그대로 |
| BlockList 컨테이너 | 렌더/순서변경/삭제 UI 완전 재사용 |
| block-utils.ts 함수 | addBlock/removeBlock/moveBlock/updateBlockContent |
| BlockToolbar 드롭다운 | blockOptions 배열에 항목만 추가 |
| nanoid | `nanoid(8)`로 ChecklistItem id 생성 |
| shadcn/ui Input, Button, Card | 모두 재사용 |
| block.test.ts | ChecklistBlock 타입 검증 테스트 이미 존재 |

### 새로 만들 것

| 항목 | 설명 |
|------|------|
| `checklist-editor.tsx` | 제목 입력, 항목 추가/삭제/수정, 미리보기 |
| `checklistContentSchema` | Zod 검증 스키마 |

### 주의사항

ChecklistBlock은 TipTap 리치 텍스트가 아닌 **독립 폼 UI**로 구현. HeadingEditor가 Input 기반인 것과 동일. `content: { title?: string; items: ChecklistItem[] }` 구조는 구조화된 데이터이므로 TipTap TaskList와 무관.

## Agent 3 — 의존성 (필요한 것 / 충돌 위험)

### 추가 설치: 없음

- TipTap v3 `@tiptap/extension-list`에 TaskList/TaskItem 포함되어 있으나 **사용하지 않음**
- shadcn/ui Checkbox 필요 없음 (커스텀 토글 또는 native checkbox로 충분)
- lucide-react `CheckSquare`, `Plus` 아이콘 이미 설치됨

### 버전 충돌 위험: 없음

모든 `@tiptap/*` 패키지가 `3.22.0`으로 통일.

## Agent 4 — 테스트 (위치 / 범위)

### 기존 테스트 현황

- Vitest 3.2.4 + jsdom 환경
- `__tests__/` 디렉토리 패턴 (소스 파일과 동일 계층)
- 4개 테스트 파일, 32개 테스트 케이스 (모두 로직 단위 테스트)

### 체크리스트 블록 테스트 범위

| 파일 | 내용 |
|------|------|
| `src/lib/__tests__/block-utils.test.ts` | `addBlock('checklist')` 테스트 추가 |
| `src/lib/validations/__tests__/block.test.ts` | checklistContentSchema 검증 테스트 추가 |

기존 Entity 테스트(`block.test.ts`)에는 ChecklistBlock 검증이 이미 포함되어 있음.

## 결론 및 추천 방향

**핵심 작업**: `checklist-editor.tsx` 신규 생성 + 기존 파일 4개 switch/case 추가

구현 난이도: **중간** — 기존 패턴을 그대로 따르지만 항목 CRUD UI가 추가됨

추천 구현 순서:
1. Zod 검증 스키마 추가
2. block-utils.ts createBlock case 추가
3. checklist-editor.tsx 신규 생성
4. block-list.tsx + block-toolbar.tsx 연결
5. 테스트 추가
