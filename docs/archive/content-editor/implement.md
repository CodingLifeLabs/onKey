# Feature #5: 기본 콘텐츠 에디터 — Implement

## 의존성 설치

- [x] TipTap 패키지 설치 (@tiptap/react, @tiptap/starter-kit, @tiptap/extension-link, @tiptap/pm)

## Database

- [x] `supabase/migrations/003_storage_templates.sql` — templates 스토리지 버킷 생성

## Domain

- [x] `src/lib/validations/block.ts` — heading/text/image/divider Zod 스키마
- [x] `src/lib/block-utils.ts` — addBlock, removeBlock, moveBlockUp, moveBlockDown, updateBlockContent

## Data

- [x] `src/app/actions/get-template.ts` — templateId로 템플릿 조회 (ownerId 검증)
- [x] `src/app/actions/update-template-content.ts` — 템플릿 content 업데이트 (ownerId 검증)
- [x] `src/app/actions/upload-template-image.ts` — 이미지 Supabase Storage 업로드

## Presentation

- [x] `src/app/(dashboard)/templates/[templateId]/edit/page.tsx` — 에디터 페이지 (Server Component)
- [x] `src/components/editor/template-editor.tsx` — 메인 에디터 (Block[] 상태, 저장, 편집/미리보기)
- [x] `src/components/editor/block-toolbar.tsx` — 블록 추가 드롭다운
- [x] `src/components/editor/block-list.tsx` — 블록 리스트 + ▲▼ + 삭제
- [x] `src/components/editor/blocks/heading-editor.tsx` — 제목 편집 (text + level)
- [x] `src/components/editor/blocks/text-editor.tsx` — TipTap 텍스트 편집
- [x] `src/components/editor/blocks/image-editor.tsx` — 이미지 업로드 + alt/caption
- [x] `src/components/editor/blocks/divider-editor.tsx` — 구분선 표시

## Test

- [x] `src/lib/__tests__/block-utils.test.ts`
- [x] `src/lib/validations/__tests__/block.test.ts`
