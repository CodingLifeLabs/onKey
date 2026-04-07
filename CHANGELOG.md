# Changelog

## 2026-04-08 — Polar 구독 결제 플로우 수정
- DB: profiles에 `current_period_end`, `cancel_at_period_end` 컬럼 추가 (마이그레이션 007)
- Clerk 웹훅에 `user.updated` 핸들러 추가 (이메일/이름 변경 시 DB 동기화)
- Polar checkout에 `externalCustomerId`, `customerEmail` 전달 (fake email 필터링)
- 이미 active 구독 중이면 checkout 대신 Polar Portal로 리다이렉트
- Polar 웹훅 findProfile에 metadata(clerkUserId) 기반 3차 fallback 조회 추가
- Polar 웹훅에서 `current_period_end`, `cancel_at_period_end` 저장
- Billing UI에 취소 시 잔여 기간 일수 표시
- Billing UI에 active 구독 중 "플랜 변경" 버튼 (Polar Portal 유도)

## 2026-04-07 — Feature 22: 신규 기능 (진행률 바, 만료 자동처리, 대량 삭제, 필수 블록 검증)
- 입주자 페이지 진행률 프로그레스 바 추가 (열람/체크/서명 단계 시각화)
- 세션 만료 자동 처리: Repository 조회 시 만료일 지난 세션 expired 자동 전환
- 세션 목록 대량 삭제: 선택 모드 + 전체선택 + 일괄삭제 (최대 50개)
- 템플릿/세션 저장 시 서명·체크리스트 블록 없으면 경고 다이얼로그

## 2026-04-07 — Feature 21: UX 개선
- 대시보드/세션/분석 페이지에 loading.tsx 스켈레톤 추가
- 세션 카드에 만료 임박(D-3/임박/만료됨) 경고 뱃지 표시
- 이미지 뷰어 lazy loading + 에러 상태 UI 추가
- 서명 캔버스 반응형 높이 적용 (200→240→280px)

## 2026-04-07 — Feature 20: 코드 품질 개선
- complete-session.ts console.log 및 serverValidation 디버그 파라미터 제거
- IntersectionObserver 2초 debounce 적용 + ref 기반 stale closure 방지
- 세션 생성 race condition 수정 (DB 재조회 + RPC increment_session_count)
- update-progress.ts 세션 상태 검증 추가 (존재 + 미완료 확인)

## 2026-04-07 — Feature 19: Feature Gating 재설계 + 문서 가져오기
- hasFeature() feature 키 확장 (documentImport, emailNotification, customBranding)
- 결제 페이지 요금제 비교 카드 업데이트
- 텍스트/마크다운 → Block[] 변환 파서 (src/lib/import-content.ts)
- ImportContentDialog 컴포넌트 (가져오기 + 변환 미리보기)
- 템플릿 에디터 + 세션 에디터에 가져오기 버튼 추가
- 요금제 전략: "제한 기반" → "가치 기반" 전환 (Starter 에디터 전체 개방)

## 2026-04-07 — Feature 18: 템플릿 에디터 개선
- 비상연락처(Contact) 및 동영상(Video) 블록 타입 추가
- `src/lib/block-utils.ts` 블록 복제 유틸리티 및 기본 콘텐츠 생성 로직 추가
- 템플릿 에디터에 블록 사이 삽입(+) 버튼 및 복제 컨트롤 추가
- Editor 페이지 이탈 방지 처리 및 저장 성공 시 Sonner Toast 피드백 연동
- ContactEditor, VideoEditor, ContactViewer, VideoViewer 컴포넌트 구현

## 2026-04-07 — Feature 17: 세션 관리 목록 개선
- 상태 탭 필터: 전체/대기 중/진행 중/완료/만료 (상태별 카운트 표시)
- 검색: 입주자명 + 호실번호 통합 검색 (Supabase ilike)
- 정렬: 최근 생성순/오래된 순/만료 임박순/만료 여유순/이름순
- 페이지네이션: 페이지당 12개, 페이지 번호 네비게이션
- URL searchParams 기반 (공유/뒤로가기 지원)
- ISessionRepository.findByOwnerIdFiltered() 메서드 + 구현 추가
- SessionListClient 클라이언트 컴포넌트 신규 생성

