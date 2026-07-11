-- ============================================================
-- The Lit — Migration 010: Home BrandIntroSection CMS
-- ============================================================

ALTER TABLE public.about_content
  ADD COLUMN IF NOT EXISTS brand_intro_eyebrow      TEXT NOT NULL DEFAULT 'Our Philosophy',
  ADD COLUMN IF NOT EXISTS brand_intro_title_line1  TEXT NOT NULL DEFAULT '문화가 숨쉬는',
  ADD COLUMN IF NOT EXISTS brand_intro_title_line2  TEXT NOT NULL DEFAULT '공간의 힘',
  ADD COLUMN IF NOT EXISTS brand_intro_paragraph_1  TEXT NOT NULL DEFAULT '더릿(The Lit)은 서울 한복판에서 문화와 예술, 그리고 사람이 만나는 복합문화공간입니다. 단순한 장소가 아닌, 창의적 에너지가 교류하고 새로운 이야기가 시작되는 플랫폼입니다.',
  ADD COLUMN IF NOT EXISTS brand_intro_paragraph_2  TEXT NOT NULL DEFAULT '전시부터 공연, 강연, 워크숍, 브랜드 이벤트까지 — 모든 문화 활동을 위한 최적의 환경을 제공합니다.',
  ADD COLUMN IF NOT EXISTS brand_intro_image_url    TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  ADD COLUMN IF NOT EXISTS brand_intro_pillars      JSONB NOT NULL DEFAULT '[
    {"label":"전시","en":"Exhibition"},
    {"label":"공연","en":"Performance"},
    {"label":"강연","en":"Lecture"},
    {"label":"워크숍","en":"Workshop"},
    {"label":"촬영","en":"Photoshoot"},
    {"label":"브랜드 행사","en":"Brand Event"}
  ]'::jsonb;
