# Feature 1: DB 스키마 + RLS 설정 — Implement

## 프로젝트 스캐폴딩

- [x] `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` 실행
- [x] `npx shadcn@latest init` 실행 (기본 설정)
- [x] 추가 패키지 설치: `@clerk/nextjs @supabase/supabase-js @supabase/ssr nanoid signature_pad zod`
- [x] Clean Architecture 디렉토리 생성 (`src/domain/`, `src/data/`, `src/types/`)
- [x] `.env.example` 파일 생성
- [x] `.gitignore` 확인 및 보완

## 타입 정의

- [x] `src/types/block.ts` 생성 — Block 타입 8종 (heading, text, image, video, divider, checklist, contact, signature)
- [x] `src/domain/entities/profile.entity.ts` 생성
- [x] `src/domain/entities/template.entity.ts` 생성
- [x] `src/domain/entities/session.entity.ts` 생성
- [x] `src/domain/entities/session-progress.entity.ts` 생성

## Repository Interface

- [x] `src/domain/repositories/profile.repository.ts` 생성
- [x] `src/domain/repositories/template.repository.ts` 생성
- [x] `src/domain/repositories/session.repository.ts` 생성

## Supabase 설정

- [x] `src/lib/supabase/server.ts` 생성 — 서버 컴포넌트용 클라이언트
- [x] `src/lib/supabase/client.ts` 생성 — 브라우저용 클라이언트
- [ ] `src/lib/supabase/middleware.ts` 생성 — Supabase 세션 갱신 미들웨어 (Clerk 사용으로 불필요, 스킵)

## Clerk 설정

- [x] `src/middleware.ts` 생성 — Clerk 인증 미들웨어
- [x] `src/app/layout.tsx` 수정 — ClerkProvider 래핑

## Repository 구현체

- [x] `src/data/repositories/profile.repository.impl.ts` 생성
- [x] `src/data/repositories/template.repository.impl.ts` 생성
- [x] `src/data/repositories/session.repository.impl.ts` 생성
- [x] `src/data/datasources/supabase.datasource.ts` 생성 — 공통 DataSource (row→entity 매핑)

## Supabase 마이그레이션 SQL

- [x] `supabase/migrations/001_init.sql` 생성
  - [x] profiles 테이블 + RLS
  - [x] templates 테이블 + RLS
  - [x] sessions 테이블 + RLS
  - [x] session_progress 테이블 + RLS
  - [x] 인덱스 생성
  - [x] 시스템 기본 템플릿 2종 INSERT

## 테스트 인프라

- [x] `vitest.config.ts` 생성
- [x] `src/test/setup.ts` 생성
- [x] `src/domain/entities/__tests__/block.test.ts` 생성 — Block 타입 검증 (5 tests passed)

## Fix Log

- Clerk 7.0.8에 `@clerk/nextjs/localizations` 모듈 없음 → localization import 제거
