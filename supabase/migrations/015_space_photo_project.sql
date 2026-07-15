-- 공간(spaces)과 포토 프로젝트(photo_projects) 연결
-- spaces 테이블에 photo_project_id 외래키 추가

ALTER TABLE public.spaces
  ADD COLUMN IF NOT EXISTS photo_project_id UUID
    REFERENCES public.photo_projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_spaces_photo_project_id
  ON public.spaces(photo_project_id);

COMMENT ON COLUMN public.spaces.photo_project_id IS '연결된 포토 프로젝트 ID (photo_projects.id)';
