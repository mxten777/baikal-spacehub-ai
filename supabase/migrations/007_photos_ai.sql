-- ============================================================
-- The Lit ??Migration 007: photos AI analysis columns (Sprint 5-A)
-- Adds scaffold columns for future AI analysis integration.
-- No AI API is connected yet ??status defaults to not_requested.
-- Run via: Supabase Dashboard > SQL Editor
-- ============================================================

ALTER TABLE public.photos
  ADD COLUMN IF NOT EXISTS ai_analysis_status TEXT NOT NULL DEFAULT 'not_requested'
    CHECK (ai_analysis_status IN (
      'not_requested', 'processing', 'completed', 'error'
    )),
  ADD COLUMN IF NOT EXISTS ai_quality_score   INTEGER
    CHECK (ai_quality_score IS NULL OR (ai_quality_score BETWEEN 0 AND 100)),
  ADD COLUMN IF NOT EXISTS ai_space_category  TEXT
    CHECK (ai_space_category IS NULL OR ai_space_category IN (
      'cafe','garden','studio','exterior','program',
      'event','exhibition','performance','food','people',
      'other','unclassified'
    )),
  ADD COLUMN IF NOT EXISTS ai_photo_type      TEXT
    CHECK (ai_photo_type IS NULL OR ai_photo_type IN (
      'hero','representative','interior','exterior','detail',
      'people','event','promotional','archive','general'
    )),
  ADD COLUMN IF NOT EXISTS ai_tags            TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ai_description     TEXT,
  ADD COLUMN IF NOT EXISTS ai_featured_score  INTEGER
    CHECK (ai_featured_score IS NULL OR (ai_featured_score BETWEEN 0 AND 100)),
  ADD COLUMN IF NOT EXISTS ai_analyzed_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ai_error_message   TEXT;

-- ?? RLS unchanged ?????????????????????????????????????????????????????????????
-- Existing admin select/insert/update/delete policies from 005 already
-- cover the new AI columns ??no new policies needed.
