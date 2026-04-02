# Feature 1: DB 스키마 + RLS 설정 — Implement

## 프로젝트 스캐폴딩

- [ ] `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` 실행
- [ ] `npx shadcn@latest init` 실행 (기본 설정)
- [ ] 추가 패키지 설치: `@clerk/nextjs @supabase/supabase-js @supabase/ssr nanoid signature_pad zod`
- [ ] Clean Architecture 디렉토리 생성 (`src/domain/`, `src/data/`, `src/types/`)
- [ ] `.env.example` 파일 생성
- [ ] `.gitignore` 확인 및 보완

## 타입 정의

- [ ] `src/types/block.ts` 생성 — Block 타입 8종 (heading, text, image, video, divider, checklist, contact, signature)
- [ ] `src/domain/entities/profile.entity.ts` 생성
- [ ] `src/domain/entities/template.entity.ts` 생성
- [ ] `src/domain/entities/session.entity.ts` 생성
- [ ] `src/domain/entities/session-progress.entity.ts` 생성

## Repository Interface

- [ ] `src/domain/repositories/profile.repository.ts` 생성
- [ ] `src/domain/repositories/template.repository.ts` 생성
- [ ] `src/domain/repositories/session.repository.ts` 생성

## Supabase 설정

- [ ] `src/lib/supabase/server.ts` 생성 — 서버 컴포넌트용 클라이언트
- [ ] `src/lib/supabase/client.ts` 생성 — 브라우저용 클라이언트
- [ ] `src/lib/supabase/middleware.ts` 생성 — Supabase 세션 갱신 미들웨어

## Clerk 설정

- [ ] `src/middleware.ts` 생성 — Clerk 인증 미들웨어
- [ ] `src/app/layout.tsx` 수정 — ClerkProvider 래핑

## Repository 구현체

- [ ] `src/data/repositories/profile.repository.impl.ts` 생성
- [ ] `src/data/repositories/template.repository.impl.ts` 생성
- [ ] `src/data/repositories/session.repository.impl.ts` 생성
- [ ] `src/data/datasources/supabase.datasource.ts` 생성 — 공통 DataSource

## Supabase 마이그레이션 SQL

- [ ] `supabase/migrations/001_init.sql` 생성
  - [ ] profiles 테이블 + RLS
  - [ ] templates 테이블 + RLS
  - [ ] sessions 테이블 + RLS
  - [ ] session_progress 테이블 + RLS
  - [ ] 인덱스 생성
  - [ ] 시스템 기본 템플릿 2종 INSERT

## 테스트 인프라

- [ ] `vitest.config.ts` 생성
- [ ] `src/test/setup.ts` 생성
- [ ] `src/domain/entities/__tests__/block.test.ts` 생성 — Block 타입 검증

## Fix Log

(구현 중 발생한 버그/수정 사항 기록)
