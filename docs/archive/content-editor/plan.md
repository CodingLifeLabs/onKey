# Feature #5: 기본 콘텐츠 에디터 — Plan

## 의존성 설치

- [ ] @tiptap/react, @tiptap/starter-kit, @tiptap/extension-link, @tiptap/pm 설치

## Database

- [ ] Supabase Storage `templates` 버킷 생성 마이그레이션 (003_storage_templates.sql)

## Domain

- [ ] Block content Zod 검증 스키마 (`src/lib/validations/block.ts`)
  - headingSchema: text (string), level (1|2|3)
  - textSchema: html (string)
  - imageSchema: url, alt, caption?, width?
  - dividerSchema: 빈 객체
- [ ] Block 조작 유틸리티 (`src/lib/block-utils.ts`)
  - addBlock(blocks, type, index?): Block[]
  - removeBlock(blocks, blockId): Block[]
  - moveBlockUp(blocks, blockId): Block[]
  - moveBlockDown(blocks, blockId): Block[]
  - updateBlockContent(blocks, blockId, content): Block[]

## Data

- [ ] Server Action: getTemplate (`src/app/actions/get-template.ts`)
  - templateId → Template | null (ownerId 검증 포함)
- [ ] Server Action: updateTemplateContent (`src/app/actions/update-template-content.ts`)
  - templateId, Block[] → Template (ownerId 검증)
- [ ] Server Action: uploadTemplateImage (`src/app/actions/upload-template-image.ts`)
  - FormData (file) → { url: string } (Supabase Storage 업로드)

## Presentation

- [ ] 에디터 페이지 (`src/app/(dashboard)/templates/[templateId]/edit/page.tsx`)
  - Server Component: getTemplate 호출 → TemplateEditor에 전달
- [ ] TemplateEditor (`src/components/editor/template-editor.tsx`)
  - Client Component: Block[] 상태 관리, 저장 버튼
  - 편집/미리보기 토글
- [ ] BlockToolbar (`src/components/editor/block-toolbar.tsx`)
  - 블록 추가 드롭다운 (heading, text, image, divider)
- [ ] BlockList (`src/components/editor/block-list.tsx`)
  - Block[] 렌더링, ▲▼ 순서 변경 버튼, 삭제 버튼
- [ ] HeadingEditor (`src/components/editor/blocks/heading-editor.tsx`)
  - text input + level select (h1/h2/h3)
- [ ] TextEditor (`src/components/editor/blocks/text-editor.tsx`)
  - TipTap 에디터 (bold, italic, ul, ol, link)
  - HTML 출력 → Block.content.html
- [ ] ImageEditor (`src/components/editor/blocks/image-editor.tsx`)
  - 파일 업로드 + 미리보기 + alt/caption 입력
- [ ] DividerEditor (`src/components/editor/blocks/divider-editor.tsx`)
  - 읽기 전용 구분선 표시

## Test

- [ ] `src/lib/__tests__/block-utils.test.ts` — addBlock, removeBlock, moveBlock, updateBlockContent
- [ ] `src/lib/validations/__tests__/block.test.ts` — heading/text/image/divider 스키마 검증
