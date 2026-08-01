import { supabase } from "../lib/supabase";
import { createPhotoRecord } from "./photoRepository";
import type { ProjectCategory, ProjectStage, PhotoRecord } from "../types";

const BUCKET = "photos";

export interface UploadResult {
  storagePath: string;
  publicUrl: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return map[mimeType] ?? "jpg";
}

function buildStoragePath(userId: string, mimeType: string): string {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const uuid = crypto.randomUUID();
  const ext = getExtension(mimeType);
  return `photo-curator/${userId}/${year}/${month}/${uuid}.${ext}`;
}

function toFriendlyError(error: { message: string }): string {
  const msg = error.message.toLowerCase();
  if (
    msg.includes("network") ||
    msg.includes("fetch") ||
    msg.includes("failed to fetch")
  ) {
    return "네트워크 연결을 확인해 주세요.";
  }
  if (
    msg.includes("unauthorized") ||
    msg.includes("403") ||
    msg.includes("permission") ||
    msg.includes("policy") ||
    msg.includes("violates")
  ) {
    return "사진 저장 권한이 없습니다.";
  }
  if (
    msg.includes("too large") ||
    msg.includes("413") ||
    msg.includes("payload") ||
    msg.includes("size")
  ) {
    return "파일 크기가 허용 범위를 초과했습니다.";
  }
  return "업로드 중 오류가 발생했습니다.";
}

/**
 * Build a structured storage path for photo project assets.
 *
 * @param projectSlug  - e.g. "the-lit-2026"
 * @param category     - e.g. "main" | "wedding" | "portrait"
 * @param stage        - e.g. "source" | "web" | "print"
 * @param filename     - e.g. "image.webp" | "main.webp"
 * @returns            - e.g. "the-lit-2026/main/source/image.webp"
 *
 * Examples:
 *   buildProjectStoragePath("the-lit-2026", "main", "source", "image.webp")
 *   → "the-lit-2026/main/source/image.webp"
 *
 *   buildProjectStoragePath("the-lit-2026", "wedding", "web", "main.webp")
 *   → "the-lit-2026/wedding/web/main.webp"
 */
export function buildProjectStoragePath(
  projectSlug: string,
  category: string,
  stage: string,
  filename: string,
): string {
  return `${projectSlug}/${category}/${stage}/${filename}`;
}

// ─── Project Upload ────────────────────────────────────────────────────────────

export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_SIZE_MB = 20;
export const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export interface UploadProjectPhotoParams {
  projectId: string;
  projectSlug: string;
  category: ProjectCategory;
  stage: ProjectStage;
  file: File;
  uploadedBy: string;
}

/**
 * Upload a file to Storage under the project path structure,
 * then insert a row into the photos table.
 *
 * Path: {projectSlug}/{category}/{stage}/{uuid}.{ext}
 */
export async function uploadProjectPhoto(
  params: UploadProjectPhotoParams,
): Promise<PhotoRecord> {
  const { projectId, projectSlug, category, stage, file, uploadedBy } = params;

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("JPG, PNG, WebP 형식만 가능합니다.");
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`파일 크기는 ${MAX_SIZE_MB}MB 이하여야 합니다.`);
  }

  const ext = getExtension(file.type);
  const filename = `${crypto.randomUUID()}.${ext}`;
  const storagePath = buildProjectStoragePath(
    projectSlug,
    category,
    stage,
    filename,
  );

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    throw new Error(toFriendlyError(uploadError));
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  return createPhotoRecord({
    original_name: file.name,
    storage_path: storagePath,
    public_url: urlData.publicUrl,
    mime_type: file.type,
    file_size: file.size,
    width: null,
    height: null,
    uploaded_by: uploadedBy,
    project_id: projectId,
    project_category: category,
    project_stage: stage,
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Upload a single photo to the `photos` bucket.
 * Path: photo-curator/{userId}/{YYYY}/{MM}/{UUID}.{ext}
 */
export async function uploadPhoto(
  file: File,
  userId: string,
): Promise<UploadResult> {
  const storagePath = buildStoragePath(userId, file.type);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(toFriendlyError(error));
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  return { storagePath, publicUrl: urlData.publicUrl };
}

/**
 * Delete a single photo from the `photos` bucket by its storage path.
 */
export async function deletePhoto(storagePath: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);

  if (error) {
    throw new Error(toFriendlyError(error));
  }
}

/**
 * Extract the natural pixel dimensions of an image File.
 * Creates a temporary blob URL, loads it in an Image element, then revokes the URL.
 * Returns null if the image cannot be decoded (does not throw).
 */
export async function extractImageDimensions(
  file: File,
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}
