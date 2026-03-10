-- ============================================================
-- The Lit — Supabase Initial Migration
-- Run via: Supabase Dashboard > SQL Editor, or supabase db push
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SPACES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.spaces (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                     TEXT NOT NULL,
  slug                     TEXT NOT NULL UNIQUE,
  description              TEXT,
  category                 TEXT NOT NULL DEFAULT 'other'
                             CHECK (category IN ('cafe','garden','studio','storage','hall','other')),
  capacity                 INTEGER,
  size_sqm                 NUMERIC(10,2),
  rental_price_per_hour    NUMERIC(12,0),
  features                 JSONB DEFAULT '[]',
  recommended_use          JSONB DEFAULT '[]',
  images                   JSONB DEFAULT '[]',
  cover_image_url          TEXT,
  is_available             BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order               INTEGER NOT NULL DEFAULT 0,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_spaces_slug ON public.spaces(slug);
CREATE INDEX idx_spaces_category ON public.spaces(category);

-- ============================================================
-- PROGRAMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.programs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title               TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  description         TEXT,
  content             TEXT,
  category            TEXT NOT NULL DEFAULT 'event'
                        CHECK (category IN ('exhibition','performance','lecture','workshop','event')),
  status              TEXT NOT NULL DEFAULT 'upcoming'
                        CHECK (status IN ('upcoming','ongoing','closed','cancelled')),
  start_date          TIMESTAMPTZ,
  end_date            TIMESTAMPTZ,
  venue               TEXT,
  price               NUMERIC(12,0),
  capacity            INTEGER,
  registration_url    TEXT,
  cover_image_url     TEXT,
  images              JSONB DEFAULT '[]',
  is_featured         BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order          INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_programs_slug ON public.programs(slug);
CREATE INDEX idx_programs_status ON public.programs(status);
CREATE INDEX idx_programs_start_date ON public.programs(start_date);

-- ============================================================
-- ARCHIVE ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.archive_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  description  TEXT,
  content      TEXT,
  category     TEXT NOT NULL,
  date         DATE,
  images       JSONB DEFAULT '[]',
  cover_image_url TEXT,
  is_featured  BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_archive_slug ON public.archive_items(slug);
CREATE INDEX idx_archive_category ON public.archive_items(category);

-- ============================================================
-- BLOG CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BLOG POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  excerpt          TEXT,
  content          TEXT NOT NULL DEFAULT '',
  cover_image_url  TEXT,
  category_id      UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  author_id        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  view_count       INTEGER NOT NULL DEFAULT 0,
  is_published     BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured      BOOLEAN NOT NULL DEFAULT FALSE,
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON public.blog_posts(is_published, published_at DESC);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category_id);

-- RPC to safely increment view_count
CREATE OR REPLACE FUNCTION public.increment_view_count(post_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.blog_posts SET view_count = view_count + 1 WHERE id = post_id;
END;
$$;

-- ============================================================
-- MEDIA ITEMS (YouTube / Instagram / X)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.media_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform        TEXT NOT NULL CHECK (platform IN ('youtube','instagram','x')),
  url             TEXT NOT NULL,
  title           TEXT,
  description     TEXT,
  thumbnail_url   TEXT,
  published_at    TIMESTAMPTZ,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_media_platform ON public.media_items(platform);
CREATE INDEX idx_media_featured ON public.media_items(is_featured);

-- ============================================================
-- INQUIRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.inquiries (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  subject       TEXT NOT NULL,
  message       TEXT NOT NULL,
  inquiry_type  TEXT NOT NULL DEFAULT 'general'
                  CHECK (inquiry_type IN ('rental','collaboration','general','media')),
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','reviewing','replied','closed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_inquiries_status ON public.inquiries(status);
CREATE INDEX idx_inquiries_created ON public.inquiries(created_at DESC);

-- ============================================================
-- SETTINGS (key/value store)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.settings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         TEXT NOT NULL UNIQUE,
  value       TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default settings
INSERT INTO public.settings (key, value) VALUES
  ('site_name', 'The Lit'),
  ('site_description', '문화를 경험하는 공간, The Lit'),
  ('contact_email', 'hello@thelit.kr'),
  ('contact_phone', ''),
  ('address', ''),
  ('instagram_url', ''),
  ('youtube_url', ''),
  ('x_url', '')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- updated_at auto-update trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'profiles','spaces','programs','archive_items',
    'blog_posts','media_items','inquiries','settings'
  ] LOOP
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
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaces          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings        ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- SPACES: public read, admin write
CREATE POLICY "spaces_public_read"  ON public.spaces FOR SELECT USING (TRUE);
CREATE POLICY "spaces_admin_write"  ON public.spaces FOR ALL USING (public.is_admin());

-- PROGRAMS: public read, admin write
CREATE POLICY "programs_public_read"  ON public.programs FOR SELECT USING (TRUE);
CREATE POLICY "programs_admin_write"  ON public.programs FOR ALL USING (public.is_admin());

-- ARCHIVE: public read, admin write
CREATE POLICY "archive_public_read"  ON public.archive_items FOR SELECT USING (TRUE);
CREATE POLICY "archive_admin_write"  ON public.archive_items FOR ALL USING (public.is_admin());

-- BLOG CATEGORIES: public read, admin write
CREATE POLICY "blogcat_public_read"  ON public.blog_categories FOR SELECT USING (TRUE);
CREATE POLICY "blogcat_admin_write"  ON public.blog_categories FOR ALL USING (public.is_admin());

-- BLOG POSTS: published posts public, admin sees all + can write
CREATE POLICY "blog_public_read"    ON public.blog_posts FOR SELECT USING (is_published = TRUE);
CREATE POLICY "blog_admin_read"     ON public.blog_posts FOR SELECT USING (public.is_admin());
CREATE POLICY "blog_admin_write"    ON public.blog_posts FOR ALL USING (public.is_admin());

-- MEDIA: public read, admin write
CREATE POLICY "media_public_read"   ON public.media_items FOR SELECT USING (TRUE);
CREATE POLICY "media_admin_write"   ON public.media_items FOR ALL USING (public.is_admin());

-- INQUIRIES: anyone can insert (submit form), admin can read/update
CREATE POLICY "inquiries_public_insert"  ON public.inquiries FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "inquiries_admin_select"   ON public.inquiries FOR SELECT USING (public.is_admin());
CREATE POLICY "inquiries_admin_update"   ON public.inquiries FOR UPDATE USING (public.is_admin());

-- SETTINGS: public read, admin write
CREATE POLICY "settings_public_read"   ON public.settings FOR SELECT USING (TRUE);
CREATE POLICY "settings_admin_write"   ON public.settings FOR ALL USING (public.is_admin());

-- PROFILES: users see own row, admins see all
CREATE POLICY "profiles_own"        ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_admin"      ON public.profiles FOR ALL USING (public.is_admin());
