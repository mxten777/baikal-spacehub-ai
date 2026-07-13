-- ============================================================
-- The Lit — Fix is_admin() after role migration
-- ============================================================
-- 원인: 011_role_structure.sql 에서 role 'admin' → 'super_admin' 으로
--       일괄 변경했으나 is_admin() 함수는 여전히 role = 'admin' 만 체크.
--       결과: settings / spaces 등 모든 admin_write RLS 정책이 차단됨.
-- 수정: is_admin() 을 super_admin + operator 포함으로 업데이트.
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin', 'operator')
  );
$$;
