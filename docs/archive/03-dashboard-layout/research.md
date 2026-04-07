# Feature 3: 대시보드 레이아웃 + 세션 현황 — Research

## 목표

운영자 대시보드 레이아웃(사이드바 + 헤더)과 세션 목록 페이지를 구현한다. Clerk 인증으로 userId를 획득하고, Supabase에서 세션 데이터를 조회한다.

## 결론: 핵심 아키텍처 결정

1. **shadcn/ui sidebar** 사용 (collapsible 지원)
2. **Clerk userId → ownerId 해결**을 위한 유틸리티 함수 생성
3. **Server Component**에서 직접 데이터 패칭
4. **상태 뱃지** 색상: pending=gray, in_progress=blue, completed=green, expired=red
5. **Empty State** 3종: 세션 0개, 완료 0개, 한도 도달