## 2026-04-07 — Feature 16: 설정 — 프로필 관리 + Polar 결제 연동
- 설정 페이지(/settings) 플레이스홀더 → 프로필 수정 + 요금제 카드 구현
- 프로필 수정 폼: 이름 편집 (react-hook-form + zod), 이메일 읽기 전용
- 결제 관리 카드: 현재 플랜 배지 + 결제 관리 버튼
- IProfileRepository.updateProfile() 메서드 + 구현체 추가
- updateProfileSchema (zod) + update-profile Server Action 생성
- Polar 결제 연동: Checkout/CustomerPortal/Webhooks (@polar-sh/nextjs) 라우트 설정
- 웹훅 핸들러: subscription.created/updated/active/canceled/revoked/uncanceled + order.created
- 결제 페이지: 동적 플랜 카드 + UsageMeter + 구독 상태 경고
- 웹훅 snake_case → camelCase 프로퍼티명 수정
- billing-content.tsx: Link → a 태그 변경 (API 라우트 RSC prefetch 방지)

## 2026-04-05 — Feature 15: PDF 완료 확인서
- @react-pdf/renderer 설치
- CompletionCertificate PDF 템플릿 생성 (A4, 한국어 폰트)
- PdfDownloadButton 컴포넌트 (클라이언트 사이드 PDF 생성 + 다운로드)
- 세션 상세 페이지 완료 정보 카드에 PDF 다운로드 버튼 추가
- PDF 내용: 입주자 정보, 완료 일시, 체크리스트 결과, 서명 이미지

## 2026-04-04 — Feature 13: QR 코드 생성
- qrcode.react 설치 (SVG 기반, 4.5kB)
- QrCodeDialog 컴포넌트 생성 (QR 표시 + PNG 다운로드)
- QrCodeButton 컴포넌트 생성 (다이얼로그 트리거)
- 세션 상세 페이지 입주자 링크 카드에 QR 버튼 추가
- 세션 생성 위저드 링크 공유 스텝에 QR 버튼 추가
- 랜딩 페이지(/) 추가 + 대시보드를 /home으로 이동
- 분석/결제/설정 플레이스홀더 페이지 추가

## 2026-04-04 — Feature 12: 전체 UI 리디자인
- 디자인 컨셉 "Urban Nest" 적용 (Warm Terracotta + Deep Teal + Warm White)
- globals.css CSS 변수 전면 교체 (OKLCH 색상)
- Pretendard 한국어 폰트 적용
- 사이드바 브랜드 로고 + 활성 메뉴 스타일 개선
- 메트릭 카드 컬러 아이콘 + 세션 리스트 디바이더
- 세션 카드 호버 애니메이션 + 전체 링크
- 상태 배지 상태별 커스텀 컬러
- 빈 상태 아이콘 뱃지 배경
- 템플릿 카드 호버 시 액션 노출
- 미들웨어: / 루트 경로를 비공개로 변경 (인증 필요)

## 2026-04-04 — Feature 11: 템플릿 관리 메뉴
- /templates 페이지 신규 생성 (기본 템플릿 + 내 템플릿 섹션 분리)
- Server Actions 4종 추가 (getAllTemplates, createTemplate, duplicateTemplate, deleteTemplate)
- TemplateCard 컴포넌트 (드롭다운 메뉴: 편집/복제/삭제)
- CreateTemplateDialog, DeleteTemplateDialog 모달
- 사이드바 "템플릿 관리" 메뉴 추가
- 테스트 10개 (4파일) 통과

