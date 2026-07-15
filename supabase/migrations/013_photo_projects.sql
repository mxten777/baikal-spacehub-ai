-- ============================================================
-- The Lit — Migration 013: Photo Projects (Image Asset Management)
-- ============================================================
-- 목적: 이미지 자산 프로젝트 구조를 DB로 관리한다.
--       photo_projects 테이블 신규 생성 +
--       photos 테이블에 project_id / project_category / project_stage 추가.
-- 적용: Supabase Dashboard > SQL Editor
-- ============================================================

-- ── 1. photo_projects 테이블 ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.photo_projects (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  slug        TEXT        NOT NULL UNIQUE,
  description TEXT,

  -- 허용 카테고리: main / wedding / space / food_beverage / archive /
  --               online_wedding / online_space / contact / about
  categories  TEXT[]      NOT NULL DEFAULT '{}',

  -- 허용 단계: source / selected / edited / web / pdf
  -- 기본값: 전체 단계
  stages      TEXT[]      NOT NULL DEFAULT ARRAY['source','selected','edited','web','pdf'],

  status      TEXT        NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'archived')),

  created_by  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CHECK: categories 배열의 각 요소가 허용 값인지 검증
-- (PostgreSQL은 배열 요소별 CHECK를 직접 지원하지 않으므로 표현식 CHECK로 처리)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'photo_projects_categories_valid'
      AND conrelid = 'public.photo_projects'::regclass
  ) THEN
    ALTER TABLE public.photo_projects
      ADD CONSTRAINT photo_projects_categories_valid
        CHECK (
          categories <@ ARRAY[
            'main','wedding','space','food_beverage','archive',
            'online_wedding','online_space','contact','about'
          ]::TEXT[]
        );
  END IF;
END; $$;

-- CHECK: stages 배열의 각 요소가 허용 값인지 검증
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'photo_projects_stages_valid'
      AND conrelid = 'public.photo_projects'::regclass
  ) THEN
    ALTER TABLE public.photo_projects
      ADD CONSTRAINT photo_projects_stages_valid
        CHECK (
          stages <@ ARRAY['source','selected','edited','web','pdf']::TEXT[]
        );
  END IF;
END; $$;

-- ── 2. updated_at 자동 갱신 trigger ─────────────────────────────────────────
-- photos 테이블은 전용 함수(update_photos_updated_at)를 사용한다.
-- photo_projects 전용 함수를 안전하게 추가한다.

CREATE OR REPLACE FUNCTION public.update_photo_projects_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS photo_projects_updated_at ON public.photo_projects;
CREATE TRIGGER photo_projects_updated_at
  BEFORE UPDATE ON public.photo_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_photo_projects_updated_at();

-- ── 3. photo_projects 인덱스 ─────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS photo_projects_slug_idx
  ON public.photo_projects (slug);

CREATE INDEX IF NOT EXISTS photo_projects_status_idx
  ON public.photo_projects (status);

CREATE INDEX IF NOT EXISTS photo_projects_created_at_idx
  ON public.photo_projects (created_at DESC);

-- ── 4. photo_projects RLS ────────────────────────────────────────────────────

ALTER TABLE public.photo_projects ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'photo_projects'
      AND policyname = 'photo_projects_admin_select'
  ) THEN
    CREATE POLICY "photo_projects_admin_select" ON public.photo_projects
      FOR SELECT TO authenticated
      USING (public.is_admin());
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'photo_projects'
      AND policyname = 'photo_projects_admin_insert'
  ) THEN
    CREATE POLICY "photo_projects_admin_insert" ON public.photo_projects
      FOR INSERT TO authenticated
      WITH CHECK (public.is_admin());
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'photo_projects'
      AND policyname = 'photo_projects_admin_update'
  ) THEN
    CREATE POLICY "photo_projects_admin_update" ON public.photo_projects
      FOR UPDATE TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'photo_projects'
      AND policyname = 'photo_projects_admin_delete'
  ) THEN
    CREATE POLICY "photo_projects_admin_delete" ON public.photo_projects
      FOR DELETE TO authenticated
      USING (public.is_admin());
  END IF;
END;
$$;

-- ── 5. photos 테이블 컬럼 추가 ───────────────────────────────────────────────
-- 기존 레코드에는 NULL이 설정되어 영향 없음.
-- project_id 삭제 시 SET NULL 적용.

ALTER TABLE public.photos
  ADD COLUMN IF NOT EXISTS project_id UUID
    REFERENCES public.photo_projects(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS project_category TEXT
    CHECK (project_category IS NULL OR project_category IN (
      'main','wedding','space','food_beverage','archive',
      'online_wedding','online_space','contact','about'
    )),
  ADD COLUMN IF NOT EXISTS project_stage TEXT
    CHECK (project_stage IS NULL OR project_stage IN (
      'source','selected','edited','web','pdf'
    ));

-- ── 6. photos 신규 인덱스 ────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS photos_project_id_idx
  ON public.photos (project_id);

CREATE INDEX IF NOT EXISTS photos_project_id_category_idx
  ON public.photos (project_id, project_category);

CREATE INDEX IF NOT EXISTS photos_project_id_stage_idx
  ON public.photos (project_id, project_stage);
