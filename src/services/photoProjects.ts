import { supabase } from "../lib/supabase";
import type {
  PhotoProject,
  PhotoRecord,
  CreatePhotoProjectInput,
  UpdatePhotoProjectInput,
  UpdatePhotoMetaInput,
  ProjectCategory,
  ProjectStage,
} from "../types";

// ── 상수 ────────────────────────────────────────────────────

const DEFAULT_STAGES: ProjectStage[] = [
  "source",
  "selected",
  "edited",
  "web",
  "pdf",
];
const SLUG_MAX_ATTEMPTS = 20;

// ── Slug 생성 유틸 ──────────────────────────────────────────

/**
 * name을 URL-safe slug로 변환한다.
 * - 영문 소문자 변환
 * - 앞뒤 공백 제거
 * - 연속된 공백·특수문자를 하이픈으로 변환
 * - 연속 하이픈 제거
 * - 시작·끝 하이픈 제거
 * - 한글은 제거하지 않음
 *
 * 예: "THE LIT 2026" → "the-lit-2026"
 *     "더릿 웨딩 촬영" → "더릿-웨딩-촬영"
 */
export function generatePhotoProjectSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^\w\s\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/g, " ") // 한글·영문·숫자 외 → 공백
    .replace(/[\s_]+/g, "-") // 공백·언더스코어 → 하이픈
    .replace(/-+/g, "-") // 연속 하이픈 제거
    .replace(/^-+|-+$/g, ""); // 앞뒤 하이픈 제거
}

// ── 내부 헬퍼: 사용 가능한 slug 탐색 ──────────────────────

async function resolveUniqueSlug(base: string): Promise<string> {
  // 첫 시도: 기본 slug
  const { data: existing, error } = await supabase
    .from("photo_projects")
    .select("slug")
    .eq("slug", base)
    .maybeSingle();

  if (error) throw new Error(`slug 확인 실패: ${error.message}`);
  if (!existing) return base;

  // 중복 시 suffix 시도
  for (let i = 2; i <= SLUG_MAX_ATTEMPTS; i++) {
    const candidate = `${base}-${i}`;
    const { data: dup, error: dupErr } = await supabase
      .from("photo_projects")
      .select("slug")
      .eq("slug", candidate)
      .maybeSingle();

    if (dupErr) throw new Error(`slug 확인 실패: ${dupErr.message}`);
    if (!dup) return candidate;
  }

  throw new Error(
    `slug 생성 실패: "${base}" 기준으로 ${SLUG_MAX_ATTEMPTS}회 시도 후에도 사용 가능한 slug를 찾지 못했습니다.`,
  );
}

// ── CRUD 서비스 ─────────────────────────────────────────────

/** photo_projects 전체 목록 조회 (created_at 내림차순) */
export async function listPhotoProjects(): Promise<PhotoProject[]> {
  const { data, error } = await supabase
    .from("photo_projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`photo_projects 조회 실패: ${error.message}`);
  return data ?? [];
}

/** id 기준 단건 조회. 없으면 null, 실제 오류는 예외 발생 */
export async function getPhotoProjectById(
  id: string,
): Promise<PhotoProject | null> {
  const { data, error } = await supabase
    .from("photo_projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`photo_projects 조회 실패: ${error.message}`);
  return data;
}

/** slug 기준 단건 조회. 없으면 null, 실제 오류는 예외 발생 */
export async function getPhotoProjectBySlug(
  slug: string,
): Promise<PhotoProject | null> {
  const { data, error } = await supabase
    .from("photo_projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`photo_projects 조회 실패: ${error.message}`);
  return data;
}

/** photo_project 생성. slug 자동 생성 및 중복 처리 포함 */
export async function createPhotoProject(
  input: CreatePhotoProjectInput,
): Promise<PhotoProject> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const name = input.name.trim();
  const description = input.description ? input.description.trim() : null;
  const categories = [...new Set(input.categories)];
  const stages: ProjectStage[] =
    input.stages && input.stages.length > 0 ? input.stages : DEFAULT_STAGES;

  const baseSlug = generatePhotoProjectSlug(name);
  const slug = await resolveUniqueSlug(baseSlug);

  const { data, error } = await supabase
    .from("photo_projects")
    .insert({
      name,
      slug,
      description,
      categories,
      stages,
      status: "active",
      created_by: user?.id ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`photo_project 생성 실패: ${error.message}`);
  return data;
}

/** photo_project 수정. 전달된 필드만 업데이트, slug 변경 없음 */
export async function updatePhotoProject(
  id: string,
  input: UpdatePhotoProjectInput,
): Promise<PhotoProject> {
  const updates: Partial<{
    name: string;
    description: string | null;
    categories: PhotoProject["categories"];
    stages: PhotoProject["stages"];
    status: PhotoProject["status"];
    updated_at: string;
  }> = { updated_at: new Date().toISOString() };

  if (input.name !== undefined) updates.name = input.name.trim();
  if (input.description !== undefined) {
    updates.description = input.description ? input.description.trim() : null;
  }
  if (input.categories !== undefined)
    updates.categories = [...new Set(input.categories)];
  if (input.stages !== undefined) updates.stages = input.stages;
  if (input.status !== undefined) updates.status = input.status;

  const { data, error } = await supabase
    .from("photo_projects")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`photo_project 수정 실패: ${error.message}`);
  return data;
}

/** photo_project 아카이브 (status → archived). 실제 DELETE 없음 */
export async function archivePhotoProject(id: string): Promise<PhotoProject> {
  const { data, error } = await supabase
    .from("photo_projects")
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`photo_project 아카이브 실패: ${error.message}`);
  return data;
}

// ── Photo counts ────────────────────────────────────────────

/**
 * 프로젝트 내 Category × Stage 사진 수 맵을 반환한다.
 * 키 형식: "{category}/{stage}"  예: "main/source"
 */
export async function getProjectPhotoCounts(
  projectId: string,
): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("photos")
    .select("project_category, project_stage")
    .eq("project_id", projectId)
    .eq("upload_status", "completed");

  if (error) throw new Error(`사진 수 조회 실패: ${error.message}`);

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    if (row.project_category && row.project_stage) {
      const key = `${row.project_category}/${row.project_stage}`;
      counts[key] = (counts[key] ?? 0) + 1;
    }
  }
  return counts;
}

/**
 * Category × Stage 단일 셀의 사진 목록을 반환한다.
 * upload_status = 'completed' 인 레코드만 포함.
 */
export async function getProjectPhotosByCell(
  projectId: string,
  category: ProjectCategory,
  stage: ProjectStage,
): Promise<PhotoRecord[]> {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("project_id", projectId)
    .eq("project_category", category)
    .eq("project_stage", stage)
    .eq("upload_status", "completed")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`사진 조회 실패: ${error.message}`);
  return (data ?? []) as PhotoRecord[];
}

// ── Photo Metadata ──────────────────────────────────────────

/**
 * 사진 메타데이터(title / description / tags / note)를 업데이트한다.
 * updated_at은 DB 트리거가 자동 갱신한다.
 */
export async function updatePhotoMeta(
  id: string,
  input: UpdatePhotoMetaInput,
): Promise<PhotoRecord> {
  const patch: Record<string, unknown> = {};
  if ("title" in input) patch.title = input.title ?? null;
  if ("description" in input) patch.description = input.description ?? null;
  if ("tags" in input) patch.tags = input.tags ?? [];
  if ("note" in input) patch.note = input.note ?? null;

  const { data, error } = await supabase
    .from("photos")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`사진 메타데이터 저장 실패: ${error.message}`);
  return data as PhotoRecord;
}
