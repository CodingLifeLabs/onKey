# 서명 블록 — Plan

## 설계 원칙

- 기존 블록 패턴 준수 (heading/text/image/divider/checklist)
- SignatureBlock 타입(`src/types/block.ts`) 변경 없이 사용
- 이번 feature는 **운영자 설정 폼**만 구현 (title, description, collect_name, collect_canvas)
- signature_pad 캔버스는 기능 #8에서 구현

## 레이어별 설계

### Domain / Data

- [x] 변경 없음

### Presentation

- [ ] **Validation**: `src/lib/validations/block.ts` — `signatureContentSchema` 추가
  - title: `z.string().optional()`
  - description: `z.string().optional()`
  - collect_name: `z.boolean()`
  - collect_canvas: `z.boolean()`

- [ ] **Utils**: `src/lib/block-utils.ts` — `createBlock()`에 `case 'signature'` 추가
  - `required: true` (SignatureBlock 타입 고정값)
  - `content: { title: '입주자 서명', description: '위 안내 사항을 모두 확인하였습니다', collect_name: true, collect_canvas: true }`
  - SignatureBlock import 추가

- [ ] **Editor**: `src/components/editor/blocks/signature-editor.tsx` 신규 생성
  - Props: `{ content: SignatureBlock['content']; preview: boolean; onChange: (content) => void }`
  - 편집 모드: title Input + description Input + collect_name 토글 + collect_canvas 토글
  - 미리보기 모드: 서명 영역 표시 (title, description, 서명 캔버스 placeholder)

- [ ] **Toolbar**: `src/components/editor/block-toolbar.tsx` — blockOptions에 signature 추가
  - `{ type: 'signature', label: '서명', icon: <PenLine /> }`

- [ ] **BlockList**: `src/components/editor/block-list.tsx` — 2곳 수정
  - BlockEditor switch에 `case 'signature'` + SignatureEditor import
  - 라벨 매핑에 `{block.type === 'signature' && '서명'}`

### Test

- [ ] `src/lib/validations/__tests__/block.test.ts` — signatureContentSchema 테스트
- [ ] `src/lib/__tests__/block-utils.test.ts` — `addBlock('signature')` 테스트
