import { useState, useRef } from "react";
import { Upload, X, Loader2, Images } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { ALLOWED_TYPES, MAX_SIZE_MB, getExtension } from "../../services/photoStorage";
import PhotoPickerModal from "./PhotoPickerModal";
import type { ProjectCategory } from "../../types";

const BUCKET = "photos";

interface ImageUploadFieldProps {
  label?: string;
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  /** Storage sub-folder, e.g. 'spaces' or 'programs' */
  folder?: string;
  /** Called when upload starts (true) or finishes (false) */
  onUploadingChange?: (uploading: boolean) => void;
  /** Called with the resulting public URL when upload completes successfully */
  onUploadComplete?: (url: string) => void;
  /**
   * When provided, shows a "라이브러리에서 선택" button that opens PhotoPickerModal.
   * Pass null to show all web-ready photos across all categories.
   */
  photoPickerCategory?: ProjectCategory | null;
}

export default function ImageUploadField({
  label = "대표 이미지",
  value,
  onChange,
  folder = "cms",
  onUploadingChange,
  onUploadComplete,
  photoPickerCategory,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("JPG, PNG, WebP 형식만 가능합니다.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`파일 크기는 ${MAX_SIZE_MB}MB 이하여야 합니다.`);
      return;
    }
    setError(null);
    setUploading(true);
    onUploadingChange?.(true);
    const abort = new AbortController();
    const timeoutId = setTimeout(() => abort.abort(), 30_000);
    try {
      // No async auth call — path uses UUID, access control handled by RLS
      const ext = getExtension(file.type);
      const path = `cms/${folder}/${crypto.randomUUID()}.${ext}`;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
          signal: abort.signal,
        } as any);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(path);
      onChange(urlData.publicUrl);
      onUploadComplete?.(urlData.publicUrl);
      setPreviewError(false);
    } catch (e) {
      console.error("[ImageUploadField] upload error:", e);
      const isAbort = e instanceof DOMException && e.name === "AbortError";
      setError(
        isAbort
          ? "업로드 시간 초과 (30초). 네트워크 연결을 확인해 주세요."
          : e instanceof Error
            ? e.message
            : "업로드 중 오류가 발생했습니다.",
      );
    } finally {
      clearTimeout(timeoutId);
      setUploading(false);
      onUploadingChange?.(false);
    }
  };

  const hasImage = Boolean(value) && !previewError;

  return (
    <div>
      <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">
        {label}
      </label>

      {hasImage ? (
        <div
          className="relative w-full aspect-video bg-gray-100 mb-1 overflow-hidden cursor-pointer group"
          onClick={() => !uploading && inputRef.current?.click()}
          title="클릭하여 이미지 교체"
        >
          <img
            src={value!}
            alt="cover preview"
            className="w-full h-full object-cover"
            onError={() => setPreviewError(true)}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!uploading) inputRef.current?.click();
              }}
              disabled={uploading}
              title="이미지 교체"
              className="w-7 h-7 bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Upload size={12} />
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
                setPreviewError(false);
              }}
              title="이미지 삭제"
              className="w-7 h-7 bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => !uploading && inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !uploading) inputRef.current?.click();
          }}
          className={`w-full h-32 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 transition-colors ${
            uploading
              ? "cursor-wait opacity-60"
              : "cursor-pointer hover:border-brand-black"
          }`}
        >
          {uploading ? (
            <Loader2 size={20} className="animate-spin text-gray-400" />
          ) : (
            <>
              <Upload size={18} className="text-gray-400" />
              <span className="text-xs font-sans text-gray-400">
                클릭하여 이미지 업로드
              </span>
              <span className="text-[10px] font-sans text-gray-300">
                JPG · PNG · WebP · 최대 {MAX_SIZE_MB}MB
              </span>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />

      {/* 라이브러리에서 선택 버튼 */}
      {photoPickerCategory !== undefined && (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="mt-2 flex items-center gap-1.5 text-xs font-sans text-gray-500 hover:text-brand-black transition-colors"
        >
          <Images size={13} />
          라이브러리에서 선택
        </button>
      )}

      {error && (
        <p className="flex items-start gap-1 text-red-500 text-xs mt-1">
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="shrink-0 mt-0.5 hover:text-red-700 transition-colors"
            aria-label="오류 닫기"
          >
            <X size={11} />
          </button>
        </p>
      )}

      {pickerOpen && (
        <PhotoPickerModal
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={(url) => {
            onChange(url);
            onUploadComplete?.(url);
            setPreviewError(false);
          }}
          defaultCategory={photoPickerCategory ?? null}
        />
      )}
    </div>
  );
}
