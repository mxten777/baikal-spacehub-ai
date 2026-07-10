-- ============================================================
-- The Lit — Migration 005: photos table (AI Photo Curator Sprint 3)
-- Run via: Supabase Dashboard > SQL Editor
-- ============================================================

-- ── Table ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.photos (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  original_name TEXT        NOT NULL,
  storage_path  TEXT        NOT NULL UNIQUE,
  public_url    TEXT,

  mime_type     TEXT        NOT NULL,
  file_size     BIGINT      NOT NULL CHECK (file_size > 0),

  width         INTEGER,
  height        INTEGER,

  upload_status TEXT        NOT NULL DEFAULT 'completed'
                            CHECK (upload_status IN ('completed', 'delete_pending', 'error')),

  uploaded_by   UUID        NOT NULL REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── updated_at trigger ───────────────────────────────────────────────────────
-- Uses a table-specific function to avoid conflicts with other triggers.

CREATE OR REPLACE FUNCTION public.update_photos_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS photos_updated_at ON public.photos;
CREATE TRIGGER photos_updated_at
  BEFORE UPDATE ON public.photos
  FOR EACH ROW EXECUTE FUNCTION public.update_photos_updated_at();

-- ── Indexes ──────────────────────────────────────────────────────────────────
-- storage_path already gets an index from the UNIQUE constraint.

CREATE INDEX IF NOT EXISTS photos_created_at_idx     ON public.photos (created_at DESC);
CREATE INDEX IF NOT EXISTS photos_uploaded_by_idx    ON public.photos (uploaded_by);
CREATE INDEX IF NOT EXISTS photos_upload_status_idx  ON public.photos (upload_status);

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Admin can select all photos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'photos' AND policyname = 'photos_admin_select'
  ) THEN
    CREATE POLICY "photos_admin_select" ON public.photos
      FOR SELECT TO authenticated
      USING (public.is_admin());
  END IF;
END;
$$;

-- Admin can insert; uploaded_by must match the calling user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'photos' AND policyname = 'photos_admin_insert'
  ) THEN
    CREATE POLICY "photos_admin_insert" ON public.photos
      FOR INSERT TO authenticated
      WITH CHECK (public.is_admin() AND uploaded_by = auth.uid());
  END IF;
END;
$$;

-- Admin can update (e.g. upload_status changes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'photos' AND policyname = 'photos_admin_update'
  ) THEN
    CREATE POLICY "photos_admin_update" ON public.photos
      FOR UPDATE TO authenticated
      USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END;
$$;

-- Admin can delete
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'photos' AND policyname = 'photos_admin_delete'
  ) THEN
    CREATE POLICY "photos_admin_delete" ON public.photos
      FOR DELETE TO authenticated
      USING (public.is_admin());
  END IF;
END;
$$;
