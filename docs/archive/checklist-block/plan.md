# 체크리스트 블록 — Plan

## 설계 원칙

- 기존 heading/text/image/divider 블록 패턴 준수
- ChecklistBlock 타입(`src/types/block.ts`) 변경 없이 사용
- 독립 폼 UI (TipTap 아님), 편집/미리보기 분기

## 레이어별 설계

### Domain

- [x] Entity / Repository Interface — 변경 없음 (ChecklistBlock 타입 이미 정의됨)

### Data

- [x] Repository / DataSource — 변경 없음 (Block[] JSONB 저장)

### Presentation

- [ ] **Validation**: `src/lib/validations/block.ts` — `checklistContentSchema` 추가
  - title: `z.string().optional()`
  - items: `z.array(checklistItemSchema)`, min 1개
  - checklistItemSchema: `{ id: z.string(), label: z.string().min(1), required: z.boolean() }`

- [ ] **Utils**: `src/lib/block-utils.ts` — `createBlock()`에 `case 'checklist'` 추가
  - `required: true` (ChecklistBlock 타입 고정값)
  - `content: { title: '', items: [] }`
  - ChecklistBlock import 추가

- [ ] **Editor**: `src/components/editor/blocks/checklist-editor.tsx` 신규 생성
  - Props: `{ content: ChecklistBlock['content']; preview: boolean; onChange: (content) => void }`
  - 편집 모드: 제목 Input + 항목 목록 (label Input + 삭제 버튼) + 항목 추가 버튼
  - 미리보기 모드: 제목 표시 + 체크리스트 항목 읽기 전용 표시
  - 항목 CRUD: 추가(Plus), 삭제(Trash2), 라벨 수정(Input change)

- [ ] **Toolbar**: `src/components/editor/block-toolbar.tsx` — blockOptions에 checklist 추가
  - `{ type: 'checklist', label: '체크리스트', icon: <CheckSquare /> }`
  - CheckSquare lucide-react import 추가

- [ ] **BlockList**: `src/components/editor/block-list.tsx` — 2곳 수정
  - BlockEditor switch에 `case 'checklist'` + ChecklistEditor import
  - 라벨 매핑에 `{block.type === 'checklist' && '체크리스트'}`

### Test

- [ ] `src/lib/validations/__tests__/block.test.ts` — checklistContentSchema 검증 테스트
- [ ] `src/lib/__tests__/block-utils.test.ts` — `addBlock('checklist')` 테스트
