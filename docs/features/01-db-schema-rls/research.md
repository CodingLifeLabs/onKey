# Feature 1: DB 스키마 + RLS 설정 — Research

## 목표

Supabase PostgreSQL에 profiles, templates, sessions, session_progress 테이블을 생성하고, RLS 정책으로 운영자 간 데이터 격리를 구현한다. 프로젝트 스캐폴딩(Next.js 16 + shadcn/ui)을 선행한다.

## Agent 1 — 아키텍처 (위치할 레이어 / 기존 패턴)

### 프로젝트 구조

Next.js 16 App Router 기반 Clean Architecture:

```
src/
  app/                    # Presentation - Pages (App Router)
    (auth)/               # Clerk 인증 페이지
    (dashboard)/          # 운영자 대시보드 (인증 필요)
    onboarding/[token]/   # 입주자 퍼블릭 페이지
    api/                  # API Routes
  components/
    ui/                   # shadcn/ui
    editor/               # 블록 에디터
    sessions/             # 세션 관련
    onboarding/           # 입주자 관련
  domain/
    entities/             # Profile, Session, Template, SessionProgress
    usecases/             # 비즈니스 로직
    repositories/         # Repository interface
  data/
    repositories/         # Repository 구현체
    datasources/          # Supabase client
  lib/
    supabase/             # Supabase 클라이언트 설정
    clerk/                # Clerk 설정
    utils/                # 유틸리티 (cn, format 등)
  types/                  # 공통 타입 정의
```

### Supabase 연동 패턴

- **Server Component**: Supabase 서버 클라이언트 (`@supabase/ssr`)
- **Client Component**: Supabase 브라우저 클라이언트
- **API Routes**: Supabase 서버 클라이언트
- **RLS**: 모든 테이블에 RLS 활성화, `auth.uid()` 기반 정책

### DB 스키마 위치할 레이어

- Supabase 대시보드에서 직접 실행 (마이그레이션 SQL)
- TypeScript 타입은 `src/types/supabase.ts`에 생성
- Domain Entity는 `src/domain/entities/`에 매핑

## Agent 2 — 유사 기능 (재사용 가능 / 새로 만들 것)

### 새 프로젝트이므로 기존 코드 없음

**PRD에 정의된 스키마 그대로 생성:**

| 테이블 | 목적 | PK |
|--------|------|----|
| profiles | 운영자 프로필 (Clerk 연동) | UUID |
| templates | 온보딩 템플릿 (블록 JSON) | UUID |
| sessions | 온보딩 세션 (토큰, 상태) | UUID |
| session_progress | 입주자 진행 상태 | UUID |

**재사용 검토 항목:**
- Supabase에서 제공하는 `auth.users` 테이블 → Clerk을 사용하므로 Supabase Auth 미사용
- `profiles.clerk_user_id`로 Clerk ↔ Supabase 연동
- `content` JSONB 컬럼 → `Block[]` 타입 배열 저장

## Agent 3 — 의존성 (필요한 것 / 충돌 위험)

### 확정된 패키지 버전 (2026-04-02 기준)

| 패키지 | 버전 | 용도 |
|--------|------|------|
| next | 16.2.2 | 프레임워크 |
| react | 19.2.4 | UI |
| @clerk/nextjs | 7.0.8 | 인증 |
| @supabase/supabase-js | 2.101.1 | DB 클라이언트 |
| @supabase/ssr | 0.10.0 | SSR 환경 지원 |
| tailwindcss | 4.2.2 | 스타일링 |
| typescript | 6.0.2 | 타입 안전성 |
| nanoid | 5.1.7 | 토큰 생성 |
| signature_pad | 5.1.3 | 캔버스 서명 |

### 추가 필요 의존성

- `shadcn/ui`: 컴포넌트 라이브러리 (npx shadcn init)
- `zod`: 스키마 검증
- `lucide-react`: 아이콘
- `class-variance-authority`, `clsx`, `tailwind-merge`: shadcn/ui 필수

### 충돌 위험

- **Clerk 7.x + Next.js 16**: Clerk 7은 Next.js 16 호환 (확인 필요, 빌드 테스트로 검증)
- **Tailwind CSS v4**: v3와 설정 방식이 다름 (`tailwind.config.ts` 대신 CSS 기반 설정)
- **React 19**: 일부 서드파티 라이브러리 호환성 주의

### 환경 변수

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Agent 4 — 테스트 (위치 / 범위)

### 테스트 프레임워크: Vitest

- Next.js 16 + Vite 기반으로 Vitest가 최적
- `@testing-library/react`로 컴포넌트 테스트
- Phase 1에서는 테스트 인프라만 구축, 본격 테스트는 Feature 2부터

### MVP 테스트 범위 (최소)

| 테스트 대상 | 도구 | 우선순위 |
|-------------|------|----------|
| RLS 정책 검증 | 수동 (Supabase Dashboard) | 상 |
| Entity 타입 검증 | Vitest + Zod | 중 |
| Supabase 클라이언트 연결 | Vitest | 중 |
| API 라우트 기본 응답 | Vitest | 하 |

### 테스트 파일 위치

- `src/domain/entities/__tests__/` — Entity 단위 테스트
- `src/data/repositories/__tests__/` — Repository 통합 테스트

## 결론 및 추천 방향

### 선행 작업: 프로젝트 스캐폴딩

1. `create-next-app`으로 Next.js 16 프로젝트 생성
2. shadcn/ui 초기화
3. Clean Architecture 디렉토리 구조 생성
4. 환경 변수 `.env.example` 설정

### DB 스키마 구현

1. PRD의 SQL 그대로 Supabase 대시보드에서 실행
2. `supabase gen types typescript`으로 TypeScript 타입 자동 생성
3. Domain Entity ↔ Supabase 타입 매핑
4. RLS 정책 적용 및 수동 검증

### 주의사항

- **Tailwind v4** 설정 방식이 v3와 다름 → shadcn/ui 최신 설정 가이드 준수
- **Clerk 7.x** API가 5.x와 다를 수 있음 → 공식 문서 확인 필요
- **Supabase RLS**: Clerk auth와 Supabase auth가 다름 → `auth.uid()` 대신 API 레이어에서 owner_id 검증 필요
