## 목표

기존 Feature Gating 전략을 전면 재검토한다. 현재 세션 생성 위저드에서 템플릿 선택 후 모든 콘텐츠를 자유롭게 편집할 수 있어, Pro 전용인 "커스텀 템플릿" 기능의 제한 가치가 미미하다. 구조적 편집(블록 추가/삭제/복제)을 Starter에서 차단하는 접근은 UX를 해친다. 대신 **긍정적 가치(시간 절약, 전문성)** 기반의 요금제 분리 전략을 수립하고, 세션 복제, 외부 데이터 가져오기 등 신규 Pro+ 기능을 제안한다.

## Agent 1 — 아키텍처 (기존 패턴 / 문제점)

### 기존 요금제 구조

| 항목 | Starter (무료) | Pro (₩29,900) | Enterprise (₩59,990) |
|------|---------------|---------------|---------------------|
| 세션/월 | 5 | 20 | 무제한 |
| 커스텀 템플릿 | X | O | O |
| PDF 인증서 | X | O | O |
| 분석 대시보드 | O | O | O |

### 기존 Feature Gating 위치

1. **`src/lib/polar.ts`**: `hasFeature(plan, 'pdf' | 'customTemplate' | 'analytics')` — 3개 feature만 정의
2. **`src/app/actions/create-template.ts`**: `if (profile.plan === 'starter') throw Error` — 서버 사이드 차단
3. **`src/app/actions/duplicate-template.ts`**: 동일 패턴
4. **`src/app/(dashboard)/templates/page.tsx`**: UI 버튼 숨김 처리
5. **`src/app/(dashboard)/sessions/[id]/page.tsx`**: PDF 다운로드 버튼 Pro 전용

### 핵심 문제

**세션 생성 흐름:** `sessions/new` → CreateWizard → StepTemplatePicker(템플릿 선택) → StepContentEditor(전체 편집)

- StepContentEditor가 BlockList + BlockToolbar를 그대로 사용
- 템플릿 선택 후 블록 추가/삭제/복제/내용편집 모두 자유로움
- 결과적으로 Starter 사용자도 "시스템 템플릿 선택 → 전부 내 입맛대로 수정" 가능
- **커스텀 템플릿 Pro 제한이 실질적 가치가 없음** — 매번 수정해도 되니까

### 이전 접근의 문제점 (plan.md)

Starter의 구조적 편집(블록 추가/삭제/복제)을 차단하려 했으나:

1. **UX 악화**: "기존 텍스트는 수정 가능한데 새 블록 추가는 안 됨?" — 혼란스러움
2. **제한 경계 모호**: 어디까지가 "내용 편집"이고 어디가 "구조 변경"인가?
3. **부정적 동기**: 기능을 뺏어서 업그레이드 강제 → 이탈 위험
4. **성공적 SaaS 패턴 위배**: Notion, Slack 등은 긍정적 가치로 업그레이드 유도

## Agent 2 — 유사 기능 (재사용 가능 / 새로 만들 것)

### 재사용 가능

- **`hasFeature()`**: 확장만 하면 됨 (feature 키 추가)
- **`BlockList` / `StepContentEditor`**: 변경 없음 — 전 요금제 완전 편집 허용
- **`duplicate-template.ts`**: 패턴 참고 → 세션 복제 action에 재사용
- **`create-session.ts`**: 배치 생성 로직 추가 시 참고

### 새로 만들 것

| 기능 | 설명 | Pro 가치 |
|------|------|---------|
| 세션 복제 | 기존 세션 복제 → 입주자 정보만 변경 | 동일 건물 다른 호수 적용 시간 90% 단축 |
| CSV 가져오기 | 입주자 리스트 CSV → 세션 일괄 생성 | 입주 시즌 10~20건 한 번에 처리 |
| 이메일 발송 | 세션 생성 시 입주자에게 링크 자동 발송 | 전화/카톡 수동 공유 불필요 |
| 커스텀 브랜딩 | 로고/색상 → 입주자 페이지 + PDF 반영 | 공실 정보 사이트 등 전문 이미지 |

## Agent 3 — 의존성 (필요한 것 / 충돌 위험)

### 신규 기능별 의존성

| 기능 | 필요 의존성 | 충돌 위험 |
|------|------------|----------|
| 세션 복제 | 기존 `create-session.ts` 로직 재사용 | 낮음 |
| CSV 가져오기 | `papaparse` 또는 유사 CSV 파서 | 낮음 |
| 이메일 발송 | Resend (PROJECT.md Phase 2에 이미 예정) | 낮음 |
| 커스텀 브랜딩 | Profile 엔티티에 branding 필드 추가, Storage에 로고 저장 | 중간 (프로필 스키마 변경) |

### 기존 코드 영향 범위

- `src/lib/polar.ts`: `hasFeature()` 시그니처 확장 (feature 키 추가)
- `src/components/sessions/step-content-editor.tsx`: **변경 없음** (전 요금제 전체 편집 유지)
- `src/components/editor/block-list.tsx`: **변경 없음**
- 결제 페이지 plan comparison 카드: 업데이트 필요

## Agent 4 — 테스트 (위치 / 범위)

- `src/lib/__tests__/`: `hasFeature()` 확장 테스트 추가
- 세션 복제: `src/app/actions/__tests__/duplicate-session.test.ts`
- CSV 가져오기: `src/app/actions/__tests__/import-sessions.test.ts`
- 이메일: `src/emails/` 템플릿 + `src/app/actions/__tests__/send-session-email.test.ts`
- E2E: Starter/Pro/Enterprise별 기능 접근성 수동 검증

## 결론 및 추천 방향

### 핵심 전략 전환

| | 기존 (제한 기반) | 제안 (가치 기반) |
|---|---|---|
| 철학 | Starter 기능 제한 → Pro 유도 | Starter 충분한 기능 → Pro로 시간 절약 |
| 세션 에디터 | Starter는 구조 편집 차단 | **전 요금제 전체 편집 허용** |
| Pro 가치 | "할 수 있는 것"이 늘어남 | "더 빨리/쉽게 할 수 있음" |
| 전환 동기 | 부정적 (기능 부족) | 긍정적 (시간/노력 절약) |

### 제안 요금제 구조

| 항목 | Starter (무료) | Pro (₩29,900) | Enterprise (₩59,990) |
|------|---------------|---------------|---------------------|
| 세션/월 | 5 | 20 | 무제한 |
| 세션 에디터 | **전체 기능** | **전체 기능** | **전체 기능** |
| 시스템 템플릿 | O | O | O |
| 커스텀 템플릿 | X | O | O |
| 세션 복제 | X | **O** | O |
| CSV 가져오기 | X | **O** | O |
| 이메일 발송 | X | **O** | O |
| PDF 인증서 | X | O | O |
| 커스텀 브랜딩 | X | X | **O** |
| 분석 대시보드 | 기본 | **고급** | 고급 |

### 우선 구현 순서 (Pro 전환율 기여도)

1. **세션 복제** — 구현 난이도 낮음, 다세대 운영자에게 핵심 페인포인트 해소
2. **CSV 가져오기** — 입주 시즌(2~3월) 대비 필수 기능
3. **이메일 발송** — Phase 2 예정 기능, Resend 연동
4. **커스텀 브랜딩** — Enterprise 차별화, 스키마 변경 필요
