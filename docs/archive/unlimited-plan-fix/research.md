# Research: Unlimited 요금제 기능 수정

## 목표

Unlimited(Enterprise) 요금제 구독 시 모든 유료 기능이 정상 동작하도록 수정. 특히 템플릿 관리 메뉴에서 "새 템플릿" 버튼이 보이지 않는 문제 해결.

## Agent 1 — 아키텍처 (위치할 레이어 / 기존 패턴)

### 요금제 체계

| 내부 식별자 | 표시명 | 월 가격 | 세션 한도 |
|-------------|--------|---------|-----------|
| `starter` | Free | 무료 | 5 |
| `pro` | Pro | ₩29,900 | 20 |
| `enterprise` | Unlimited | ₩59,990 | 무제한 |

### Feature Gating 구현

- `src/domain/subscription/access.ts` — `hasFeature(plan, status, feature)` 서버 전용
- PRO_FEATURES: `pdf`, `customTemplate`, `documentImport`, `emailNotification`
- ENTERPRISE_FEATURES: `customBranding`
- `hasFeature()`는 pro/enterprise 모두 허용 (line 35: `plan === 'pro' || plan === 'enterprise'`)

### 핵심 버그 발견

`templates/page.tsx` line 34:
```ts
setIsPro(plan === 'pro');  // ❌ enterprise 누락
```
반면 `sessions/[id]/page.tsx` line 24는 올바름:
```ts
const isPro = plan === 'pro' || plan === 'enterprise';  // ✅
```

## Agent 2 — 유사 기능 (재사용 가능 / 새로 만들 것)

### 기존 패턴 비교

| 파일 | 조건 | 올바름? |
|------|------|---------|
| `templates/page.tsx:34` | `plan === 'pro'` | ❌ |
| `sessions/[id]/page.tsx:24` | `plan === 'pro' \|\| plan === 'enterprise'` | ✅ |
| `settings/billing/billing-content.tsx:75` | `plan === 'pro' \|\| plan === 'enterprise'` | ✅ |
| `components/plan-badge.tsx:15` | `plan === 'pro' \|\| plan === 'enterprise'` | ✅ |

### 재사용 가능

- `hasFeature()` 함수가 이미 올바르게 pro+enterprise 모두 허용하지만, 템플릿 페이지는 이를 사용하지 않고 하드코딩

### 새로 만들 것

- 없음. 기존 `isPro` 상태값 조건만 수정하면 됨

## Agent 3 — 의존성 (필요한 것 / 충돌 위험)

### 영향 범위

버그 수정 범위가 `templates/page.tsx` 1개 파일, 1줄로 제한됨:

- `isPro` 상태 → "새 템플릿" 버튼 표시 (line 78)
- `isPro` → `TemplateCard` edit/duplicate 권한 (lines 101, 130)

### 의존성 변경 불필요

- 서버 액션 `create-template.ts`, `duplicate-template.ts`는 이미 starter만 차단 (pro/enterprise 모두 허용)
- `hasFeature()`도 이미 올바름
- 추가 패키지 설치 없음

## Agent 4 — 테스트 (위치 / 범위)

### 기존 테스트

- 템플릿 CRUD 테스트 10개 존재 (`src/app/actions/__tests__/`)
- Feature gating (`hasFeature`) 테스트 **없음**
- Subscription/plan 로직 테스트 **없음**

### 이번 수정에 필요한 테스트

- 없음 (1줄 조건 수정이며, 기존 템플릿 테스트가 서버 액션 커버)

### 장기적 권장

- `hasFeature()` 단위 테스트 추가
- plan별 기능 접근 통합 테스트

## 결론 및 추천 방향

**원인**: `templates/page.tsx`에서 `plan === 'pro'` 하드코딩으로 enterprise 플랜 사용자의 템플릿 생성/편집/복제가 차단됨.

**수정 범위**: 1개 파일, 1줄 수정

```ts
// Before
setIsPro(plan === 'pro');

// After
setIsPro(plan === 'pro' || plan === 'enterprise');
```

**영향**: 이 수정으로 enterprise 사용자에게 "새 템플릿" 버튼 + 템플릿 편집/복제 메뉴가 정상 노출됨.
