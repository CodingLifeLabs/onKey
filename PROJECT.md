# OnKey (온키) — 원룸/오피스텔 입주 온보딩 SaaS

## 개요

운영자가 입주 안내 세션을 한 번 설정하면, 고유 토큰 링크를 통해 입주자가 셀프 온보딩을 완료하는 SaaS 플랫폼. 입주자는 앱 설치 없이 링크 하나로 모든 입주 절차를 확인하고, 운영자는 대시보드에서 완료 현황을 실시간 관리한다.

## 타겟 사용자

- **Primary:** 원룸/오피스텔 운영자 (임대인, 30~60대, 1~10채)
- **Secondary:** 입주자 (20~40대, 모바일 브라우저만 사용)

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Auth | Clerk (소셜 로그인 + 이메일) |
| Database | Supabase (PostgreSQL + RLS) |
| Storage | Supabase Storage (서명 이미지, 첨부파일) |
| 결제 | Polar (v1.1) |
| 이메일 | Resend (v1.1) |
| 배포 | Vercel |

## 아키텍처

```
Presentation → Domain ← Data
(View+ViewModel)  (UseCase+Entity)  (Repository+DataSource)

src/
  presentation/
    views/
    viewmodels/     ← React hooks / 상태 관리
  domain/
    entities/
    usecases/
    repositories/   ← interface
  data/
    repositories/   ← 구현체
    datasources/    ← Supabase client
```

## 데이터 모델

- **Profile**: 운영자 프로필 (Clerk userId 연동, 요금제, 세션 사용량)
- **Template**: 온보딩 템플릿 (블록 기반 JSON 콘텐츠)
- **Session**: 온보딩 세션 (토큰, 입주자 정보, 상태, 만료일)
- **SessionProgress**: 입주자 진행 상태 (열람 섹션, 체크 항목, 서명)

## MVP 기능 목록 (Phase 1)

| # | 기능 | 상태 |
|---|------|------|
| 1 | DB 스키마 + RLS | 대기 |
| 2 | Clerk 인증 연동 + 프로필 웹훅 | 대기 |
| 3 | 대시보드 레이아웃 + 세션 현황 | 대기 |
| 4 | 세션 생성 폼 (3단계 위저드) + 토큰 발급 | 대기 |
| 5 | 기본 콘텐츠 에디터 (heading/text/image/divider) | 대기 |
| 6 | 체크리스트 블록 | 대기 |
| 7 | 서명 블록 (캔버스 + Storage) | 대기 |
| 8 | 입주자 퍼블릭 페이지 /onboarding/[token] | 대기 |
| 9 | 세션 완료 처리 | 대기 |
| 10 | 시스템 기본 템플릿 2종 | 대기 |

## Phase 2 계획 (v1.1)

- Polar 결제 연동 + 요금제 한도
- PDF 완료 확인서 (Pro+)
- 이메일 알림 (Resend)
- QR 코드 생성

## 결정사항

- PRD를 SOURCE OF TRUTH로 사용 (2026-04-02)
- Phase 1 에디터는 드래그앤드롭 없이 ▲▼ 버튼으로 순서 변경
- 서명은 signature_pad 라이브러리 사용
- 입주자 페이지는 모바일 퍼스트, LCP < 2.5s 목표
