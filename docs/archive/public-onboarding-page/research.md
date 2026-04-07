# 입주자 퍼블릭 페이지 /onboarding/[token] — Research

## 목표

입주자가 토큰 링크로 접속해 온보딩 콘텐츠를 확인하고, 체크리스트 체크 + 서명 후 완료 처리하는 퍼블릭 페이지를 구현한다.

## Agent 1 — 아키텍처

### 데이터 흐름

```
token (URL) → findByToken(token) → Session (contentSnapshot: Block[])
  → Block[] 블록 타입별 렌더링
  → SessionProgress (viewedSections, checkedItems, signatureName, signatureImageUrl)
```

### 라우트 구조

- `src/app/onboarding/[token]/page.tsx` — Server Component (독립 라우트, 라우트 그룹 없음)
- 미들웨어에 `/onboarding/(.*)` 이미 public route로 등록됨 → Clerk 인증 불필요
- Next.js 16 params: `params: Promise<{ token: string }>`

### SessionProgress 필드와 입주자 액션

| 필드 | 입주자 액션 |
|------|-------------|
| `viewedSections: string[]` | 블록 열람 시 블록 ID 누적 |
| `checkedItems: string[]` | 체크리스트 항목 체크 |
| `signatureName: string \| null` | 이름 서명 입력 |
| `signatureImageUrl: string \| null` | 캔버스 서명 이미지 Storage URL |
| `submittedAt: Date \| null` | 최종 제출 |

### 재사용 가능 (수정 없이)

- `ISessionRepository.findByToken()` — service role 기반
- `ISessionProgressRepository` 전체 — 조회/업데이트
- `SessionRepository` 구현체 — service client 사용 중
- `createServiceClient()` — 퍼블릭 페이지에서 RLS 우회
- Block 타입 정의, Entity, DataSource 매핑

### 수정 불필요

- Domain/Repository/Data 레이어 모두 준비 완료
- 미들웨어 설정 이미 완료

## Agent 2 — 유사 기능

### 기존 에디터 preview vs 퍼블릭 전용 렌더러

**결정: 퍼블릭 전용 렌더러를 새로 생성**

이유:
1. 기존 에디터는 모두 `'use client'` + `onChange` 필수 → 불필요한 클라이언트 JS
2. heading/text/image/divider는 서버 컴포넌트로 가능
3. checklist/signature는 입주자 인터랙션 필요 (기존 preview와 완전히 다른 UI)

### 새로 만들어야 할 것

| 항목 | 설명 |
|------|------|
| 퍼블릭 블록 렌더러 세트 | heading/text/image/divider 읽기 전용 + checklist/signature 인터랙티브 |
| 인터랙티브 체크리스트 | 체크/체크해제 + checkedItems 상태 관리 |
| 서명 캔버스 (signature_pad) | 터치/마우스 캔버스 + toDataURL + 업로드 |
| 서명 이미지 업로드 Server Action | 토큰 기반 검증 (Clerk 인증 아님) |
| 진행 상태 업데이트 Server Action | viewedSections, checkedItems, 서명 정보 저장 |
| 완료 처리 | 모든 required 블록 완료 후 submittedAt 설정 + status 변경 |
| 라우트 페이지 | `src/app/onboarding/[token]/page.tsx` |

## Agent 3 — 의존성

### 추가 설치: 없음

- signature_pad@5.1.3 설치됨 (타입 정의 포함)
- signature_pad React 사용 패턴: useRef → new SignaturePad(canvas) → toDataURL → File → FormData 업로드

### 서명 이미지 저장 전략

| 항목 | 값 |
|------|-----|
| Storage 버킷 | `signatures` (신규 생성, private) |
| 경로 | `{sessionId}/{nanoid(12)}.png` |
| 크기 제한 | 1MB |
| 형식 | PNG만 |

### 신규 생성 필요

1. Supabase: `signatures` 버킷 생성 (private)
2. `src/app/actions/upload-signature-image.ts` — 세션 토큰 기반 서명 업로드

## Agent 4 — 테스트

### 기존 테스트

- 4개 파일, 42개 테스트. Server Action 테스트 없음.
- SessionProgress 서명 필드 매핑은 이미 구현됨

### 필요 테스트

| 파일 | 내용 |
|------|------|
| `src/app/actions/__tests__/get-session-by-token.test.ts` | 유효/만료/없는 토큰 |
| `src/app/actions/__tests__/update-progress.test.ts` | viewedSections/checkedItems 업데이트 |
| `src/app/actions/__tests__/upload-signature.test.ts` | 정상/용량초과/빈캔버스 |
| `src/app/actions/__tests__/complete-session.test.ts` | 완료 처리 |

## 결론 및 추천 방향

**구현 난이도: 높음** — 신규 파일 많고 서명 캔버스 구현 포함

**구현 순서**:
1. Supabase `signatures` 버킷 마이그레이션
2. Server Actions 4종 (getSessionByToken, updateProgress, uploadSignature, completeSession)
3. 퍼블릭 블록 렌더러 (읽기 전용 4종 + 인터랙티브 2종)
4. OnboardingPage 클라이언트 컴포넌트 (상태 관리 + 진행률)
5. 라우트 페이지 (`/onboarding/[token]/page.tsx`)
6. 테스트
