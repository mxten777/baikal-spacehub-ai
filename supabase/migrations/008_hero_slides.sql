-- ============================================================
-- The Lit — Migration 008: Hero Slides CMS
-- ============================================================

-- ============================================================
-- HERO SLIDES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                 TEXT NOT NULL DEFAULT '',
  subtitle              TEXT,
  description           TEXT,
  desktop_image_url     TEXT,
  mobile_image_url      TEXT,
  primary_button_text   TEXT,
  primary_button_link   TEXT,
  secondary_button_text TEXT,
  secondary_button_link TEXT,
  display_order         INTEGER NOT NULL DEFAULT 0,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  publish_start_at      TIMESTAMPTZ,
  publish_end_at        TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hero_slides_active ON public.hero_slides(is_active);
CREATE INDEX IF NOT EXISTS idx_hero_slides_order  ON public.hero_slides(display_order);

-- ============================================================
-- updated_at trigger
-- ============================================================
DROP TRIGGER IF EXISTS trg_set_updated_at ON public.hero_slides;
CREATE TRIGGER trg_set_updated_at
  BEFORE UPDATE ON public.hero_slides
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'hero_slides' AND policyname = 'hero_slides_public_read'
  ) THEN
    CREATE POLICY "hero_slides_public_read"
      ON public.hero_slides FOR SELECT USING (TRUE);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'hero_slides' AND policyname = 'hero_slides_admin_write'
  ) THEN
    CREATE POLICY "hero_slides_admin_write"
      ON public.hero_slides FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- ============================================================
-- Seed: 기존 HeroSection 하드코딩 슬라이드 3개 초기 데이터
-- ============================================================
INSERT INTO public.hero_slides (
  title, subtitle, desktop_image_url,
  primary_button_text, primary_button_link,
  secondary_button_text, secondary_button_link,
  display_order, is_active
) VALUES
  (
    E'문화가 흐르는\n공간',
    'A Space Where Culture Flows',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80',
    'Programs', '/programs',
    'Space Rental', '/contact?type=rental',
    1, TRUE
  ),
  (
    E'예술과 삶이\n만나는 곳',
    'Where Art Meets Life',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80',
    'Programs', '/programs',
    'Space Rental', '/contact?type=rental',
    2, TRUE
  ),
  (
    E'비범한 경험을\n위한 공간',
    'Space for Extraordinary Experiences',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1920&q=80',
    'Programs', '/programs',
    'Space Rental', '/contact?type=rental',
    3, TRUE
  )
ON CONFLICT DO NOTHING;