## 2026-04-02 — Feature 9: 세션 완료 처리
- 대시보드 세션 상세 페이지 /sessions/[id] 신규 생성
- getSessionDetail Server Action (세션 + progress + 퍼블릭 링크)
- 세션 정보 카드 (입주자, 호실, 만료일, 상태)
- 진행 상태 프로그레스 바 (필수 항목 열람률)
- 완료 정보 카드 (서명 이미지, 체크리스트 결과, 제출 시각)
- Phase 1 MVP 기능 9/10 완료

## 2026-04-02 — Feature 8: 입주자 퍼블릭 페이지 /onboarding/[token]
- Supabase `signatures` 스토리지 버킷 마이그레이션 (004_storage_signatures.sql)
- Server Actions 4종: getSessionByToken, updateProgress, uploadSignatureImage, completeSession
- 퍼블릭 블록 뷰어 6종: heading/text/image/divider (읽기) + checklist/signature (인터랙티브)
- SignatureViewer: signature_pad 캔버스 + toDataURL → File → Storage 업로드
- BlockViewer 라우터 + OnboardingPage 클라이언트 컴포넌트 (진행률, 자동 저장)
- /onboarding/[token] 라우트 페이지 (Server Component + params Promise)
- 에러 상태 분기: 만료 / 완료 / 없음
- Clerk 인증 없이 service_role로 데이터 접근

