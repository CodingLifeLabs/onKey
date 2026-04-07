# 기능 #11: 템플릿 관리 메뉴 — Plan

## Domain

- [ ] 변경 없음 — 기존 Template Entity, TemplateRepository Interface, TemplateRepositoryImpl 그대로 사용

## Data

- [ ] 변경 없음 — 기존 Supabase 매핑, DataSource 재사용

## Action (Server Actions)

- [ ] `create-template.ts` — 새 템플릿 생성 (name, description, 빈 content [])
- [ ] `duplicate-template.ts` — 기존 템플릿 복사 (시스템/사용자 모두 복제 가능, 복제본은 isSystem=false)
- [ ] `delete-template.ts` — 사용자 템플릿 삭제 (소유권 검증, 시스템 템플릿 삭제 불가)
- [ ] `get-user-templates.ts` — 로그인 사용자의 커스텀 템플릿 목록 조회
- [ ] `get-all-templates.ts` — 시스템 + 사용자 템플릿 전체 조회 (목록 페이지용)

## Presentation — UI Components

- [ ] `template-card.tsx` — 템플릿 카드 (이름, 설명, 블록 수, 시스템/사용자 구분, 액션 버튼)
- [ ] `template-list.tsx` — 템플릿 카드 그리드 (시스템 템플릿 영역 + 사용자 템플릿 영역 분리)
- [ ] `create-template-dialog.tsx` — 새 템플릿 생성 다이얼로그 (이름, 설명 입력)
- [ ] `delete-template-dialog.tsx` — 삭제 확인 다이얼로그

## Presentation — Pages

- [ ] `/templates/page.tsx` — 템플릿 관리 메인 페이지 (Server Component)
  - DashboardHeader (제목, 설명, "새 템플릿" 버튼)
  - 시스템 템플릿 섹션 (읽기 전용, 복제만 가능)
  - 내 템플릿 섹션 (편집/복제/삭제 가능)
  - 빈 상태 안내

## Presentation — Navigation

- [ ] `app-sidebar.tsx` 수정 — "템플릿 관리" 메뉴 항목 추가 (/templates)

## Test

- [ ] `create-template.test.ts` — 인증, 유효성, INSERT 검증
- [ ] `delete-template.test.ts` — 인증, 소유권 검증, 시스템 템플릿 삭제 방지
- [ ] `duplicate-template.test.ts` — 인증, 콘텐츠 복사, isSystem=false 보장
- [ ] `get-user-templates.test.ts` — 인증, 소유자 필터
- [ ] `get-all-templates.test.ts` — 인증, 시스템+사용자 통합 조회
