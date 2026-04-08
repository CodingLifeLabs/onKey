# Implement: Unlimited 요금제 기능 수정

## 체크리스트

- [x] `src/app/(dashboard)/templates/page.tsx` line 34: `setIsPro(plan === 'pro')` → `setIsPro(plan === 'pro' || plan === 'enterprise')` 수정
