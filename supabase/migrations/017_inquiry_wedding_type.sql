-- ============================================================
-- 017_inquiry_wedding_type.sql
-- inquiry_type CHECK 제약조건에 'wedding' 값 추가
--
-- 적용 전 기존 데이터 검증 (실행 후 0 rows 이어야 안전):
--   SELECT id, inquiry_type FROM public.inquiries
--   WHERE inquiry_type NOT IN ('rental','collaboration','general','media','wedding');
--
-- Supabase 적용 방법:
--   1. Supabase Dashboard → SQL Editor → 이 파일 내용 붙여넣기 후 실행
--   2. 또는: supabase db push (Supabase CLI, 로컬 .env 설정 필요)
-- ============================================================

-- Step 1: 기존 데이터 중 새 허용값 범위 밖의 행이 있으면 마이그레이션 중단
DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM public.inquiries
  WHERE inquiry_type NOT IN ('rental', 'collaboration', 'general', 'media', 'wedding');

  IF invalid_count > 0 THEN
    RAISE EXCEPTION
      'Migration 017 중단: inquiries 테이블에 허용되지 않는 inquiry_type 값이 % 건 존재합니다. 데이터를 정리 후 다시 실행하세요.',
      invalid_count;
  END IF;
END;
$$;

-- Step 2: 기존 CHECK 제약조건 제거
ALTER TABLE public.inquiries
  DROP CONSTRAINT IF EXISTS inquiries_inquiry_type_check;

-- Step 3: 'wedding'이 포함된 새 CHECK 제약조건 추가
ALTER TABLE public.inquiries
  ADD CONSTRAINT inquiries_inquiry_type_check
  CHECK (inquiry_type IN ('rental', 'collaboration', 'general', 'media', 'wedding'));

-- 확인용 (선택)
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'public.inquiries'::regclass AND contype = 'c';
