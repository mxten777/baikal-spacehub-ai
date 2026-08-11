-- ============================================================
-- 023_archive_media_type.sql
-- Archive 미디어 유형 및 중분류 확장
-- 대상: archive_items
-- ============================================================

-- media_type: 사진(photo) / 동영상(video) 구분
ALTER TABLE public.archive_items
  ADD COLUMN IF NOT EXISTS media_type TEXT NOT NULL DEFAULT 'photo'
    CONSTRAINT archive_items_media_type_check
      CHECK (media_type IN ('photo', 'video'));

-- subcategory: 중분류 (자유 텍스트, 선택값)
ALTER TABLE public.archive_items
  ADD COLUMN IF NOT EXISTS subcategory TEXT;

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_archive_media_type
  ON public.archive_items(media_type);

CREATE INDEX IF NOT EXISTS idx_archive_subcategory
  ON public.archive_items(subcategory);

-- 기존 데이터: media_type DEFAULT 'photo'에 의해 자동 처리됨
-- subcategory: NULL 허용이므로 backfill 불필요
