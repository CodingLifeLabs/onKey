# Feature #5: 기본 콘텐츠 에디터 (heading/text/image/divider)

## 목표

운영자가 템플릿의 블록 콘텐츠를 편집할 수 있는 에디터 구현.
지원 블록: heading, text, image, divider (4종).
드래그앤드롭 없이 ▲▼ 버튼으로 순서 변경.

---

## Agent 1 — 아키텍처 (위치할 레이어 / 기존 패턴)

### 기존 아키텍처

```
Presentation (Server Component → Client Component)
    ↓
Server Actions ('use server')
    ↓
Data Layer (Repository + DataSource + Supabase)
```

- **usecase 레이어 없음**: 프로젝트는 server actions가 직접 repository를 호출하는 패턴 사용
- **Server/Client 분리**: page.tsx(server) → Wizard/Form(client) 패턴 확립
- **상태 관리**: react-hook-form + useState (글로벌 상태 관리 없음)

### 에디터 배치

```
src/app/(dashboard)/templates/[templateId]/edit/page.tsx  ← Server Component
src/components/editor/                                     ← Client Components
  ├── template-editor.tsx         ← 메인 에디터 (전체 상태 관리)
  ├── block-list.tsx              ← 블록 리스트 + 순서 변경
  ├── block-renderer.tsx          ← 블록 타입별 렌더 분기
  ├── blocks/
  │   ├── heading-editor.tsx
  │   ├── text-editor.tsx
  │   ├── image-editor.tsx
  │   └── divider-editor.tsx
  ├── block-toolbar.tsx           ← 블록 추가 툴바
  └── block-preview.tsx           ← 미리보기 모드
```

### 라우트 결정

- `/templates/[templateId]/edit` — 기존 템플릿 편집
- 세션 생성 위저드의 step-template-picker에서 "템플릿 편집" 링크로 연결
- 새 템플릿 생성: `/templates/new` (빈 content로 생성 후 /edit으로 리다이렉트)

---

## Agent 2 — 유사 기능 (재사용 가능 / 새로 만들 것)

### 재사용 가능

| 항목 | 위치 | 재사용 방법 |
|------|------|-------------|
| Block 타입 정의 | `src/types/block.ts` | 그대로 사용 (heading, text, image, divider) |
| Template Entity | `src/domain/entities/template.entity.ts` | content: Block[] 필드 사용 |
| ITemplateRepository | `src/domain/repositories/template.repository.ts` | update(id, { content }) 사용 |
| TemplateRepository 구현 | `src/data/repositories/template.repository.impl.ts` | 그대로 사용 |
| mapTemplateFromRow | `src/data/datasources/supabase.datasource.ts` | 그대로 사용 |
| DashboardHeader | `src/components/dashboard/dashboard-header.tsx` | 에디터 페이지 헤더 |
| shadcn/ui 컴포넌트 | `src/components/ui/` | Button, Card, Input, Textarea, Select 등 |
| nanoid | 패키지 설치됨 (v5.1.7) | 블록 ID 생성: `nanoid(10)` |
| CreateWizard 패턴 | `src/components/sessions/create-wizard.tsx` | 상태 관리 패턴 참고 |

### 새로 만들 것

| 항목 | 설명 |
|------|------|
| TemplateEditor 컴포넌트 | 전체 에디터 상태 관리 (Block[] 조작) |
| 개별 블록 에디터 4종 | HeadingEditor, TextEditor, ImageEditor, DividerEditor |
| BlockList + 순서 변경 | ▲▼ 버튼으로 order 변경 로직 |
| BlockToolbar | 블록 추가 드롭다운/버튼 |
| TipTap 텍스트 에디터 | HTML 서식 편집 (bold, italic, ul, ol, a) |
| 이미지 업로드 | Supabase Storage → URL 반환 |
| Server Actions | getTemplate, updateTemplateContent, uploadImage |

---

## Agent 3 — 의존성 (필요한 것 / 충돌 위험)

### 현재 설치됨

| 패키지 | 버전 | 용도 |
|--------|------|------|
| nanoid | 5.1.7 | 블록 ID 생성 |
| react-hook-form | 7.72.0 | 폼 상태 관리 |
| zod | 4.3.6 | 검증 |
| @supabase/supabase-js | 2.101.1 | Storage 업로드 |
| lucide-react | 1.7.0 | 아이콘 |

### 추가 설치 필요

| 패키지 | 버전 | 용도 |
|--------|------|------|
| @tiptap/react | ^2.x | 텍스트 블록 리치 에디터 |
| @tiptap/starter-kit | ^2.x | 기본 확장 (bold, italic, list 등) |
| @tiptap/extension-link | ^2.x | 링크 삽입 확장 |
| @tiptap/extension-image | ^2.x | 인라인 이미지 (선택) |
| @tiptap/pm | ^2.x | Peer dependency |

> TextBlock.content.html에 기본 서식(bold, italic, ul, ol, a)만 허용하므로 TipTap Starter Kit으로 충분.

### Supabase Storage

- `templates` 버킷 필요 (이미지 블록용)
- RLS 정책: 인증된 운영자만 업로드/읽기 가능
- 아직 버킷 생성 안 됨 — 마이그레이션 필요

### 충돌 위험

- React 19 + TipTap 2.x: 호환됨 (TipTap 2.x는 React 18+ 지원)
- Next.js 16 App Router: `'use client'` 지시문 필수 → TipTap은 client component에서만 사용

---

## Agent 4 — 테스트 (위치 / 범위)

### 기존 테스트 설정

- **런너**: Vitest 3.2.4 + jsdom
- **위치**: `__tests__/` 디렉토리 (co-located)
- **패턴**: describe/it/expect, vi.mock()
- **유틸리티**: `@testing-library/jest-dom`, `@testing-library/react`

### 이 Feature에서 필요한 테스트

| 테스트 | 위치 | 범위 |
|--------|------|------|
| 블록 조작 유틸 | `src/lib/__tests__/block-utils.test.ts` | 순서 변경, 추가, 삭제 로직 |
| Zod 스키마 | `src/lib/validations/__tests__/block.test.ts` | 블록 content 검증 |
| Server Actions | `src/app/actions/__tests__/template.test.ts` | getTemplate, updateTemplateContent |

> 컴포넌트 테스트는 MVP에서 제외 (에디터 UI는 시각적 확인 우선)

---

## 결론 및 추천 방향

### 핵심 결정

1. **TipTap 사용** — TextBlock HTML 편집을 위해 가장 적합 (가벼운 스타터킷으로 충분)
2. **에디터 상태는 React useState** — Block[]를 상태로 관리, 변경 시 server action 호출
3. **순서 변경은 ▲▼ 버튼** — 드래그앤드롭 없이 배열 인덱스 swap
4. **자동 저장 없이 수동 저장** — "저장" 버튼 클릭 시 updateTemplateContent 호출
5. **이미지 업로드는 Supabase Storage** — `templates` 버킷 사용

### 구현 순서 추천

1. 의존성 설치 (TipTap)
2. Supabase Storage 버킷 생성 (마이그레이션)
3. 블록 조작 유틸리티 (block-utils.ts)
4. Server Actions (getTemplate, updateTemplateContent, uploadImage)
5. 에디터 UI (TemplateEditor → BlockList → 개별 블록 에디터)
6. 라우트 페이지 (templates/[templateId]/edit)
7. 테스트
