-- ============================================================
-- The Lit — Migration 004: Photo Storage Bucket & Policies
-- Run via: Supabase Dashboard > SQL Editor
-- ============================================================

-- Create the photos bucket (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos',
  'photos',
  true,
  20971520, -- 20 MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Storage RLS Policies
-- All write operations require is_admin() check (reuses existing
-- admin permission system from 001_initial.sql)
-- ============================================================

-- Policy: admin can upload to the photos bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'photos_admin_insert'
  ) THEN
    CREATE POLICY "photos_admin_insert" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'photos' AND
        public.is_admin()
      );
  END IF;
END;
$$;

-- Policy: admin can delete from the photos bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'photos_admin_delete'
  ) THEN
    CREATE POLICY "photos_admin_delete" ON storage.objects
      FOR DELETE TO authenticated
      USING (
        bucket_id = 'photos' AND
        public.is_admin()
      );
  END IF;
END;
$$;

-- Policy: public can read (bucket is public, so public URLs work without auth)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'photos_public_select'
  ) THEN
    CREATE POLICY "photos_public_select" ON storage.objects
      FOR SELECT TO public
      USING (bucket_id = 'photos');
  END IF;
END;
$$;
