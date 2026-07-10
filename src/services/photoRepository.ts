import { supabase } from "../lib/supabase";
import type {
  PhotoRecord,
  CreatePhotoRecordInput,
  PhotoUploadStatus,
  PhotoSpaceCategory,
  PhotoType,
  PhotoSortOption,
  UpdatePhotoRecordInput,
  PhotoAnalysisUpdateInput,
} from "../types";

const TABLE = "photos";
export const PHOTO_PAGE_SIZE = 24;

// ─── Query options ────────────────────────────────────────────────────────────

export interface GetPhotoRecordsOptions {
  offset?: number;
  search?: string;
  spaceCategory?: PhotoSpaceCategory | "all";
  photoType?: PhotoType | "all";
  featured?: "all" | "featured" | "not_featured";
  favoriteOnly?: boolean;
  sort?: PhotoSortOption;
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getPhotoRecords(
  options: GetPhotoRecordsOptions = {}
): Promise<{ records: PhotoRecord[]; hasMore: boolean }> {
  const {
    offset = 0,
    search,
    spaceCategory = "all",
    photoType = "all",
    featured = "all",
    favoriteOnly = false,
    sort = "newest",
  } = options;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = supabase.from(TABLE).select("*") as any;

  // Full-text search across filename, memo (ilike), and tags (exact element)
  if (search?.trim()) {
    const s = search.trim();
    // Sanitise for array containment literal (remove {  } and comma)
    const sArr = s.replace(/[{},]/g, "");
    if (sArr) {
      query = query.or(
        `original_name.ilike.%${s}%,admin_memo.ilike.%${s}%,tags.cs.{${sArr}}`
      );
    } else {
      query = query.or(`original_name.ilike.%${s}%,admin_memo.ilike.%${s}%`);
    }
  }

  if (spaceCategory !== "all") query = query.eq("space_category", spaceCategory);
  if (photoType !== "all") query = query.eq("photo_type", photoType);
  if (featured === "featured") query = query.eq("is_featured", true);
  if (featured === "not_featured") query = query.eq("is_featured", false);
  if (favoriteOnly) query = query.eq("is_favorite", true);

  switch (sort) {
    case "oldest":   query = query.order("created_at", { ascending: true });  break;
    case "name_asc": query = query.order("original_name", { ascending: true }); break;
    case "name_desc":query = query.order("original_name", { ascending: false }); break;
    default:         query = query.order("created_at", { ascending: false }); // newest
  }

  query = query.range(offset, offset + PHOTO_PAGE_SIZE - 1);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const records = (data ?? []) as PhotoRecord[];
  return { records, hasMore: records.length === PHOTO_PAGE_SIZE };
}

// ─── Write ────────────────────────────────────────────────────────────────────

export async function createPhotoRecord(
  input: CreatePhotoRecordInput
): Promise<PhotoRecord> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as PhotoRecord;
}

export async function updatePhotoRecord(
  id: string,
  patch: UpdatePhotoRecordInput
): Promise<PhotoRecord> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as PhotoRecord;
}

/**
 * Write AI analysis results (or status updates) back to the photos table.
 * Called by the AI analysis service once it is connected (Sprint 5-B+).
 */
export async function updatePhotoAnalysis(
  id: string,
  patch: PhotoAnalysisUpdateInput
): Promise<PhotoRecord> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as PhotoRecord;
}

// ─── Status mutations ─────────────────────────────────────────────────────────

async function setStatus(id: string, status: PhotoUploadStatus): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ upload_status: status })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export const markPhotoDeletePending = (id: string) =>
  setStatus(id, "delete_pending");

export const markPhotoCompleted = (id: string) =>
  setStatus(id, "completed");

export const markPhotoError = (id: string) =>
  setStatus(id, "error");

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deletePhotoRecord(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}