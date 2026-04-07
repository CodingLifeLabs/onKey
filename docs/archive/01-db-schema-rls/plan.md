# Feature 1: DB 스키마 + RLS 설정 — Plan

## 선행: 프로젝트 스캐폴딩

- [x] Next.js 16 프로젝트 생성 (create-next-app, App Router, TypeScript, Tailwind)
- [x] shadcn/ui 초기화
- [x] Clean Architecture 디렉토리 구조 생성
- [x] 환경 변수 .env.example 설정
- [x] Clerk + Supabase 패키지 설치

## Domain: Entity / UseCase / Repository Interface

- [ ] Profile Entity 타입 정의 (`src/domain/entities/profile.entity.ts`)
- [ ] Template Entity 타입 정의 (`src/domain/entities/template.entity.ts`)
- [ ] Session Entity 타입 정의 (`src/domain/entities/session.entity.ts`)
- [ ] SessionProgress Entity 타입 정의 (`src/domain/entities/session-progress.entity.ts`)
- [ ] Block 타입 정의 (`src/types/block.ts`) — 블록 스키마 8종
- [ ] ProfileRepository interface 정의
- [ ] TemplateRepository interface 정의
- [ ] SessionRepository interface 정의

## Data: Repository 구현 / DataSource 연결

- [ ] Supabase 서버 클라이언트 생성 (`src/lib/supabase/server.ts`)
- [ ] Supabase 브라우저 클라이언트 생성 (`src/lib/supabase/client.ts`)
- [ ] ProfileRepository 구현체
- [ ] TemplateRepository 구현체
- [ ] SessionRepository 구현체

## Presentation: ViewModel 상태 / View 바인딩

- [ ] Clerk 미들웨어 설정 (`middleware.ts`) — 대시보드 라우트 보호
- [ ] Supabase 타입 생성 스크립트 (`src/types/supabase.ts`)

## DB: Supabase 스키마 + RLS

- [ ] 마이그레이션 SQL 파일 작성 (`supabase/migrations/001_init.sql`)
  - profiles 테이블
  - templates 테이블
  - sessions 테이블
  - session_progress 테이블
  - RLS 활성화 + 정책
  - 인덱스 생성
- [ ] 시스템 기본 템플릿 2종 INSERT SQL

## Test: 각 레이어 테스트

- [ ] Vitest 설정 (`vitest.config.ts`)
- [ ] Entity 타입 검증 테스트
- [ ] Supabase 클라이언트 연결 테스트 기본 설정
