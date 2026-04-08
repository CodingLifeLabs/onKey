# Plan: Unlimited 요금제 기능 수정

## 수정 설계

### 문제

`templates/page.tsx` line 34에서 `plan === 'pro'` 하드코딩으로 인해 enterprise(unlimited) 플랜 사용자가 템플릿 생성/편집/복제 불가.

### 변경 사항

- [x] Presentation: `templates/page.tsx` isPro 조건 수정 (`plan === 'pro'` → `plan === 'pro' || plan === 'enterprise'`)

### 영향받는 기능

| 기능 | 수정 전 | 수정 후 |
|------|---------|---------|
| "새 템플릿" 버튼 | enterprise에서 숨김 | enterprise에서 표시 |
| 템플릿 편집 메뉴 | enterprise에서 잠금 | enterprise에서 허용 |
| 템플릿 복제 메뉴 | enterprise에서 잠금 | enterprise에서 허용 |
| 템플릿 삭제 | 변동 없음 | 변동 없음 |
