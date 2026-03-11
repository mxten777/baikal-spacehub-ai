-- ============================================================
-- The Lit — Migration 002: Self-Expanding Content Aggregator
-- 자기확장형 콘텐츠 수집/관리 시스템
-- ============================================================

-- ============================================================
-- CONTENT SOURCES (수집 소스 관리)
-- RSS, YouTube, Instagram, X 소스 등록 및 설정
-- ============================================================
CREATE TABLE IF NOT EXISTS public.content_sources (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                    TEXT NOT NULL,
  platform                TEXT NOT NULL CHECK (platform IN ('rss','youtube','instagram','x')),
  source_url              TEXT,
  rss_url                 TEXT,
  channel_id              TEXT,
  account_handle          TEXT,
  is_active               BOOLEAN NOT NULL DEFAULT TRUE,
  auto_publish            BOOLEAN NOT NULL DEFAULT FALSE,
  fetch_interval_minutes  INTEGER NOT NULL DEFAULT 60,
  last_fetched_at         TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_content_sources_platform ON public.content_sources(platform);
CREATE INDEX IF NOT EXISTS idx_content_sources_active ON public.content_sources(is_active);

-- ============================================================
-- CONTENT TAGS (태그 시스템)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.content_tags (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL UNIQUE,
  slug       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_content_tags_slug ON public.content_tags(slug);

-- ============================================================
-- EXTERNAL CONTENTS (수집된 외부 콘텐츠 라이브러리)
-- 모든 플랫폼의 수집 콘텐츠를 단일 모델로 정규화
-- ============================================================
CREATE TABLE IF NOT EXISTS public.external_contents (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id           UUID REFERENCES public.content_sources(id) ON DELETE SET NULL,
  platform            TEXT NOT NULL CHECK (platform IN ('rss','youtube','instagram','x')),
  external_id         TEXT NOT NULL,
  external_url        TEXT NOT NULL,
  title               TEXT,
  summary             TEXT,
  content             TEXT,
  author_name         TEXT,
  thumbnail_url       TEXT,
  media_url           TEXT,
  published_at        TIMESTAMPTZ,
  fetched_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- 운영자 워크플로우
  visibility_status   TEXT NOT NULL DEFAULT 'pending'
                        CHECK (visibility_status IN ('pending','published','hidden','featured')),
  is_featured         BOOLEAN NOT NULL DEFAULT FALSE,
  category            TEXT,
  -- 관계 연결
  related_space_id    UUID REFERENCES public.spaces(id) ON DELETE SET NULL,
  related_program_id  UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  -- 메타데이터
  metadata_json       JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- 중복 방지: 같은 소스 + 외부 ID 조합은 unique
  UNIQUE(source_id, external_id)
);
CREATE INDEX IF NOT EXISTS idx_external_contents_source ON public.external_contents(source_id);
CREATE INDEX IF NOT EXISTS idx_external_contents_platform ON public.external_contents(platform);
CREATE INDEX IF NOT EXISTS idx_external_contents_status ON public.external_contents(visibility_status);
CREATE INDEX IF NOT EXISTS idx_external_contents_featured ON public.external_contents(is_featured);
CREATE INDEX IF NOT EXISTS idx_external_contents_published ON public.external_contents(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_external_contents_category ON public.external_contents(category);
CREATE INDEX IF NOT EXISTS idx_external_contents_space ON public.external_contents(related_space_id);
CREATE INDEX IF NOT EXISTS idx_external_contents_program ON public.external_contents(related_program_id);

-- ============================================================
-- CONTENT TAG MAPS (콘텐츠 ↔ 태그 다대다 매핑)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.content_tag_maps (
  external_content_id UUID NOT NULL REFERENCES public.external_contents(id) ON DELETE CASCADE,
  tag_id              UUID NOT NULL REFERENCES public.content_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (external_content_id, tag_id)
);
CREATE INDEX IF NOT EXISTS idx_tag_maps_content ON public.content_tag_maps(external_content_id);
CREATE INDEX IF NOT EXISTS idx_tag_maps_tag ON public.content_tag_maps(tag_id);

-- ============================================================
-- FETCH LOGS (수집 로그)
-- 성공/실패/오류 기록, 자동화 모니터링
-- ============================================================
CREATE TABLE IF NOT EXISTS public.fetch_logs (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id      UUID REFERENCES public.content_sources(id) ON DELETE CASCADE,
  platform       TEXT,
  status         TEXT NOT NULL CHECK (status IN ('success','partial','error')),
  items_found    INTEGER DEFAULT 0,
  items_new      INTEGER DEFAULT 0,
  items_skipped  INTEGER DEFAULT 0,
  error_message  TEXT,
  duration_ms    INTEGER,
  fetched_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fetch_logs_source ON public.fetch_logs(source_id);
CREATE INDEX IF NOT EXISTS idx_fetch_logs_status ON public.fetch_logs(status);
CREATE INDEX IF NOT EXISTS idx_fetch_logs_fetched ON public.fetch_logs(fetched_at DESC);

-- ============================================================
-- BLOG POSTS 확장: tags, meta SEO, space/program 연결
-- ============================================================
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS tags           JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS meta_title     TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS og_image_url   TEXT,
  ADD COLUMN IF NOT EXISTS related_space_id   UUID REFERENCES public.spaces(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS related_program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL;

-- ============================================================
-- PROGRAMS 확장: space_id 외래키, organizer, is_free, tags
-- ============================================================
ALTER TABLE public.programs
  ADD COLUMN IF NOT EXISTS space_id       UUID REFERENCES public.spaces(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS organizer      TEXT,
  ADD COLUMN IF NOT EXISTS is_free        BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS tags           JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS meta_title     TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT;

CREATE INDEX IF NOT EXISTS idx_programs_space ON public.programs(space_id);

-- ============================================================
-- ARCHIVE ITEMS 확장: program_id, video_url, tags
-- ============================================================
ALTER TABLE public.archive_items
  ADD COLUMN IF NOT EXISTS program_id     UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS video_url      TEXT,
  ADD COLUMN IF NOT EXISTS tags           JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS meta_title     TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT;

CREATE INDEX IF NOT EXISTS idx_archive_program ON public.archive_items(program_id);

-- ============================================================
-- SPACES 확장: meta SEO, name_en
-- ============================================================
ALTER TABLE public.spaces
  ADD COLUMN IF NOT EXISTS name_en        TEXT,
  ADD COLUMN IF NOT EXISTS meta_title     TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- ============================================================
-- updated_at 트리거 확장
-- ============================================================
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['content_sources','external_contents'] LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_set_updated_at ON public.%I;
      CREATE TRIGGER trg_set_updated_at
        BEFORE UPDATE ON public.%I
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    ', tbl, tbl);
  END LOOP;
END;
$$;

-- ============================================================
-- ROW LEVEL SECURITY — 신규 테이블
-- ============================================================
ALTER TABLE public.content_sources  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_tags     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_tag_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fetch_logs       ENABLE ROW LEVEL SECURITY;

-- content_sources: 관리자만 읽기/쓰기
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='content_sources' AND policyname='sources_admin_all') THEN
    CREATE POLICY "sources_admin_all" ON public.content_sources FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- external_contents: published/featured는 공개 읽기, 나머지는 관리자
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='external_contents' AND policyname='ext_contents_public_read') THEN
    CREATE POLICY "ext_contents_public_read" ON public.external_contents
      FOR SELECT USING (visibility_status IN ('published','featured'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='external_contents' AND policyname='ext_contents_admin_all') THEN
    CREATE POLICY "ext_contents_admin_all" ON public.external_contents
      FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- content_tags: 공개 읽기, 관리자 쓰기
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='content_tags' AND policyname='tags_public_read') THEN
    CREATE POLICY "tags_public_read" ON public.content_tags FOR SELECT USING (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='content_tags' AND policyname='tags_admin_write') THEN
    CREATE POLICY "tags_admin_write" ON public.content_tags FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- content_tag_maps: 공개 읽기, 관리자 쓰기
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='content_tag_maps' AND policyname='tag_maps_public_read') THEN
    CREATE POLICY "tag_maps_public_read" ON public.content_tag_maps FOR SELECT USING (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='content_tag_maps' AND policyname='tag_maps_admin_write') THEN
    CREATE POLICY "tag_maps_admin_write" ON public.content_tag_maps FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- fetch_logs: 관리자 전용
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='fetch_logs' AND policyname='fetch_logs_admin_all') THEN
    CREATE POLICY "fetch_logs_admin_all" ON public.fetch_logs FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- ============================================================
-- RPC: 집계 함수 — 외부 콘텐츠 플랫폼별 카운트
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_external_content_stats()
RETURNS TABLE(platform TEXT, total BIGINT, pending BIGINT, published BIGINT, hidden BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    platform,
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE visibility_status = 'pending') AS pending,
    COUNT(*) FILTER (WHERE visibility_status IN ('published','featured')) AS published,
    COUNT(*) FILTER (WHERE visibility_status = 'hidden') AS hidden
  FROM public.external_contents
  GROUP BY platform;
$$;

-- ============================================================
-- SETTINGS 확장: 외부 API 키 및 자동화 설정
-- ============================================================
INSERT INTO public.settings (key, value) VALUES
  ('youtube_api_key', ''),
  ('instagram_access_token', ''),
  ('x_bearer_token', ''),
  ('rss_proxy_url', 'https://api.allorigins.win/get?url='),
  ('auto_fetch_enabled', 'false'),
  ('default_visibility', 'pending')
ON CONFLICT (key) DO NOTHING;
