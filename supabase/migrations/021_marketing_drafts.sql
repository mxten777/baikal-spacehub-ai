-- ============================================================
-- The Lit — Migration 021: marketing_drafts (AI Marketing Engine Phase A)
-- 목적: SNS·블로그용 AI 마케팅 초안 관리 테이블 신설
-- 의존: 011_role_structure (is_super_admin, is_operator 함수)
-- 적용: Supabase Dashboard > SQL Editor
-- ============================================================

-- ── Table ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.marketing_drafts (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 원본 콘텐츠 참조 (blog_posts 또는 archive 등)
  source_type    TEXT        NOT NULL
                             CHECK (source_type IN ('blog', 'archive', 'manual')),
  source_id      UUID,                              -- NULL 허용 (manual 입력 시)

  -- 채널: baikal-ai ContentRequest.channel과 동일 값 유지
  channel        TEXT        NOT NULL
                             CHECK (channel IN ('instagram', 'threads', 'naver_blog')),

  -- AI 호출 시 사용한 파라미터 (topic, purpose, tone, keywords 등)
  prompt_params  JSONB       NOT NULL DEFAULT '{}',

  -- AI가 생성한 원본 초안
  ai_draft       TEXT        NOT NULL DEFAULT '',

  -- 운영자가 수정한 최종본 (NULL이면 ai_draft 그대로 사용)
  edited_draft   TEXT,

  -- 검수 상태
  status         TEXT        NOT NULL DEFAULT 'draft'
                             CHECK (status IN ('draft', 'reviewed', 'approved')),

  created_by     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── updated_at 자동 갱신 트리거 ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_marketing_drafts_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS marketing_drafts_updated_at ON public.marketing_drafts;
CREATE TRIGGER marketing_drafts_updated_at
  BEFORE UPDATE ON public.marketing_drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_marketing_drafts_updated_at();

-- ── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS marketing_drafts_created_by_idx  ON public.marketing_drafts (created_by);
CREATE INDEX IF NOT EXISTS marketing_drafts_channel_idx     ON public.marketing_drafts (channel);
CREATE INDEX IF NOT EXISTS marketing_drafts_status_idx      ON public.marketing_drafts (status);
CREATE INDEX IF NOT EXISTS marketing_drafts_created_at_idx  ON public.marketing_drafts (created_at DESC);

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE public.marketing_drafts ENABLE ROW LEVEL SECURITY;

-- viewer 이상 전체 조회 (viewer/operator/super_admin 모두 허용)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'marketing_drafts'
      AND policyname = 'marketing_drafts_select'
  ) THEN
    CREATE POLICY "marketing_drafts_select" ON public.marketing_drafts
      FOR SELECT TO authenticated
      USING (public.has_permission('viewer'));
  END IF;
END;
$$;

-- operator 이상만 생성 가능; created_by는 반드시 자신
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'marketing_drafts'
      AND policyname = 'marketing_drafts_insert'
  ) THEN
    CREATE POLICY "marketing_drafts_insert" ON public.marketing_drafts
      FOR INSERT TO authenticated
      WITH CHECK (
        public.is_operator()
        AND created_by = auth.uid()
      );
  END IF;
END;
$$;

-- operator 이상만 수정 가능
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'marketing_drafts'
      AND policyname = 'marketing_drafts_update'
  ) THEN
    CREATE POLICY "marketing_drafts_update" ON public.marketing_drafts
      FOR UPDATE TO authenticated
      USING (public.is_operator())
      WITH CHECK (public.is_operator());
  END IF;
END;
$$;

-- 삭제: 작성자 본인 또는 super_admin만 허용
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'marketing_drafts'
      AND policyname = 'marketing_drafts_delete'
  ) THEN
    CREATE POLICY "marketing_drafts_delete" ON public.marketing_drafts
      FOR DELETE TO authenticated
      USING (
        created_by = auth.uid()
        OR public.is_super_admin()
      );
  END IF;
END;
$$;
