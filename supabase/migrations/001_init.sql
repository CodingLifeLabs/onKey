-- OnKey 초기 마이그레이션
-- 생성일: 2026-04-02

-- ============================================
-- 1. profiles (운영자 프로필)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise')),
  polar_customer_id TEXT,
  session_count_this_month INTEGER DEFAULT 0,
  session_reset_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_owner_select" ON profiles
  FOR SELECT USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "profiles_owner_update" ON profiles
  FOR UPDATE USING (clerk_user_id = auth.jwt() ->> 'sub');

-- profiles INSERT는 Clerk 웹훅(service role)으로만 수행
-- 일반 유저는 INSERT 불가 (RLS 정책 없음 = 차단)

CREATE INDEX idx_profiles_clerk_user_id ON profiles(clerk_user_id);

-- session_count 증가 RPC
CREATE OR REPLACE FUNCTION increment_session_count(profile_id UUID)
RETURNS void AS $$
UPDATE profiles
SET session_count_this_month = session_count_this_month + 1
WHERE id = profile_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- 2. templates (온보딩 템플릿)
-- ============================================
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  content JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- 시스템 템플릿은 모두 읽기 가능
CREATE POLICY "templates_system_read" ON templates
  FOR SELECT USING (is_system = true);

-- 운영자는 자신의 커스텀 템플릿만 접근
CREATE POLICY "templates_owner_all" ON templates
  FOR ALL USING (
    owner_id = (
      SELECT id FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE INDEX idx_templates_owner_id ON templates(owner_id);
CREATE INDEX idx_templates_is_system ON templates(is_system) WHERE is_system = true;

-- ============================================
-- 3. sessions (온보딩 세션)
-- ============================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id),
  token TEXT UNIQUE NOT NULL,
  tenant_name TEXT NOT NULL,
  room_number TEXT,
  move_in_date DATE,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'expired')),
  content_snapshot JSONB NOT NULL,
  tenant_ip TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- 운영자는 자신의 세션만 접근
