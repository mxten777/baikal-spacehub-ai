-- ============================================================
-- The Lit — Migration 006: photos management columns (Sprint 4)
-- Adds space_category, photo_type, tags, is_featured, is_favorite,
-- admin_memo to the photos table for manual curation.
-- Run via: Supabase Dashboard > SQL Editor
-- ============================================================

ALTER TABLE public.photos
  ADD COLUMN IF NOT EXISTS space_category TEXT NOT NULL DEFAULT 'unclassified'
    CHECK (space_category IN (
      'cafe','garden','studio','exterior','program',
      'event','exhibition','performance','food','people',
      'other','unclassified'
    )),
  ADD COLUMN IF NOT EXISTS photo_type TEXT NOT NULL DEFAULT 'general'
    CHECK (photo_type IN (
      'hero','representative','interior','exterior','detail',
      'people','event','promotional','archive','general'
    )),
  ADD COLUMN IF NOT EXISTS tags        TEXT[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS admin_memo  TEXT;

-- ── Indexes ──────────────────────────────────────────────────────────────────
-- created_at index already exists from 005_photos_table.sql

CREATE INDEX IF NOT EXISTS photos_space_category_idx
  ON public.photos (space_category);

CREATE INDEX IF NOT EXISTS photos_photo_type_idx
  ON public.photos (photo_type);

CREATE INDEX IF NOT EXISTS photos_is_featured_idx
  ON public.photos (is_featured);

CREATE INDEX IF NOT EXISTS photos_is_favorite_idx
  ON public.photos (is_favorite);

CREATE INDEX IF NOT EXISTS photos_tags_gin_idx
  ON public.photos USING GIN (tags);

-- ── RLS unchanged ─────────────────────────────────────────────────────────────
-- Existing policies from 005 (admin select/insert/update/delete) already
-- cover the new columns — no new policies needed.