## 2026-04-02 — Feature 7: 서명 블록
- signatureContentSchema Zod 검증 추가 (title/description 선택, collect_name/collect_canvas boolean)
- createBlock case 'signature' 추가 (required: true 고정, 기본값 설정)
- SignatureEditor 컴포넌트 신규: 제목/설명 Input + collect_name/collect_canvas 토글 + 미리보기
- BlockToolbar에 서명 옵션 추가 (PenLine 아이콘)
- BlockList switch case + 라벨 매핑 추가
- 추가 npm 설치 없음 (signature_pad는 기능 #8에서 사용)
- 테스트 5개 추가 → 전체 42개 통과

## 2026-04-02 — Feature 6: 체크리스트 블록
- checklistContentSchema Zod 검증 추가 (title 선택, items min 1)
- createBlock case 'checklist' 추가 (required: true 고정)
- ChecklistEditor 컴포넌트 신규: 제목 Input + 항목 CRUD + 미리보기 모드
- BlockToolbar에 체크리스트 옵션 추가 (CheckSquare 아이콘)
- BlockList switch case + 라벨 매핑 추가
- 추가 npm 설치 없음 (기존 의존성으로 해결)
- 테스트 5개 추가 → 전체 37개 통과

## 2026-04-02 — Feature 5: 기본 콘텐츠 에디터 (heading/text/image/divider)
- TipTap 패키지 설치 (@tiptap/react, starter-kit, extension-link, pm)
- Supabase Storage `templates` 버킷 마이그레이션 (003_storage_templates.sql)
- 블록 조작 유틸리티 (block-utils.ts): addBlock, removeBlock, moveBlockUp/Down, updateBlockContent
- 블록 content Zod 검증 스키마 (heading/text/image/divider)
- Server Actions 3종: getTemplate, updateTemplateContent, uploadTemplateImage
- 에디터 UI 8종: TemplateEditor, BlockToolbar, BlockList + Heading/Text/Image/DividerEditor
- 에디터 라우트: /templates/[templateId]/edit (params Promise 대응)
- 테스트 24개 추가 → 전체 32개 통과

## 2026-04-02 — Feature 4: 세션 생성 폼 (3단계 위저드) + 토큰 발급
- react-hook-form, @hookform/resolvers, shadcn label/textarea/select 설치
- Zod 검증 스키마 생성 (createSessionStep1Schema)
- Server Action: createSessionAction (getOwnerProfile + nanoid 토큰 + 템플릿 스냅샷)
- Server Action: getSystemTemplates (시스템 템플릿 조회)
- StepIndicator: 3단계 진행 표시기 컴포넌트
- StepBasicInfo: 기본 정보 폼 (호실, 입주자명, 날짜, 메모)
- StepTemplatePicker: 템플릿 선택 카드 그리드 (시스템 템플릿 + 빈 템플릿)
- StepLinkShare: 링크 공유 화면 (복사 + 만료일 + 미리보기)
- CreateWizard: 3단계 상태 관리 + 에러 처리 클라이언트 컴포넌트
- /sessions/new 페이지 생성
- TypeScript 통과 + 8개 테스트 통과

## 2026-04-02 — Feature 3: 대시보드 레이아웃 + 세션 현황
- shadcn/ui 컴포넌트 7종 설치 (sidebar, card, badge, dropdown-menu, avatar, separator, tooltip)
- getOwnerProfile 유틸리티 추가 (Clerk userId → Supabase ownerId 해결)
- 대시보드 레이아웃: (dashboard) 라우트 그룹 + SidebarProvider + AppSidebar
- AppSidebar: 네비게이션 5개 (대시보드, 세션, 분석, 결제, 설정) + Clerk UserButton
- DashboardHeader: SidebarTrigger + 타이틀 + 액션 버튼
- 대시보드 홈: 메트릭 카드 4종 (총 세션, 진행 중, 완료, 이번 달 사용량) + 최근 세션
- 세션 목록 페이지: 카드 그리드 레이아웃
- SessionCard: 상태 뱃지 + 날짜 정보 + 상세/편집 액션
- StatusBadge: pending(보조)/진행(기본)/완료(윤곽)/만료(파괴적) 변형
- EmptyState 3종: 세션 0개, 완료 0개, 한도 도달
- 루트 페이지: 인증 시 /sessions로 리다이렉트
- Fix: shadcn/ui v4 Button에 `asChild` 없음 → Link로 감싸는 패턴 사용
- Fix: Clerk UserButton v7에 `afterSignOutUrl` 없음

## 2026-04-02 — Feature 2: Clerk 인증 연동 + 프로필 웹훅
- svix 패키지 설치 (웹훅 서명 검증)
- Supabase service_role 클라이언트 생성 (src/lib/supabase/service.ts)
- Clerk 유틸리티 생성 (getCurrentUserId, requireUserId, getCurrentUserProfile)
- 인증 페이지 생성: sign-in, sign-up (catch-all 라우트) + Auth 레이아웃
- Clerk 웹훅 핸들러: user.created → profiles INSERT, user.deleted → profiles DELETE
- RLS 정책 수정: auth.jwt() 기반 → service_role 우회 + 애플리케이션 레이어 검증
- Repository 3종 service_role 전환
- 시스템 템플릿 owner_id를 NULL로 변경
- 테스트 3개 추가 (웹훅 핸들러) → 전체 8개 통과
- Fix: req.headers 직접 사용 (next/headers 테스트 환경 미지원)

## 2026-04-02 — Feature 1: DB 스키마 + RLS + 프로젝트 스캐폴딩
- Next.js 16.2.2 프로젝트 생성 (App Router, TypeScript, Tailwind v4)
- shadcn/ui 초기화 + 필수 패키지 설치 (Clerk, Supabase, nanoid, signature_pad, zod)
- Clean Architecture 디렉토리 구조 생성 (domain/data/lib/types)
- Block 타입 8종 정의 (heading, text, image, video, divider, checklist, contact, signature)
- Domain Entity 4종 생성 (Profile, Template, Session, SessionProgress)
- Repository Interface 3종 + 구현체 3종 생성
- Supabase 서버/클라이언트 설정
- Clerk 미들웨어 (대시보드 라우트 보호) + ClerkProvider 적용
- 마이그레이션 SQL: 4 테이블 + RLS 정책 + 인덱스 + 기본 템플릿 2종
- Vitest 테스트 인프라 구축 + Block 타입 검증 테스트 5개 통과
- Fix: Clerk 7.0.8 localizations 모듈 미지원 → import 제거

## 2026-04-02 — 프로젝트 초기화
- PROJECT.md 생성, PRD 기반 MVP 기능 10개 정의
- 기술 스택 확정: Next.js 16 + Clerk + Supabase + Polar + Vercel
