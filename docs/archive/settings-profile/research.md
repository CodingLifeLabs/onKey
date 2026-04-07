# 기능: 설정 — 프로필 관리

## 목표

설정 페이지(`/settings`)에 프로필 수정 기능을 추가한다. 운영자 이름(fullName) 수정 + 결제 관리 링크.

## Agent 1 — 아키텍처 (위치할 레이어 / 기존 패턴)

### 위치
- Presentation: `src/app/(dashboard)/settings/page.tsx` (기존 플레이스홀더 교체)
- Presentation: `src/app/(dashboard)/settings/profile-content.tsx` (클라이언트 컴포넌트)
- Server Action: `src/app/actions/update-profile.ts`
- Domain: `src/domain/repositories/profile.repository.ts` (updateProfile 메서드 추가)
- Data: `src/data/repositories/profile.repository.impl.ts` (updateProfile 구현)

### 기존 패턴
- Billing 페이지: 서버 컴포넌트(page.tsx) + 클라이언트 컴포넌트(billing-content.tsx) 분리
- Server Action: `getOwnerProfile()` → 검증 → DB 업데이트
- 폼: react-hook-form + zod + @hookform/resolvers

### Profile 엔티티 필드
```typescript
id, clerkUserId, email, fullName, plan, polarCustomerId,
polarSubscriptionId, subscriptionStatus, sessionCountThisMonth, sessionResetAt, createdAt
```

### DB 스키마 (profiles)
```sql
full_name TEXT  -- nullable, 수정 대상
email TEXT      -- Clerk 관리, 읽기 전용
```

## Agent 2 — 유사 기능 (재사용 가능 / 새로 만들 것)

### 재사용
- `DashboardHeader` — 페이지 헤더
- `Card/CardContent/CardHeader/CardTitle` — 섹션 카드
- `Input/Label/Button` — 폼 요소
- `getOwnerProfile()` — 인증된 사용자 프로필 조회
- react-hook-form + zod + zodResolver — 폼 검증
- `IProfileRepository` — 기존 인터페이스 (findByClerkUserId 등)

### 새로 만들 것
- `profile-content.tsx` — 프로필 수정 폼 클라이언트 컴포넌트
- `update-profile.ts` — 프로필 업데이트 Server Action
- `src/lib/validations/profile.ts` — 프로필 수정 zod 스키마
- `IProfileRepository.updateProfile()` — 메서드 추가

## Agent 3 — 의존성 (필요한 것 / 충돌 위험)

### 필요한 것 (모두 이미 설치됨)
- react-hook-form: ^7.72.0
- zod: ^4.3.6
- @hookform/resolvers: ^5.2.2
- @clerk/nextjs: ^7.0.8

### 충돌 위험
- 없음. 기존 패키지로 충분함.
- DB 마이그레이션 불필요 (fullName 컬럼 이미 존재)

## Agent 4 — 테스트 (위치 / 범위)

### 위치
- `src/app/actions/__tests__/update-profile.test.ts`
- `src/lib/validations/__tests__/profile.test.ts`

### 패턴
- Vitest + jsdom
- `vi.mock()`으로 Supabase, Clerk 모킹
- `safeParse()` 스키마 테스트

### 범위
- update-profile Server Action: 성공/실패/미인증 케이스
- profile 스키마: 유효/무효 입력

## 결론 및 추천 방향

- DB 변경 없이 기존 `full_name` 컬럼 활용
- 이메일은 Clerk 관리 → 읽기 전용 표시
- 설정 페이지를 프로필 카드 + 결제 관리 링크 구성으로 리팩토링
- Billing 페이지 링크는 Card 내부 버튼으로 제공