CREATE POLICY "sessions_owner_all" ON sessions
  FOR ALL USING (
    owner_id = (
      SELECT id FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- 토큰 기반 퍼블릭 읽기 (API 레이어에서 별도 처리)
-- session_progress와 함께 API Route에서 service_role로 조회

CREATE INDEX idx_sessions_owner_id ON sessions(owner_id);
CREATE UNIQUE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_status ON sessions(status);

-- 만료 세션 자동 업데이트 함수
CREATE OR REPLACE FUNCTION expire_sessions()
RETURNS void AS $$
UPDATE sessions
SET status = 'expired'
WHERE status IN ('pending', 'in_progress')
  AND expires_at < now();
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- 4. session_progress (입주자 진행 상태)
-- ============================================
CREATE TABLE session_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  viewed_sections JSONB DEFAULT '[]',
  checked_items JSONB DEFAULT '[]',
  signature_name TEXT,
  signature_image_url TEXT,
  submitted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE session_progress ENABLE ROW LEVEL SECURITY;

-- session_progress는 API 레이어에서만 접근 (service_role)
-- 일반 유저 RLS 정책 없음 = API Route에서만 조작

CREATE INDEX idx_session_progress_session_id ON session_progress(session_id);

-- ============================================
-- 5. 시스템 기본 템플릿 2종
-- ============================================

-- 템플릿 1: 표준 원룸 입주 안내
INSERT INTO templates (owner_id, name, description, is_system, content) VALUES (
  NULL,
  '표준 원룸 입주 안내',
  '원룸 입주자를 위한 기본 안내 템플릿입니다.',
  true,
  '[
    {"id":"sys_h1","type":"heading","order":0,"required":false,"content":{"text":"입주를 환영합니다!","level":1}},
    {"id":"sys_t1","type":"text","order":1,"required":false,"content":{"html":"<p>안녕하세요! 입주하신 것을 진심으로 환영합니다. 아래 안내 사항을 확인해주세요.</p>"}},
    {"id":"sys_h2","type":"heading","order":2,"required":false,"content":{"text":"관리비 납부 안내","level":2}},
    {"id":"sys_t2","type":"text","order":3,"required":false,"content":{"html":"<p>관리비는 매월 25일에 자동이체됩니다. 납부 계좌: <strong>OO은행 123-456-789012</strong> (예금주: 홍길동)</p>"}},
    {"id":"sys_h3","type":"heading","order":4,"required":false,"content":{"text":"쓰레기 배출 안내","level":2}},
    {"id":"sys_t3","type":"text","order":5,"required":false,"content":{"html":"<ul><li>일반 쓰레기: 매일 오전 8시 전까지 지정 장소에 배출</li><li>재활용: 매주 월, 목요일 배출</li><li>음식물 쓰레기: 전용 봉투 사용 후 지정 장소에 배출</li></ul>"}},
    {"id":"sys_c1","type":"contact","order":6,"required":false,"content":{"title":"비상 연락처","entries":[{"label":"건물 관리자","phone":"010-1234-5678","available":"평일 09:00~18:00"},{"label":"긴급 수리","phone":"010-9999-0000","available":"24시간"}]}},
    {"id":"sys_chk1","type":"checklist","order":7,"required":true,"content":{"title":"입주 확인 체크리스트","items":[{"id":"sys_itm1","label":"도어락 비밀번호 변경 완료","required":true},{"id":"sys_itm2","label":"관리비 자동이체 신청 완료","required":true},{"id":"sys_itm3","label":"인터넷 개통 신청 완료","required":false},{"id":"sys_itm4","label":"주차장 이용 등록 완료","required":false}]}},
    {"id":"sys_sig1","type":"signature","order":8,"required":true,"content":{"title":"입주자 서명","description":"위 안내 사항을 모두 확인하였습니다.","collect_name":true,"collect_canvas":true}}
  ]'::jsonb
);

-- 템플릿 2: 오피스텔 입주 안내
INSERT INTO templates (owner_id, name, description, is_system, content) VALUES (
  NULL,
  '오피스텔 입주 안내',
  '오피스텔 입주자를 위한 기본 안내 템플릿입니다.',
  true,
  '[
    {"id":"sys2_h1","type":"heading","order":0,"required":false,"content":{"text":"오피스텔 입주 안내","level":1}},
    {"id":"sys2_t1","type":"text","order":1,"required":false,"content":{"html":"<p>오피스텔 입주를 환영합니다. 원활한 입주 생활을 위해 아래 사항을 반드시 확인해주세요.</p>"}},
    {"id":"sys2_h2","type":"heading","order":2,"required":false,"content":{"text":"시설 이용 안내","level":2}},
    {"id":"sys2_t2","type":"text","order":3,"required":false,"content":{"html":"<ul><li>헬스장: 06:00~22:00 (입주증 필요)</li><li>세탁실: 24시간 (공용)</li><li>라운지: 08:00~23:00</li></ul>"}},
    {"id":"sys2_h3","type":"heading","order":4,"required":false,"content":{"text":"주차 안내","level":2}},
    {"id":"sys2_t3","type":"text","order":5,"required":false,"content":{"html":"<p>주차는 배정된 번호에만 가능합니다. 방문자 주차는 최대 2시간까지 무료입니다.</p>"}},
    {"id":"sys2_c1","type":"contact","order":6,"required":false,"content":{"title":"관리사무소 연락처","entries":[{"label":"관리사무소","phone":"02-1234-5678","available":"평일 09:00~18:00"},{"label":"경비실","phone":"02-1234-5679","available":"24시간"}]}},
    {"id":"sys2_chk1","type":"checklist","order":7,"required":true,"content":{"title":"입주 확인 체크리스트","items":[{"id":"sys2_itm1","label":"입주증 수령 완료","required":true},{"id":"sys2_itm2","label":"관리비 자동이체 신청 완료","required":true},{"id":"sys2_itm3","label":"주차 차량 등록 완료","required":true},{"id":"sys2_itm4","label":"인터넷/통신 개통 완료","required":false}]}},
    {"id":"sys2_sig1","type":"signature","order":8,"required":true,"content":{"title":"입주자 서명","description":"위 안내 사항을 모두 확인하였습니다.","collect_name":true,"collect_canvas":true}}
  ]'::jsonb
);
