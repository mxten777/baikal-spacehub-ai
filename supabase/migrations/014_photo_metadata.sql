-- ============================================================
-- The Lit — Migration 014: Photo Metadata Columns
-- ============================================================
-- 목적: Asset Explorer에서 사진별 메타데이터 수정 기능 지원.
--       photos 테이블에 title / description / note 컬럼 추가.
-- 적용: Supabase Dashboard > SQL Editor
-- ============================================================

ALTER TABLE public.photos
  ADD COLUMN IF NOT EXISTS title       TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS note        TEXT;

-- 기존 레코드에는 NULL이 설정되어 영향 없음.
-- updated_at 트리거는 005_photos_table.sql의 photos_updated_at 이 처리함.
