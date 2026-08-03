-- Phase 1: Experience First — CMS 카피 업데이트
-- About content, Hero slides, Spaces description 재작성

-- ── About Content ─────────────────────────────────────────────────────────────
UPDATE about_content SET
  hero_eyebrow            = 'Brand Story',
  hero_title_line1        = '빛을 향해',
  hero_title_line2        = '걷는 이야기',
  mission_quote           = '"우리는 공간이 아니라 경험을 만들었습니다. 들어서는 순간부터 나가는 순간까지, 그 사이의 모든 감각이 하나의 이야기가 되는 곳."',
  mission_description     = '서울의 오래된 골목 안, 낡은 창고가 가진 어둠과 빛의 대비 속에서 우리는 하나의 여정을 발견했습니다. 그것이 더릿의 시작입니다.',
  story_eyebrow           = 'Why THE LIT',
  story_title_line1       = '우리는 왜',
  story_title_line2       = '이 공간을 만들었나',
  story_paragraph_1       = '더릿은 공간을 짓지 않았습니다. 경험을 설계했습니다. 서울의 오래된 골목 안, 아무도 주목하지 않던 한 채의 집이 있었습니다. 우리는 그 집이 가진 어둠과 빛의 대비 속에서 하나의 여정을 발견했습니다.',
  story_paragraph_2       = '골목, 붉은 대문, 살구나무, 그리고 30m의 어두운 통로 끝에 쏟아지는 빛. 들어오는 사람은 모두 같은 경험을 합니다. 그것이 더릿입니다.',
  story_paragraph_3       = '더릿(The Lit)의 이름은 ''빛을 밝히다(to light)''에서 왔습니다. 우리는 어둠이 있어야 빛이 빛난다는 것을 압니다.',
  values_eyebrow          = 'Light Philosophy',
  values_title            = '어둠이 있어야 빛이 빛난다',
  brand_values            = '[{"icon":"◐","title":"Dark","desc":"어둠은 공포가 아니라 가능성입니다. 출발점이 어두울수록 빛의 도착이 강렬합니다."},{"icon":"→","title":"Passage","desc":"통과하는 과정이 경험을 완성합니다. 30m의 여정이 더릿의 본질입니다."},{"icon":"✦","title":"Light","desc":"빛은 결과가 아니라 상태입니다. 더릿에서의 모든 시간이 빛입니다."},{"icon":"○","title":"Memory","desc":"경험은 공간을 떠나도 남습니다. 더릿은 기억 속에 살아있습니다."}]',
  cta_title               = 'Walk Into The Light',
  cta_description         = '더릿의 경험을 직접 시작하세요.',
  brand_intro_eyebrow     = 'The Passage of Transformation',
  brand_intro_title_line1 = '30m,',
  brand_intro_title_line2 = '어둠에서 빛으로',
  brand_intro_paragraph_1 = '골목을 걸어 들어오는 순간, 당신의 경험이 시작됩니다. 더릿은 단순한 공간이 아닙니다. 어둠에서 빛으로 이어지는 30m의 여정 — 이것이 THE LIT입니다.',
  brand_intro_paragraph_2 = '카페, 정원, 스튜디오, 홀, 루프탑. 다섯 개의 공간이 하나의 경험으로 연결됩니다.',
  brand_intro_pillars     = '[{"label":"골목","en":"The Alley"},{"label":"빛의 정원","en":"Light Garden"},{"label":"스튜디오","en":"Studio"},{"label":"웨딩","en":"Wedding"},{"label":"촬영","en":"Production"},{"label":"브랜드 행사","en":"Brand Event"}]',
  updated_at              = now();

-- ── Hero Slides ────────────────────────────────────────────────────────────────
UPDATE hero_slides SET
  title                 = E'어둠을 지나면\n빛이 있습니다',
  subtitle              = 'Walk Into The Light',
  primary_button_text   = 'Experience THE LIT',
  primary_button_link   = '/about',
  secondary_button_text = 'Explore Spaces',
  secondary_button_link = '/spaces',
  updated_at            = now()
WHERE display_order = 1;

UPDATE hero_slides SET
  title                 = E'30m,\n한 편의 이야기',
  subtitle              = 'The Passage of Transformation',
  primary_button_text   = 'Our Story',
  primary_button_link   = '/about',
  secondary_button_text = 'Explore Spaces',
  secondary_button_link = '/spaces',
  updated_at            = now()
WHERE display_order = 2;

UPDATE hero_slides SET
  title                 = E'빛이 머무는\n다섯 개의 공간',
  subtitle              = 'Cafe · Garden · Studio · Box Room · Rooftop',
  primary_button_text   = 'Discover Spaces',
  primary_button_link   = '/spaces',
  secondary_button_text = 'Wedding',
  secondary_button_link = '/wedding',
  updated_at            = now()
WHERE display_order = 3;

-- ── Spaces — experience-centric descriptions ───────────────────────────────────
UPDATE spaces SET
  description = '커피 향과 자연광이 만나는 곳. 30m 여정의 끝, 빛이 가장 따뜻하게 머무는 공간입니다. 낭독회부터 소셜 나이트, 팝업 마켓, 브랜드 쇼룸까지 — 더릿 경험의 시작점이자 마지막 기억이 되는 카페입니다.',
  updated_at  = now()
WHERE slug = 'cafe';

UPDATE spaces SET
  description = '담장 너머 갑자기 열리는 하늘. 살구나무 아래, 사계절이 다른 표정을 가진 정원. 어둠의 통로를 지나 처음 빛을 만나는 순간의 공간입니다. 이 해방감이 더릿의 WOW 포인트입니다. 웨딩 리셉션, 가든 파티, 야외 공연, 브랜드 런칭에 최적입니다.',
  updated_at  = now()
WHERE slug = 'garden';

UPDATE spaces SET
  description = '낡은 창고를 해체하고 다시 세운 흰 공간. 아무것도 없는 듯 보이지만 모든 가능성이 열려 있습니다. 사이클로라마 너머 자연광이 쏟아지는 유일한 스튜디오로, 여기서 찍히는 모든 것은 더릿의 빛을 담습니다. 뮤직비디오·화보·CF·소규모 공연에 최적입니다.',
  updated_at  = now()
WHERE slug = 'studio';

UPDATE spaces SET
  description = '높이 5.5m, 완전히 열린 공간. 어떤 무대든, 어떤 전시든, 어떤 이야기든 담을 수 있습니다. 오픈 플로어와 전시 레일, 전문 조명으로 자유로운 공간 구성이 가능합니다. 대형 브랜드 이벤트·컨퍼런스·갈라 디너·아트페어에 최적입니다.',
  updated_at  = now()
WHERE slug = 'storage';
