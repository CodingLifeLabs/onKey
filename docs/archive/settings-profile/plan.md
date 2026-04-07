# 설정 — 프로필 관리 Plan

## 레이어별 설계

### Domain

- [ ] `src/domain/repositories/profile.repository.ts` — `updateProfile()` 메서드 추가
  ```
  updateProfile(id: string, data: { fullName: string }): Promise<Profile>
  ```

### Data

- [ ] `src/data/repositories/profile.repository.impl.ts` — `updateProfile()` 구현체 추가

### Validation

- [ ] `src/lib/validations/profile.ts` — 프로필 수정 zod 스키마
  ```
  fullName: 최소 1자, 최대 50자
  ```

### Server Action

- [ ] `src/app/actions/update-profile.ts` — 프로필 업데이트 Server Action
  - getOwnerProfile()로 인증 확인
  - zod 스키마로 입력 검증
  - repository.updateProfile() 호출

### Presentation — 설정 페이지

- [ ] `src/app/(dashboard)/settings/page.tsx` — 서버 컴포넌트로 리팩토링
  - getOwnerProfile()로 현재 프로필 조회
  - ProfileContent 클라이언트 컴포넌트에 데이터 전달
  - 결제 관리 카드 (플랜 배지 + 결제 관리 버튼)

- [ ] `src/app/(dashboard)/settings/profile-content.tsx` — 프로필 수정 폼
  - 이름 입력 (react-hook-form + zod)
  - 이메일 표시 (읽기 전용)
  - 저장 버튼 + 로딩 상태
  - 성공/에러 토스트 메시지

### 테스트

- [ ] `src/lib/validations/__tests__/profile.test.ts` — 스키마 테스트
- [ ] `src/app/actions/__tests__/update-profile.test.ts` — Server Action 테스트

---

## 처리하지 않는 것

- 이메일 변경 (Clerk 관리, 추후 구현)
- 전화번호 필드 (DB 스키마 변경 필요, Phase 3)
- 알림 설정
- 계정 탈퇴
- 사업자 정보
