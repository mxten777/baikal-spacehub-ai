-- ============================================================
-- The Lit — Migration 020: photos 공개 읽기 RLS 정책
-- ============================================================
-- 목적: project_stage='web' + upload_status='completed' 인 사진을
--       비인증(anon) 사용자도 조회할 수 있도록 RLS 정책 추가.
--       이 정책 없이는 HeroSection의 mainPhotos 폴백이 공개 사이트에서
--       항상 빈 배열을 반환하여 사진 자동 할당이 동작하지 않음.
-- 적용: Supabase Dashboard > SQL Editor

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'photos'
      AND policyname = 'photos_public_web_read'
  ) THEN
    CREATE POLICY "photos_public_web_read" ON public.photos
      FOR SELECT TO anon
      USING (
        project_stage  = 'web' AND
        upload_status  = 'completed'
      );
  END IF;
END;
$$;
