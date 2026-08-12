-- ============================================================
-- 024_wedding_story.sql
-- Wedding Story CMS 필드 추가
-- 대상: about_content
-- ============================================================

ALTER TABLE public.about_content
  ADD COLUMN IF NOT EXISTS wedding_story_title TEXT NOT NULL DEFAULT '틀에 박힌 웨딩이 아니라,
두 사람만의 장면을',

  ADD COLUMN IF NOT EXISTS wedding_story_paragraphs JSONB NOT NULL DEFAULT '[
    "THE LIT는 단순한 웨딩홀이 아닙니다. 문화가 술 쉬는 복합공간이 웨딩의 무대가 될 때, 그 하루는 하나의 작품이 됩니다.",
    "House Wedding, Garden Wedding, Studio Wedding. 하나의 공간 안에서 세 가지 다른 이야기가 펼쳐집니다. 소나무 정원의 야외 예식, 스튜디오의 화보 같은 장면, 따뜻한 홈 파티 분위기까지.",
    "불필요한 것은 덧고, 두 사람의 이야기에만 집중합니다. THE LIT의 웨딩은 절제와 감각이 만나는 지점에 있습니다."
  ]'::jsonb;
