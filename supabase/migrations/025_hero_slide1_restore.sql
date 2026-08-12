-- ============================================================
-- 025_hero_slide1_restore.sql
-- Hero 1번 슬라이드 복원 + BeyondSpace1.jpg WebP 이미지 적용
-- display_order=1 이 존재하면 UPDATE, 없으면 INSERT
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.hero_slides WHERE display_order = 1) THEN
    UPDATE public.hero_slides SET
      title                 = E'BEYOND SPACE,\nSTORIES BEGIN.',
      subtitle              = '공간을 넘어, 이야기가 시작되는 곳',
      description           = NULL,
      desktop_image_url     = '/images/hero/hero-1.webp',
      mobile_image_url      = '/images/hero/hero-1-mobile.webp',
      primary_button_text   = 'Experience THE LIT',
      primary_button_link   = '/about',
      secondary_button_text = 'Explore Spaces',
      secondary_button_link = '/spaces',
      is_active             = TRUE,
      updated_at            = now()
    WHERE display_order = 1;
  ELSE
    INSERT INTO public.hero_slides (
      title, subtitle, description,
      desktop_image_url, mobile_image_url,
      primary_button_text, primary_button_link,
      secondary_button_text, secondary_button_link,
      display_order, is_active
    ) VALUES (
      E'BEYOND SPACE,\nSTORIES BEGIN.',
      '공간을 넘어, 이야기가 시작되는 곳',
      NULL,
      '/images/hero/hero-1.webp',
      '/images/hero/hero-1-mobile.webp',
      'Experience THE LIT', '/about',
      'Explore Spaces', '/spaces',
      1, TRUE
    );
  END IF;
END $$;
