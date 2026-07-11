-- ============================================================
-- The Lit — Role Structure Migration
-- Sprint: 권한(Role) 구조 개선 및 MVP 운영 권한 분리
-- ============================================================
-- 목적: 단일 admin role → super_admin / operator 2단계 구조로 변경
-- 기존 데이터: admin → super_admin 자동 마이그레이션
-- 기존 기능: 변경 없음 (권한 구조만 추가)
-- ============================================================

-- ── 1. 기존 제약 제거 ────────────────────────────────────
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

-- ── 2. 기존 데이터 마이그레이션 (제약 추가 전에 먼저 실행) ──
-- admin → super_admin (바이칼시스템즈 담당자)
UPDATE public.profiles
  SET role = 'super_admin'
  WHERE role = 'admin';

-- editor → operator (기존 에디터 계정이 있을 경우 운영자로 전환)
UPDATE public.profiles
  SET role = 'operator'
  WHERE role = 'editor';

-- ── 3. 새 제약 추가 (데이터 정리 후) ─────────────────────
-- 기존: CHECK (role IN ('admin', 'editor', 'viewer'))
-- 신규: CHECK (role IN ('super_admin', 'operator', 'viewer'))
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('super_admin', 'operator', 'viewer'));

-- ── 3. 신규 가입 기본값 변경 ──────────────────────────────
-- 신규 계정은 operator로 생성 (super_admin은 수동 부여)
ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'operator';

-- ── 4. 헬퍼 함수 ─────────────────────────────────────────
-- RLS 정책 및 서버사이드 권한 체크에서 사용
-- 현재 RLS는 미적용 상태 (Phase 2에서 활성화 예정)
-- 함수만 미리 준비해 둡니다.

-- is_super_admin(): 현재 로그인 사용자가 super_admin인지 확인
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'super_admin'
  );
$$;

-- is_operator(): super_admin 포함 운영 권한 이상인지 확인
CREATE OR REPLACE FUNCTION public.is_operator()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('super_admin', 'operator')
  );
$$;

-- has_permission(required_role): 요구 role 이상인지 확인
-- 우선순위: super_admin > operator > viewer
CREATE OR REPLACE FUNCTION public.has_permission(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  current_role TEXT;
  role_rank INT;
  required_rank INT;
BEGIN
  SELECT role INTO current_role
  FROM public.profiles
  WHERE id = auth.uid();

  role_rank := CASE current_role
    WHEN 'super_admin' THEN 3
    WHEN 'operator'    THEN 2
    WHEN 'viewer'      THEN 1
    ELSE 0
  END;

  required_rank := CASE required_role
    WHEN 'super_admin' THEN 3
    WHEN 'operator'    THEN 2
    WHEN 'viewer'      THEN 1
    ELSE 0
  END;

  RETURN role_rank >= required_rank;
END;
$$;

-- ── 5. 인덱스 ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ── 6. Phase 2 대비 주석 ──────────────────────────────────
-- Phase 2에서 RLS 정책 활성화 시 아래 형태로 적용:
--
-- CREATE POLICY "operator_can_read_spaces"
--   ON public.spaces FOR SELECT
--   USING (is_operator());
--
-- CREATE POLICY "super_admin_only_settings"
--   ON public.settings FOR ALL
--   USING (is_super_admin());
--
-- 현재는 기존 RLS 정책 유지 (기존 기능 영향 없음)
