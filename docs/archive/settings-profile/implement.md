# 설정 — 프로필 관리 Implement

## 1. Validation

- [x] `src/lib/validations/profile.ts` — fullName zod 스키마 생성

## 2. Domain

- [x] `src/domain/repositories/profile.repository.ts` — `updateProfile(id, { fullName })` 메서드 추가

## 3. Data

- [x] `src/data/repositories/profile.repository.impl.ts` — `updateProfile()` 구현

## 4. Server Action

- [x] `src/app/actions/update-profile.ts` — 프로필 업데이트 Server Action 생성

## 5. Presentation

- [x] `src/app/(dashboard)/settings/profile-content.tsx` — 프로필 수정 폼 클라이언트 컴포넌트 생성
- [x] `src/app/(dashboard)/settings/page.tsx` — 플레이스홀더 → 프로필 + 결제 관리 페이지로 교체

## 6. 타입체크

- [x] `npx tsc --noEmit` 통과 확인
