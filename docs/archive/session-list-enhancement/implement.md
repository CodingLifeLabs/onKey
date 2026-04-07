# 세션 관리 목록 개선 — Implement

## 1. Domain

- [x] `src/domain/repositories/session.repository.ts` — `findByOwnerIdFiltered()` 메서드 추가 (page, pageSize, totalFiltered)

## 2. Data

- [x] `src/data/repositories/session.repository.impl.ts` — `findByOwnerIdFiltered()` 구현
  - status → `.eq('status', status)`
  - search → `.or('tenant_name.ilike.%search%,room_number.ilike.%search%')`
  - sortBy + sortOrder → `.order(sortCol, { ascending })`
  - page + pageSize → `.range(from, to)` + `{ count: 'exact' }`
  - counts → status별 카운트
  - totalFiltered → 필터된 전체 개수

## 3. Presentation — 클라이언트 컴포넌트

- [x] `src/components/sessions/session-list-client.tsx` — 검색/상태 탭/정렬/페이지네이션 UI + 카드 그리드

## 4. Presentation — 페이지

- [x] `src/app/(dashboard)/sessions/page.tsx` — searchParams 읽기 → filtered query → client component

## 5. 타입체크

- [x] `npx tsc --noEmit` 통과
