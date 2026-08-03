-- ============================================================
-- Migration 019: Brand CMS — Experience Journey, Wedding Experiences, SEO
-- ============================================================
-- about_content에 journey_steps, wedding_experiences, SEO 필드 추가
-- 기존 테이블 재사용 / 신규 테이블 없음

ALTER TABLE public.about_content
  ADD COLUMN IF NOT EXISTS journey_steps JSONB NOT NULL DEFAULT '[
    {"number":"01","emotion":"Arrival","desc":"골목 끝, 예상하지 못한 공간과 마주합니다.","is_visible":true},
    {"number":"02","emotion":"Curiosity","desc":"붉은 대문과 살구나무를 지나며 궁금증이 시작됩니다.","is_visible":true},
    {"number":"03","emotion":"Dark Passage","desc":"어두운 30m 통로가 일상의 감각을 잠시 멈추게 합니다.","is_visible":true},
    {"number":"04","emotion":"Transformation","desc":"빛을 향해 걷는 동안 생각과 시선이 전환됩니다.","is_visible":true},
    {"number":"05","emotion":"Light","desc":"통로의 끝에서 정원과 햇살이 한 번에 열립니다.","is_visible":true},
    {"number":"06","emotion":"WOW","desc":"100년 소나무와 천연 잔디가 예상 밖의 장면을 만듭니다.","is_visible":true},
    {"number":"07","emotion":"Memory","desc":"그 순간은 촬영, 행사, 웨딩, 휴식의 기억으로 남습니다.","is_visible":true}
  ]'::jsonb,

  ADD COLUMN IF NOT EXISTS wedding_experiences JSONB NOT NULL DEFAULT '[
    {
      "number":"01","track":"House Wedding",
      "keywords":["Warm","Intimate","Private","Home"],
      "title":"집 앞마당에서",
      "desc":"카페 본관과 잔디정원이 하나의 집처럼 연결됩니다. 가까운 사람들과 오래 기억할 수 있는 따뜻하고 프라이빗한 웨딩.",
      "recommended":["소규모 웨딩","가족 중심 예식","하우스 파티형","브런치 웨딩"],
      "venue":"카페 본관 + 잔디정원",
      "cta_text":"House Wedding 문의","cta_href":"/contact","is_visible":true,"sort_order":1
    },
    {
      "number":"02","track":"Garden Wedding",
      "keywords":["Nature","Unplugged","Pine Garden","Ceremony"],
      "title":"100년 소나무 아래",
      "desc":"100년 소나무와 천연 잔디가 두 사람의 가장 자연스러운 순간을 감싸는 야외 웨딩.",
      "recommended":["야외 예식","자연 중심 웨딩","계절감 있는 웨딩","소규모 리셉션"],
      "venue":"100년 소나무 + 천연 잔디정원",
      "cta_text":"Garden Wedding 문의","cta_href":"/contact","is_visible":true,"sort_order":2
    },
    {
      "number":"03","track":"Studio Wedding",
      "keywords":["Industrial","Editorial","Modern","Concept"],
      "title":"빛과 여백의 공간에서",
      "desc":"시멘트 블록과 빛, 여백만으로도 하나의 화보처럼 완성되는 도시적이고 감각적인 웨딩.",
      "recommended":["콘셉트 웨딩","애프터파티","웨딩 촬영","실내 예식"],
      "venue":"Storage 1 / Storage 2",
      "cta_text":"Studio Wedding 문의","cta_href":"/contact","is_visible":true,"sort_order":3
    }
  ]'::jsonb,

  ADD COLUMN IF NOT EXISTS seo_title       TEXT NOT NULL DEFAULT 'Brand Story — THE LIT | 빛을 향해 걷는 이야기',
  ADD COLUMN IF NOT EXISTS seo_description TEXT NOT NULL DEFAULT 'THE LIT를 만든 이유, 빛의 철학, 30m의 여정. 더릿 브랜드 스토리와 창립 철학을 소개합니다.',
  ADD COLUMN IF NOT EXISTS seo_og_image    TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_keywords    TEXT NOT NULL DEFAULT '더릿 브랜드 스토리, 복합문화공간 철학, THE LIT 창립 이야기, 빛의 철학, Walk Into The Light';
