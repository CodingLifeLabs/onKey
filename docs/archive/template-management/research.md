# 기능 #11: 템플릿 관리 메뉴

## 목표

세션 생성 시에만 템플릿을 접근할 수 있는 현재 구조에서, 대시보드 내에 독립적인 **템플릿 관리 메뉴**를 추가한다. 운영자가 언제든지 템플릿을 생성·조회·수정·복제·삭제할 수 있도록 한다.

---

## Agent 1 — 아키텍처

### 현재 대시보드 구조

```
src/app/(dashboard)/
├── layout.tsx          ← SidebarProvider + AppSidebar + SidebarInset
├── page.tsx            ← 대시보드 메인
├── sessions/           ← 세션 관리
│   ├── page.tsx
│   ├── new/
│   └── [id]/
└── templates/
    └── [templateId]/
        └── edit/
            └── page.tsx  ← 기존 에디터 페이지 (직접 URL 접근만 가능)
```

### 사이드바 메뉴 (현재 5개)

- 대시보드 (`/`)
- 세션 관리 (`/sessions`)
- 분석 (미구현)
- 결제 관리 (미구현)
- 설정 (미구현)

**→ "템플릿 관리" 메뉴 추가 필요, `/templates` 라우트 연결**

### 위치할 레이어

| 레이어 | 파일 |
|--------|------|
| Presentation | `src/app/(dashboard)/templates/page.tsx` (신규) |
| Presentation | `src/app/(dashboard)/templates/new/page.tsx` (신규) |
| Presentation | `src/components/dashboard/template-card.tsx` (신규) |
| Presentation | `src/components/dashboard/template-list.tsx` (신규) |
| Presentation | `src/components/dashboard/create-template-dialog.tsx` (신규) |
| Action | `src/app/actions/create-template.ts` (신규) |
| Action | `src/app/actions/delete-template.ts` (신규) |
| Action | `src/app/actions/duplicate-template.ts` (신규) |
| Action | `src/app/actions/get-user-templates.ts` (신규) |
| Domain | 기존 Template Entity, TemplateRepository 재사용 |
| Data | 기존 TemplateRepositoryImpl 재사용 |

### 기존 패턴 준수

- Server Component에서 데이터 페칭 → Client Component에 props 전달
- `DashboardHeader` + 페이지 컨텐츠 구조
- shadcn/ui Card, Button, Dialog 컴포넌트 사용
- Server Actions로 데이터 조작

---

## Agent 2 — 유사 기능 (재사용 분석)

### 재사용 가능 (85%)

| 항목 | 경로 | 비고 |
|------|------|------|
| Template Entity | `src/domain/entities/template.entity.ts` | 그대로 사용 |
| TemplateRepository Interface | `src/domain/repositories/template.repository.ts` | findById, findByOwnerId, findSystemTemplates, create, update, delete 모두 존재 |
| TemplateRepositoryImpl | `src/data/repositories/template.repository.impl.ts` | Supabase 매핑 완료 |
| mapTemplateFromRow | `src/data/datasources/supabase.datasource.ts` | Row→Entity 매핑 함수 존재 |
| TemplateEditor | `src/components/editor/template-editor.tsx` | 에디터 그대로 사용 |
| StepTemplatePicker | `src/components/sessions/step-template-picker.tsx` | 카드 UI 패턴 참고 |
| BlockList, BlockToolbar | `src/components/editor/` | 블록 편집 그대로 사용 |
| Block Utils | `src/lib/block-utils.ts` | addBlock, removeBlock 등 |
| Block Types | `src/types/block.ts` | 모든 블록 타입 정의 |
| getTemplate Action | `src/app/actions/get-template.ts` | 단건 조회 + 소유권 검증 |
| updateTemplateContent | `src/app/actions/update-template-content.ts` | 콘텐츠 수정 |
| uploadTemplateImage | `src/app/actions/upload-template-image.ts` | 이미지 업로드 |
| DashboardHeader | `src/components/dashboard/dashboard-header.tsx` | 페이지 헤더 패턴 |
| AppSidebar | `src/components/dashboard/app-sidebar.tsx` | 사이드바 수정 필요 |

