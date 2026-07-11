-- ============================================================
-- The Lit — Migration 009: About Page CMS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.about_content (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Hero
  hero_image_url        TEXT DEFAULT 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1920&q=80',
  hero_eyebrow          TEXT NOT NULL DEFAULT 'About The Lit',
  hero_title_line1      TEXT NOT NULL DEFAULT '문화의 불꽃을',
  hero_title_line2      TEXT NOT NULL DEFAULT '켜는 공간',
  -- Mission
  mission_quote         TEXT NOT NULL DEFAULT '"더릿은 예술가, 크리에이터, 브랜드, 그리고 문화를 사랑하는 모든 이들이 자신의 이야기를 펼칠 수 있는 최적의 무대를 제공합니다."',
  mission_description   TEXT NOT NULL DEFAULT '2018년, 서울 연남동의 낡은 빈 창고에서 시작된 더릿은 지금 이 도시에서 가장 활발한 문화 허브 중 하나가 되었습니다.',
  -- Story
  story_eyebrow         TEXT NOT NULL DEFAULT 'Our Story',
  story_title_line1     TEXT NOT NULL DEFAULT '작은 창고에서',
  story_title_line2     TEXT NOT NULL DEFAULT '복합문화공간으로',
  story_paragraph_1     TEXT NOT NULL DEFAULT '더릿(The Lit)의 이름은 ''불을 밝히다(to light)''에서 왔습니다. 어두운 공간에 빛을 더하듯, 더릿은 사람들의 창의적 에너지에 적절한 공간과 환경을 제공합니다.',
  story_paragraph_2     TEXT NOT NULL DEFAULT '한때 낡고 버려진 창고였던 이 공간은 이제 전시, 공연, 강연, 촬영 등 다양한 문화 활동의 터전이 되었습니다.',
  story_paragraph_3     TEXT NOT NULL DEFAULT '우리는 단순히 공간을 임대하는 것이 아니라, 문화적 경험을 함께 설계하고 실현하는 파트너입니다.',
  -- Timeline (JSONB array of {year, title, desc})
  timeline              JSONB NOT NULL DEFAULT '[
    {"year":"2018","title":"더릿의 시작","desc":"서울 연남동의 낡은 창고를 문화공간으로 변신시키며 더릿의 여정이 시작되었습니다."},
    {"year":"2020","title":"카페 & 가든 오픈","desc":"커뮤니티 중심의 카페와 야외 가든을 추가하며 복합문화공간으로 성장했습니다."},
    {"year":"2022","title":"스튜디오 & 스토리지","desc":"전문 촬영 스튜디오와 대형 다목적 홀 스토리지를 완성해 전면 복합문화공간이 되었습니다."},
    {"year":"2024","title":"더릿 플랫폼화","desc":"물리적 공간을 넘어 디지털 플랫폼으로 확장, 더 많은 문화 크리에이터와 연결됩니다."}
  ]'::jsonb,
  -- Values (JSONB array of {icon, title, desc})
  values_eyebrow        TEXT NOT NULL DEFAULT 'Core Values',
  values_title          TEXT NOT NULL DEFAULT '우리가 믿는 것들',
  brand_values          JSONB NOT NULL DEFAULT '[
    {"icon":"✦","title":"개방성","desc":"누구에게나 열려있는 공간. 다양한 배경과 관심사를 가진 사람들이 교류하는 곳입니다."},
    {"icon":"✦","title":"지속성","desc":"일회성 이벤트가 아닌, 지속 가능한 문화 생태계를 만들어갑니다."},
    {"icon":"✦","title":"진정성","desc":"상업적 논리보다 진정한 문화적 가치를 우선합니다."},
    {"icon":"✦","title":"공동체","desc":"공간을 통해 사람들이 연결되고, 함께 성장하는 커뮤니티를 지향합니다."}
  ]'::jsonb,
  -- CTA
  cta_title             TEXT NOT NULL DEFAULT '더릿과 함께하세요',
  cta_description       TEXT NOT NULL DEFAULT '공간 대관부터 협업 프로젝트까지, 더릿이 함께합니다.',
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default row (single-row table)
INSERT INTO public.about_content (id) VALUES (uuid_generate_v4())
  ON CONFLICT DO NOTHING;

-- updated_at trigger
DROP TRIGGER IF EXISTS trg_about_content_updated_at ON public.about_content;
CREATE TRIGGER trg_about_content_updated_at
  BEFORE UPDATE ON public.about_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'about_content' AND policyname = 'about_content_public_read'
  ) THEN
    CREATE POLICY "about_content_public_read"
      ON public.about_content FOR SELECT USING (TRUE);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'about_content' AND policyname = 'about_content_admin_all'
  ) THEN
    CREATE POLICY "about_content_admin_all"
      ON public.about_content FOR ALL
      USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;
