# 입주자 퍼블릭 페이지 — Plan

## 설계 원칙

- 퍼블릭 전용 블록 렌더러 (기존 에디터 재사용 안 함 — 서버 컴포넌트 가능, 불필요한 의존성 제거)
- Server Actions 패턴 유지 (기존 프로젝트 일관성)
- service_role 클라이언트 사용 (Clerk 인증 없음)
- 모바일 퍼스트, LCP < 2.5s

## 인프라

- [ ] **Supabase 마이그레이션**: `supabase/migrations/004_storage_signatures.sql`
  - `signatures` 버킷 생성 (public=false)
  - service_role INSERT 정책
  - public SELECT 정책 (서명 이미지 열람)
- [ ] **미들웨어**: `/onboarding/(.*)` public route 추가

## Data

- [x] SessionRepository.findByToken() — 이미 구현됨
- [x] SessionProgressRepository.updateProgress() — 이미 구현됨

## Server Actions (신규 4개)

- [ ] **`src/app/actions/get-session-by-token.ts`** — 토큰 → 세션 + progress 조회
  - 입력: token string
  - 세션 조회 (findByToken) → 만료/완료 상태 검증
  - progress 조회 (findBySessionId)
  - 반환: { session, progress }

- [ ] **`src/app/actions/update-progress.ts`** — 진행 상태 업데이트
  - 입력: sessionId, viewedSections?, checkedItems?
  - SessionProgressRepository.updateProgress() 호출

- [ ] **`src/app/actions/upload-signature-image.ts`** — 서명 이미지 업로드
  - 입력: File, sessionId
  - 파일 검증 (PNG, 1MB)
  - `signatures` 버킷에 `{sessionId}/{nanoid(12)}.png` 업로드
  - public URL 반환

- [ ] **`src/app/actions/complete-session.ts`** — 세션 완료 처리
  - 모든 required 블록 완료 검증
  - progress에 submittedAt 설정
  - session status → completed

## Presentation (신규)

- [ ] **라우트**: `src/app/onboarding/[token]/page.tsx` — Server Component
  - params Promise → token 추출
  - getSessionByToken() 호출 → 세션/progress 전달
  - 에러 상태 (만료, 없음, 완료) 분기

- [ ] **OnboardingPage**: `src/components/onboarding/onboarding-page.tsx` — Client Component
  - blocks + progress 상태 관리
  - 진행률 계산
  - 스크롤 시 viewedSections 자동 업데이트
  - 완료 버튼 → completeSession()

- [ ] **블록 렌더러**: `src/components/onboarding/block-viewer.tsx` — switch 라우터
  - heading/text/image/divider: 읽기 전용 렌더 (서버 컴포넌트 가능하지만 OnboardingPage client 안에 있어야 함)
  - checklist: 인터랙티브 (체크/체크해제 → checkedItems 업데이트)
  - signature: 인터랙티브 (이름 입력 + 캔버스 서명 + 업로드)

- [ ] **개별 블록 뷰어**: `src/components/onboarding/blocks/`
  - `heading-viewer.tsx` — h1/h2/h3 렌더
  - `text-viewer.tsx` — dangerouslySetInnerHTML + prose 스타일
  - `image-viewer.tsx` — img + caption
  - `divider-viewer.tsx` — Separator
  - `checklist-viewer.tsx` — 체크박스 인터랙티브
  - `signature-viewer.tsx` — 이름 Input + signature_pad 캔버스 + 업로드

## Test

- [ ] `src/app/actions/__tests__/get-session-by-token.test.ts`
- [ ] `src/app/actions/__tests__/update-progress.test.ts`
- [ ] `src/app/actions/__tests__/upload-signature-image.test.ts`
- [ ] `src/app/actions/__tests__/complete-session.test.ts`