### 새로 만들 것 (15%)

| 항목 | 설명 |
|------|------|
| `/templates` 페이지 | 템플릿 목록 조회 (시스템 + 사용자) |
| TemplateCard | 카드 UI (이름, 설명, 블록 수, 액션 버튼) |
| TemplateList | 카드 그리드/리스트 뷰 |
| CreateTemplateDialog | 새 템플릿 생성 모달 (이름, 설명, 베이스 선택) |
| createTemplate Action | INSERT + 소유권 설정 |
| deleteTemplate Action | DELETE + 소유권 검증 |
| duplicateTemplate Action | 기존 템플릿 복사 (시스템 템플릿→사용자 템플릿) |
| getUserTemplates Action | 사용자 커스텀 템플릿 목록 조회 |
| 사이드바 메뉴 추가 | "템플릿 관리" 항목 |

---

## Agent 3 — 의존성

### 설치된 패키지 (모두 충족)

| 패키지 | 버전 | 용도 |
|--------|------|------|
| next | 16.2.2 | App Router |
| @clerk/nextjs | 7.0.8 | 인증 |
| @supabase/supabase-js | 2.101.1 | DB |
| shadcn/ui 계열 | 최신 | UI 컴포넌트 |
| react-hook-form + zod | 7.72 + 4.3.6 | 폼 검증 |
| @tiptap/react | 3.22 | 에디터 |
| nanoid | 5.1.7 | ID 생성 |

**→ 추가 설치 필요 없음**

### DB 스키마 (이미 존재)

```sql
templates (
  id UUID PK,
  owner_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  content JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### RLS 정책 (이미 구성)

- 시스템 템플릿: 모든 인증 사용자 읽기 가능
- 사용자 템플릿: owner만 접근

### 누락된 Server Actions

| Action | 상태 |
|--------|------|
| getUserTemplates | 신규 필요 |
| createTemplate | 신규 필요 |
| duplicateTemplate | 신규 필요 |
| deleteTemplate | 신규 필요 |

---

## Agent 4 — 테스트

### 기존 테스트 구성

- **Runner**: Vitest 3.2.4, jsdom 환경
- **Setup**: `src/test/setup.ts` (jest-dom)
- **Mock**: `src/test/clerk-mock.ts` (mockClerkAuth)

### 기존 테스트 위치

```
src/domain/entities/__tests__/block.test.ts
src/lib/__tests__/block-utils.test.ts
src/lib/validations/__tests__/block.test.ts
src/app/api/webhooks/clerk/__tests__/route.test.ts
```

### 필요한 테스트

| 테스트 | 위치 | 범위 |
|--------|------|------|
| create-template | `src/app/actions/__tests__/create-template.test.ts` | 인증, 유효성, INSERT |
| delete-template | `src/app/actions/__tests__/delete-template.test.ts` | 인증, 소유권 검증, DELETE |
| duplicate-template | `src/app/actions/__tests__/duplicate-template.test.ts` | 인증, 복사, 소유권 설정 |
| get-user-templates | `src/app/actions/__tests__/get-user-templates.test.ts` | 인증, 소유권 필터 |

### 패턴

- Supabase: `vi.mock()`으로 service client 모킹
- Clerk: 기존 `mockClerkAuth()` 사용
- Arrange-Act-Assert 구조

---

## 결론 및 추천 방향

### 핵심 요약

1. **기반 완비**: Entity, Repository, DB 스키마, RLS, 에디터 컴포넌트 모두 구현 완료
2. **주요 작업**: 템플릿 목록 페이지 + CRUD Actions (create/duplicate/delete) + 사이드바 메뉴 추가
3. **의존성**: 추가 설치 없음
4. **리스크**: 낮음 — 기존 패턴 그대로 확장

### 구현 우선순위

1. Server Actions (create/duplicate/delete/get-user-templates)
2. `/templates` 목록 페이지
3. 사이드바 메뉴 추가
4. CreateTemplateDialog 컴포넌트
5. 테스트 코드
