# 기능: 세션 관리 목록 개선 (검색/필터/정렬)

## 목표

세션 수 증가에 대응하여 검색, 상태별 필터, 정렬 기능을 추가한다.

## Agent 1 — 아키텍처 (위치할 레이어 / 기존 패턴)

### 현재 구현
- `sessions/page.tsx` — 서버 컴포넌트, `findByOwnerId()`로 전체 조회 후 카드 그리드 렌더링
- `SessionCard` — 링크 카드 (상태 배지, 입주자명, 호실, 생성/만료/완료일)
- `ISessionRepository.findByOwnerId()` — `owner_id` 필터만, 정렬 `created_at DESC`

### 위치
- Presentation: `src/app/(dashboard)/sessions/page.tsx` (searchParams 읽기)
- Presentation: `src/components/sessions/session-list-client.tsx` (신규 — 클라이언트 필터/검색 UI)
- Domain: `src/domain/repositories/session.repository.ts` (메서드 추가)
- Data: `src/data/repositories/session.repository.impl.ts` (구현)

### Session 엔티티 필드
```typescript
id, ownerId, templateId, token, tenantName, roomNumber,
moveInDate, expiresAt, status, contentSnapshot, tenantIp,
createdAt, completedAt
```

### SessionStatus
```typescript
'pending' | 'in_progress' | 'completed' | 'expired'
```

### 접근 방식: 서버 필터링 (URL searchParams)
- Next.js 서버 컴포넌트에서 `searchParams` 읽기
- Repository에 필터 메서드 추가 → Supabase 쿼리에 조건 적용
- 상태 탭 + 검색어를 URL 파라미터로 관리 (공유 가능, 뒤로가기 동작)

## Agent 2 — 유사 기능 (재사용 가능 / 새로 만들 것)

### 재사용
- `SessionCard` — 카드 컴포넌트 그대로 사용
- `StatusBadge` — 상태 배지 그대로 사용
- `DashboardHeader` — 페이지 헤더 (action 슬롯 있음)
- `Input` — 검색 입력
- `Badge` — 상태 탭에 활용 가능
- `EmptyNoSessions` — 빈 상태

### 새로 만들 것
- `session-list-client.tsx` — 검색 + 상태 탭 + 정렬 + 카드 그리드 클라이언트 컴포넌트
- `ISessionRepository.findByOwnerIdFiltered()` — 필터/검색/정렬 지원 메서드

### 불필요
- 추가 npm 패키지 없음 (기존 Input, Badge, Button으로 충분)
- cmdk 등 외부 검색 라이브러리 불필요

## Agent 3 — 의존성 (필요한 것 / 충돌 위험)

### 필요한 것
- 없음. 모든 UI 컴포넌트 이미 설치됨.
- Supabase `.ilike()` (대소문자 구분 없는 검색) 이미 사용 가능

### 충돌 위험
- 없음

## Agent 4 — 테스트 (위치 / 범위)

### 위치
- `src/domain/repositories/__tests__/session.repository.test.ts` 또는 기존 테스트 파일
- 실제로는 Server Component + Supabase 쿼리이므로 수동 테스트 우선

### 범위
- Repository 필터 메서드 단위 테스트 (Supabase mock)
- 검색어 빈값 → 전체 조회
- 상태 필터 없음 → 전체 조회
- 정렬 기본값 → createdAt DESC

## 결론 및 추천 방향

### 구성
1. **상태 탭**: 전체 | 대기 중 | 진행 중 | 완료 | 만료 (Badge 스타일)
2. **검색**: 입주자명 + 호실번호 통합 검색 (Input)
3. **정렬**: 최근 생성순 (기본) / 만료일순 / 이름순 (Select 드롭다운)
4. **카운트**: 각 상태별 세션 수 표시

### 구현 방식
- 서버 컴포넌트에서 searchParams → Repository 필터 메서드 호출
- 클라이언트 컴포넌트에서 탭/검색/정렬 UI → URL searchParams 업데이트
- Supabase `.ilike()` + `.eq()` + `.order()` 조합
- 페이지 리로드 없이 `router.push()`로 URL 변경 → 서버 리렌더링
