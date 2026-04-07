-- RLS 정책 수정: Clerk 기반 인증에 맞게 조정
-- 기존 auth.jwt() ->> 'sub' 정책은 Supabase Auth 전용이므로 제거
-- 웹훅은 service_role로 실행 → RLS 우회
-- 일반 API는 service_role로 실행 + 애플리케이션에서 owner_id 검증

-- ============================================
-- profiles: 기존 정책 제거 후 service_role 허용
-- ============================================
DROP POLICY IF EXISTS "profiles_owner_select" ON profiles;
DROP POLICY IF EXISTS "profiles_owner_update" ON profiles;

-- service_role은 모든 접근 가능 (웹훅 + API에서 사용)
-- anon/authenticated는 읽기만 (프로필 조회 시)
-- 실제 데이터 격리는 애플리케이션 레이어에서 처리

-- ============================================
-- templates: 기존 정책 정리
-- ============================================
DROP POLICY IF EXISTS "templates_system_read" ON templates;
DROP POLICY IF EXISTS "templates_owner_all" ON templates;

-- ============================================
-- sessions: 기존 정책 정리
-- ============================================
DROP POLICY IF EXISTS "sessions_owner_all" ON sessions;

-- ============================================
-- 참고: 모든 테이블은 RLS ENABLE 상태 유지
-- service_role 키로 접근 시 RLS 우회
-- anon_key로 접근 시 정책 없으면 차단 (안전)
-- ============================================

-- 시스템 템플릿 owner_id를 NULL로 변경 (FK 제약 위해 더미 UUID 대신)
-- 시스템 템플릿은 소유자가 없으므로 owner_id = NULL 허용
ALTER TABLE templates ALTER COLUMN owner_id DROP NOT NULL;
UPDATE templates SET owner_id = NULL WHERE is_system = true;
