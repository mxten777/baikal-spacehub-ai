-- ============================================================
-- 016_publish_status.sql
-- Sprint 13-A: 공개 상태 안전화
-- 대상: spaces, programs, archive_items, blog_posts
-- ============================================================

-- =====================================================
-- 0. 사전 검증 — 기존 데이터 건수 확인
-- =====================================================
DO $$
DECLARE
  v_spaces   INTEGER;
  v_programs INTEGER;
  v_archive  INTEGER;
  v_blog_pub INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_spaces   FROM public.spaces;
  SELECT COUNT(*) INTO v_programs FROM public.programs;
  SELECT COUNT(*) INTO v_archive  FROM public.archive_items;
  SELECT COUNT(*) INTO v_blog_pub FROM public.blog_posts WHERE is_published = TRUE;
  RAISE NOTICE 'PRE-MIGRATION: spaces=%, programs=%, archive_items=%, blog_posts(published)=%',
    v_spaces, v_programs, v_archive, v_blog_pub;
END $$;

-- =====================================================
-- 1. spaces — publish_status / published_at 추가
-- =====================================================
ALTER TABLE public.spaces
  ADD COLUMN IF NOT EXISTS publish_status TEXT NOT NULL DEFAULT 'published'
    CONSTRAINT spaces_publish_status_check
      CHECK (publish_status IN ('draft', 'published', 'archived')),
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

COMMENT ON COLUMN public.spaces.publish_status IS
  '공개 상태: draft=초안, published=공개, archived=보관';
COMMENT ON COLUMN public.spaces.published_at IS
  '공개 시작 시각. NULL이면 즉시 공개. 미래이면 예약 게시 (현재 미노출).';

-- 기존 데이터: published_at = created_at (이미 publish_status = 'published')
UPDATE public.spaces
SET published_at = COALESCE(created_at, NOW())
WHERE published_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_spaces_publish_status
  ON public.spaces(publish_status);
CREATE INDEX IF NOT EXISTS idx_spaces_published_at
  ON public.spaces(published_at);

-- =====================================================
-- 2. programs — is_published / published_at 추가
-- =====================================================
ALTER TABLE public.programs
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

COMMENT ON COLUMN public.programs.is_published IS
  '홈페이지 게시 여부. 행사 진행 상태(status)와 독립적으로 관리.';
COMMENT ON COLUMN public.programs.published_at IS
  '게시 시작 시각. NULL이면 즉시 공개. 미래이면 예약 게시 (현재 미노출).';

-- 기존 데이터: 전부 공개 상태 유지
UPDATE public.programs
SET published_at = COALESCE(created_at, NOW())
WHERE published_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_programs_is_published
  ON public.programs(is_published);
CREATE INDEX IF NOT EXISTS idx_programs_published_at
  ON public.programs(published_at);

-- =====================================================
-- 3. archive_items — publish_status / published_at 추가
-- =====================================================
ALTER TABLE public.archive_items
  ADD COLUMN IF NOT EXISTS publish_status TEXT NOT NULL DEFAULT 'published'
    CONSTRAINT archive_items_publish_status_check
      CHECK (publish_status IN ('draft', 'published', 'archived')),
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

COMMENT ON COLUMN public.archive_items.publish_status IS
  '공개 상태: draft=초안, published=공개, archived=보관';
COMMENT ON COLUMN public.archive_items.published_at IS
  '공개 시작 시각. NULL이면 즉시 공개. 미래이면 예약 게시 (현재 미노출).';

-- 기존 데이터: published_at = created_at
UPDATE public.archive_items
SET published_at = COALESCE(created_at, NOW())
WHERE published_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_archive_items_publish_status
  ON public.archive_items(publish_status);
CREATE INDEX IF NOT EXISTS idx_archive_items_published_at
  ON public.archive_items(published_at);

-- =====================================================
-- 4. blog_posts — published_at 보정
-- =====================================================
-- 공개 글 중 published_at이 NULL인 경우 created_at으로 보정
-- (신규 컬럼 없음 — 기존 컬럼 데이터 정합성만 보완)
UPDATE public.blog_posts
SET published_at = COALESCE(created_at, NOW())
WHERE is_published = TRUE AND published_at IS NULL;

-- 공개 글 대상 인덱스 (없으면 생성)
CREATE INDEX IF NOT EXISTS idx_blog_posts_pub_published_at
  ON public.blog_posts(published_at)
  WHERE is_published = TRUE;

-- =====================================================
-- 5. 사후 검증 — 마이그레이션 결과 확인
-- =====================================================
DO $$
DECLARE
  v_spaces_pub   INTEGER;
  v_programs_pub INTEGER;
  v_archive_pub  INTEGER;
  v_blog_pub     INTEGER;
  v_spaces_null  INTEGER;
  v_programs_null INTEGER;
  v_archive_null  INTEGER;
  v_blog_null     INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_spaces_pub   FROM public.spaces WHERE publish_status = 'published';
  SELECT COUNT(*) INTO v_programs_pub FROM public.programs WHERE is_published = TRUE;
  SELECT COUNT(*) INTO v_archive_pub  FROM public.archive_items WHERE publish_status = 'published';
  SELECT COUNT(*) INTO v_blog_pub     FROM public.blog_posts WHERE is_published = TRUE;

  SELECT COUNT(*) INTO v_spaces_null   FROM public.spaces WHERE published_at IS NULL;
  SELECT COUNT(*) INTO v_programs_null FROM public.programs WHERE published_at IS NULL;
  SELECT COUNT(*) INTO v_archive_null  FROM public.archive_items WHERE published_at IS NULL;
  SELECT COUNT(*) INTO v_blog_null     FROM public.blog_posts WHERE is_published = TRUE AND published_at IS NULL;

  RAISE NOTICE 'POST-MIGRATION: spaces_published=%, programs_published=%, archive_published=%, blog_published=%',
    v_spaces_pub, v_programs_pub, v_archive_pub, v_blog_pub;
  RAISE NOTICE 'NULL published_at (should all be 0): spaces=%, programs=%, archive=%, blog_pub=%',
    v_spaces_null, v_programs_null, v_archive_null, v_blog_null;
END $$;
