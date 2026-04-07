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
  app/              ← Next.js App Router (Pages)
  components/       ← UI 컴포넌트 (shadcn/ui + 커스텀)
  domain/
    entities/       ← Profile, Template, Session, SessionProgress
    usecases/
    repositories/   ← interface (IProfileRepository, ITemplateRepository, ISessionRepository)
  data/
    repositories/   ← 구현체 (ProfileRepository, TemplateRepository, SessionRepository)
    datasources/    ← Supabase row→entity 매핑 유틸리티
  lib/
    supabase/       ← server/client/service Supabase 클라이언트
    clerk/          ← Clerk 유틸리티 (getCurrentUserId, requireUserId)
  types/            ← Block 타입 8종 공통 정의
```

### 확정된 패키지 버전 (2026-04-02)

| 패키지 | 버전 |
|--------|------|
| next | 16.2.2 |
| react | 19.2.4 |
| @clerk/nextjs | 7.0.8 |
| @supabase/supabase-js | 2.101.1 |
| @supabase/ssr | 0.10.0 |
| tailwindcss | 4.2.2 (v4) |
| nanoid | 5.1.7 |
| signature_pad | 5.1.3 |
| @tiptap/react | ^2.x |
| @tiptap/starter-kit | ^2.x |
| @tiptap/extension-link | ^2.x |
| zod | 4.3.6 |

## 데이터 모델

- **Profile**: 운영자 프로필 (Clerk userId 연동, 요금제, 세션 사용량)
- **Template**: 온보딩 템플릿 (블록 기반 JSON 콘텐츠)
- **Session**: 온보딩 세션 (토큰, 입주자 정보, 상태, 만료일)
- **SessionProgress**: 입주자 진행 상태 (열람 섹션, 체크 항목, 서명)

## MVP 기능 목록 (Phase 1)

| # | 기능 | 상태 |
|---|------|------|
| 1 | DB 스키마 + RLS | 완료 |
| 2 | Clerk 인증 연동 + 프로필 웹훅 | 완료 |
| 3 | 대시보드 레이아웃 + 세션 현황 | 완료 |
| 4 | 세션 생성 폼 (3단계 위저드) + 토큰 발급 | 완료 |
| 5 | 기본 콘텐츠 에디터 (heading/text/image/divider) | 완료 |
| 6 | 체크리스트 블록 | 완료 |
| 7 | 서명 블록 (캔버스 + Storage) | 완료 |
| 8 | 입주자 퍼블릭 페이지 /onboarding/[token] | 완료 |
| 9 | 세션 완료 처리 | 완료 |
| 10 | 시스템 기본 템플릿 2종 | 완료 |
| 11 | 템플릿 관리 메뉴 (조회/생성/복제/삭제) | 완료 |
| 12 | 전체 UI 리디자인 (Urban Nest 테마) | 완료 |
| 13 | QR 코드 생성 (qrcode.react) | 완료 |
| 14 | PDF 완료 확인서 (@react-pdf/renderer) | 완료 |

## Phase 2 진행 (v1.1)

| # | 기능 | 상태 |
|---|------|------|
| 15 | Polar 결제 연동 + 요금제 한도 | 완료 |
| 16 | 설정 — 프로필 관리 | 완료 |
| 17 | 세션 관리 목록 개선 | 완료 |
| 18 | 템플릿 에디터 개선 (동영상, 비상연락처, 복제, 이탈방지) | 완료 |
| 19 | Feature Gating 재설계 + 문서 가져오기 | 완료 |
| 20 | 코드 품질 개선 (디버그 제거, debounce, race condition 수정) | 완료 |
| 21 | UX 개선 (로딩 스켈레톤, 만료 알림, 이미지 lazy load) | 완료 |
| 22 | 신규 기능 (진행률 바, 만료 자동처리, 대량 삭제, 필수 블록 검증) | 완료 |
| - | PDF 완료 확인서 (Pro+) | 완료 (Phase 1) |
| - | QR 코드 생성 | 완료 (Phase 1) |
| - | 이메일 알림 (Resend) | 예정 |

## 요금제 기능 분리 (가치 기반 전략)

| 항목 | Starter (무료) | Pro (₩29,900) | Enterprise (₩59,990) |
|------|---------------|---------------|---------------------|
| 세션/월 | 5 | 20 | 무제한 |
| 세션 에디터 | 전체 기능 | 전체 기능 | 전체 기능 |
| 시스템 템플릿 | O | O | O |
| 커스텀 템플릿 | X | O | O |
| 문서 가져오기 | X | O | O |
| 이메일 발송 | X | O | O |
| PDF 인증서 | X | O | O |
| 커스텀 브랜딩 | X | X | O |

## 결정사항

- PRD를 SOURCE OF TRUTH로 사용 (2026-04-02)
- Phase 1 에디터는 드래그앤드롭 없이 ▲▼ 버튼으로 순서 변경
- 서명은 signature_pad 라이브러리 사용
- 입주자 페이지는 모바일 퍼스트, LCP < 2.5s 목표
- Clerk 7.0.8에 localizations 모듈 없음 → 한국어 UI는 커스텀 처리 필요
- Tailwind v4 사용 → v3와 설정 방식 상이 (CSS 기반)
- 시스템 템플릿 owner_id를 NULL로 변경 (더미 UUID 대신)
- RLS 정책: service_role로 우회 + 애플리케이션 레이어에서 owner_id 검증 (Clerk auth 사용으로 auth.jwt() 불가)
- Clerk 웹훅: user.created → profiles INSERT, user.deleted → profiles DELETE
- 웹훅 라우트에서 req.headers 직접 사용 (next/headers는 테스트 환경에서 동작 안 함)
- 인증 페이지: (auth) 라우트 그룹 + [[...sign-in]] catch-all 패턴
- shadcn/ui v4 Button에 `asChild` 없음 → Link로 Button 감싸는 패턴 사용
- Clerk UserButton v7에 `afterSignOutUrl` prop 없음
- SidebarMenuButton에 `asChild` 없음 → Link를 children으로 직접 전달
- 대시보드 (dashboard) 라우트 그룹: SidebarProvider + AppSidebar + SidebarInset 구조
- 세션 생성: Server Action 패턴 (createSessionAction) + nanoid(21) 토큰
- 위저드 폼: react-hook-form + zod 검증 + client component 상태 관리
- 템플릿 스냅샷: 세션 생성 시 template.content를 content_snapshot에 복사
- 에디터: TipTap 기반 텍스트 블록, 수동 저장 방식, 편집/미리보기 토글
- 체크리스트 블록: 독립 폼 UI (TipTap 미사용), 항목 CRUD + 제목 입력, required=true 고정
- 서명 블록 에디터: 설정 폼 (title/description/collect_name/collect_canvas), signature_pad 캔버스는 기능 #8에서 구현
- 에디터 라우트: /templates/[templateId]/edit (Next.js 16 params Promise)
- Supabase Storage: `templates` 버킷 (이미지 블록, 공개 읽기 + 인증 업로드)
- 퍼블릭 페이지: /onboarding/[token] — 인증 없이 접근, service_role로 데이터 조회, 모바일 퍼스트
- 서명 업로드: `signatures` 버킷 (public 읽기 + service_role 업로드), signature_pad 캔버스
- 세션 진행: SessionProgress 기반 (viewedSections, checkedItems, signatureName, signatureImageUrl, submittedAt)
- Feature Gating 전략: Starter 에디터 제한 없음 → Pro는 시간 절감 기능(문서 가져오기, 이메일)으로 전환 유도 (2026-04-07)
- 세션 만료: Repository 조회 시 만료일 지난 pending/in_progress 자동 expired 전환 (2026-04-07)
- 로딩 스켈레톤: home, sessions, analytics에 Next.js loading.tsx 적용 (2026-04-07)
