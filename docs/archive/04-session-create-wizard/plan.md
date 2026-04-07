# Feature 4: 세션 생성 폼 (3단계 위저드) + 토큰 발급 — Plan

## Presentation: 위저드 컴포넌트

- [ ] 진행 표시기 (StepIndicator) 컴포넌트
- [ ] Step 1: 기본 정보 폼 (호실, 입주자명, 입주일, 만료일, 메모)
- [ ] Step 2: 템플릿 선택 (시스템 템플릿 카드 + 빈 템플릿)
- [ ] Step 3: 링크 공유 (토큰 URL + 복사 + QR placeholder)

## Domain: UseCase

- [ ] 세션 생성 Server Action (`src/app/actions/create-session.ts`)
  - 토큰 생성 (nanoid)
  - 세션 한도 체크
  - templates에서 content_snapshot 복사
  - sessions INSERT

## Presentation: 라우트

- [ ] `src/app/(dashboard)/sessions/new/page.tsx` — 위저드 페이지

## Test

- [ ] 세션 생성 Server Action 단위 테스트
