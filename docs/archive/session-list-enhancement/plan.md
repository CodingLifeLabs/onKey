# 세션 관리 목록 개선 — Plan

## 레이어별 설계

### Domain

- [ ] `src/domain/repositories/session.repository.ts` — `findByOwnerIdFiltered()` 메서드 추가
  ```
  findByOwnerIdFiltered(ownerId: string, options?: {
    status?: SessionStatus;
    search?: string;
    sortBy?: 'created_at' | 'expires_at' | 'tenant_name';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ sessions: Session[]; counts: Record<SessionStatus, number> }>
  ```

### Data

- [ ] `src/data/repositories/session.repository.impl.ts` — `findByOwnerIdFiltered()` 구현
  - status → `.eq('status', status)`
  - search → `.or('tenant_name.ilike.%search%,room_number.ilike.%search%')`
  - sortBy → `.order(sortBy, { ascending })`
  - counts → 별도 쿼리로 status별 카운트 (또는 동일 쿼리 후 집계)

### Presentation — 세션 목록 클라이언트

- [ ] `src/components/sessions/session-list-client.tsx` — 검색/필터/정렬 + 카드 그리드
  - 상태 탭: 전체(전체 수) | 대기 중(n) | 진행 중(n) | 완료(n) | 만료(n)
  - 검색 Input (입주자명/호실, debounce 없이 URL 즉시 반영)
  - 정렬 Select: 최근 생성순 | 만료일순 | 이름순
  - 카드 그리드 (기존 SessionCard 재사용)
  - URL searchParams 동기화 (상태, 검색어, 정렬)
  - 검색 결과 없음 EmptyState

### Presentation — 세션 페이지

- [ ] `src/app/(dashboard)/sessions/page.tsx` — 서버 컴포넌트 리팩토링
  - searchParams 읽기 (status, search, sort)
  - `findByOwnerIdFiltered()` 호출
  - SessionListClient에 데이터 전달

### 타입체크

- [ ] `npx tsc --noEmit` 통과

---

## 처리하지 않는 것

- 페이지네이션 (플랜별 한도 내 세션 수로 당분간 불필요)
- 날짜 범위 필터
- 벌크 액션 (선택/삭제)
- 세션 상태 수동 변경
- 무한 스크롤
