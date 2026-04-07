## 목표

Research에서 확정한 "가치 기반" 요금제 전략을 구현한다. Starter의 세션 에디터 제한을 해제하고, Pro+ 전용 신규 기능(세션 복제, CSV 가져오기, 이메일 발송)의 Feature Gating 인프라를 구축한다.

## 변경 범위

### Domain

- [ ] `src/lib/polar.ts`: `hasFeature()` feature 키 확장 — `sessionDuplicate` | `csvImport` | `emailNotification` | `customBranding` 추가

### Data

- N/A (스키마 변경 없음, 기존 Profile.plan 활용)

### Presentation

- [ ] `src/app/(dashboard)/sessions/page.tsx`: 세션 복제 버튼 추가 (Pro+ 게이팅), CSV 가져오기 버튼 추가 (Pro+ 게이팅)
- [ ] `src/app/(dashboard)/sessions/[id]/page.tsx`: 세션 복제 버튼 추가 (Pro+ 게이팅)
- [ ] `src/app/(dashboard)/settings/billing/billing-content.tsx`: 요금제 비교 카드 업데이트 (신규 기능 반영)
- [ ] 세션 복제 UI: 세션 카드/상세에서 "복제" 액션 → 입주자 정보만 입력받는 간이 폼 → 세션 생성
- [ ] CSV 가져오기 UI: "CSV 가져오기" 버튼 → 파일 업로드 → 미리보기 테이블 → 일괄 생성
- [ ] 이메일 발송: 세션 생성 완료 시 "이메일로 보내기" 옵션 (Pro+ 전용, Phase 2 이메일 기능과 연계)
- [ ] `UpgradePromptDialog`: 신규 기능에 대한 업그레이드 안내 메시지 추가

### Test

- [ ] `hasFeature()` 확장 테스트: 각 요금제별 신규 feature 키 접근성 검증
- [ ] 세션 복제 Server Action 테스트
- [ ] CSV 파싱 + 배치 생성 테스트
