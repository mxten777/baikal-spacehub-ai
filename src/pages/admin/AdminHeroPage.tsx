import { useState, useRef } from "react";
import { useHeroSlides } from "../../hooks/useData";
import { heroSlidesService } from "../../services/heroSlides";
import type { HeroSlide } from "../../types";
import type { HeroSlideCreateInput } from "../../services/heroSlides";
import { useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ImageUploadField from "../../components/admin/ImageUploadField";
import { deleteStorageFilesByUrls } from "../../lib/storage";

// ─── Schema ───────────────────────────────────────────────────────────────────

const slideSchema = z.object({
  title: z.string().min(1, "타이틀을 입력하세요"),
  subtitle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  desktop_image_url: z.string().nullable().optional(),
  mobile_image_url: z.string().nullable().optional(),
  primary_button_text: z.string().nullable().optional(),
  primary_button_link: z.string().nullable().optional(),
  secondary_button_text: z.string().nullable().optional(),
  secondary_button_link: z.string().nullable().optional(),
  display_order: z.coerce.number().default(0),
  is_active: z.boolean().default(true),
  publish_start_at: z.string().nullable().optional(),
  publish_end_at: z.string().nullable().optional(),
});

type SlideFormData = z.infer<typeof slideSchema>;

// ─── Status helpers ───────────────────────────────────────────────────────────

function getSlideStatus(slide: HeroSlide): { label: string; color: string } {
  if (!slide.is_active) {
    return { label: "비활성", color: "bg-gray-100 text-gray-500" };
  }
  const now = new Date();
  if (slide.publish_start_at && new Date(slide.publish_start_at) > now) {
    return { label: "게시 예정", color: "bg-blue-100 text-blue-700" };
  }
  if (slide.publish_end_at && new Date(slide.publish_end_at) < now) {
    return { label: "게시 종료", color: "bg-orange-100 text-orange-700" };
  }
  return { label: "게시 중", color: "bg-green-100 text-green-700" };
}

/** datetime-local input value (YYYY-MM-DDTHH:mm) → ISO string or null */
function localToIso(v: string | null | undefined): string | null {
  if (!v) return null;
  try {
    return new Date(v).toISOString();
  } catch {
    return null;
  }
}

/** ISO string → datetime-local input value */
function isoToLocal(v: string | null | undefined): string {
  if (!v) return "";
  try {
    return new Date(v).toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

// ─── Form modal ───────────────────────────────────────────────────────────────

function SlideForm({
  initialData,
  defaultOrder,
  onClose,
  onSuccess,
  onWarning,
}: {
  initialData?: HeroSlide;
  defaultOrder: number;
  onClose: () => void;
  onSuccess: () => void;
  onWarning?: (msg: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadingDesktopImage, setUploadingDesktopImage] = useState(false);
  const [uploadingMobileImage, setUploadingMobileImage] = useState(false);
  const originalDesktopUrl = useRef<string | null>(
    initialData?.desktop_image_url ?? null,
  );
  const originalMobileUrl = useRef<string | null>(
    initialData?.mobile_image_url ?? null,
  );
  const uploadedUrlsRef = useRef<Set<string>>(new Set());
  const handleUploadComplete = (url: string) => {
    uploadedUrlsRef.current.add(url);
  };
  const handleClose = () => {
    setSubmitError(null);
    const toClean = new Set(uploadedUrlsRef.current);
    uploadedUrlsRef.current.clear();
    onClose();
    if (toClean.size > 0) {
      deleteStorageFilesByUrls(toClean)
        .then((result) => {
          if (result.failed.length > 0) {
            result.failed.forEach(({ url, error }) =>
              console.error("[Storage cleanup]", url, error),
            );
            onWarning?.(
              "화면은 닫혀진만 일부 임시 이미지 파일을 정리하지 못했습니다.",
            );
          }
        })
        .catch(console.error);
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SlideFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(slideSchema) as any,
    defaultValues: initialData
      ? {
          title: initialData.title,
          subtitle: initialData.subtitle ?? "",
          description: initialData.description ?? "",
          desktop_image_url: initialData.desktop_image_url ?? null,
          mobile_image_url: initialData.mobile_image_url ?? null,
          primary_button_text: initialData.primary_button_text ?? "",
          primary_button_link: initialData.primary_button_link ?? "",
          secondary_button_text: initialData.secondary_button_text ?? "",
          secondary_button_link: initialData.secondary_button_link ?? "",
          display_order: initialData.display_order,
          is_active: initialData.is_active,
          publish_start_at: isoToLocal(initialData.publish_start_at),
          publish_end_at: isoToLocal(initialData.publish_end_at),
        }
      : {
          title: "",
          subtitle: "",
          description: "",
          desktop_image_url: null,
          mobile_image_url: null,
          primary_button_text: "",
          primary_button_link: "",
          secondary_button_text: "",
          secondary_button_link: "",
          display_order: defaultOrder,
          is_active: true,
          publish_start_at: "",
          publish_end_at: "",
        },
  });

  const desktopImageUrl = watch("desktop_image_url");
  const mobileImageUrl = watch("mobile_image_url");

  const onSubmit = async (data: SlideFormData) => {
    setSaving(true);
    setSubmitError(null);
    try {
      const payload: HeroSlideCreateInput = {
        title: data.title,
        subtitle: data.subtitle || null,
        description: data.description || null,
        desktop_image_url: data.desktop_image_url ?? null,
        mobile_image_url: data.mobile_image_url ?? null,
        primary_button_text: data.primary_button_text || null,
        primary_button_link: data.primary_button_link || null,
        secondary_button_text: data.secondary_button_text || null,
        secondary_button_link: data.secondary_button_link || null,
        display_order: data.display_order ?? 0,
        is_active: data.is_active ?? true,
        publish_start_at: localToIso(data.publish_start_at),
        publish_end_at: localToIso(data.publish_end_at),
      };

      if (initialData) {
        await heroSlidesService.update(initialData.id, payload);
      } else {
        await heroSlidesService.create(payload);
      }
      const savedDesktop = payload.desktop_image_url ?? null;
      const savedMobile = payload.mobile_image_url ?? null;
      if (savedDesktop !== null) uploadedUrlsRef.current.delete(savedDesktop);
      if (savedMobile !== null) uploadedUrlsRef.current.delete(savedMobile);
      const toClean = new Set(uploadedUrlsRef.current);
      uploadedUrlsRef.current.clear();
      const prevDesktop = originalDesktopUrl.current;
      const prevMobile = originalMobileUrl.current;
      originalDesktopUrl.current = savedDesktop;
      originalMobileUrl.current = savedMobile;
      onSuccess();
      const urlsToDelete = new Set(toClean);
      if (prevDesktop !== null && prevDesktop !== savedDesktop)
        urlsToDelete.add(prevDesktop);
      if (prevMobile !== null && prevMobile !== savedMobile)
        urlsToDelete.add(prevMobile);
      if (urlsToDelete.size > 0) {
        deleteStorageFilesByUrls(urlsToDelete)
          .then((result) => {
            if (result.failed.length > 0) {
              result.failed.forEach(({ url, error }) =>
                console.error("[Storage cleanup]", url, error),
              );
              onWarning?.(
                "내용은 저장되었지만 일부 임시 이미지 파일을 정리하지 못했습니다.",
              );
            }
          })
          .catch(console.error);
      }
    } catch (e) {
      setSubmitError(
        e instanceof Error ? e.message : "저장 중 오류가 발생했습니다.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="font-display text-lg font-light">
            {initialData ? "Hero 슬라이드 편집" : "Hero 슬라이드 추가"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-brand-black"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(
            onSubmit as Parameters<typeof handleSubmit>[0],
          )}
          className="p-6 space-y-5"
        >
          {/* 타이틀 */}
          <div>
            <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">
              타이틀 *{" "}
              <span className="text-gray-400 normal-case tracking-normal">
                (줄바꿈: \n 입력)
              </span>
            </label>
            <input
              {...register("title")}
              className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* 슬로건 */}
          <div>
            <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">
              슬로건 (Subtitle)
            </label>
            <input
              {...register("subtitle")}
              className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">
              설명 (Description)
            </label>
            <textarea
              {...register("description")}
              rows={2}
              className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black resize-none"
            />
          </div>

          {/* 이미지 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ImageUploadField
              label="데스크톱 이미지"
              value={desktopImageUrl}
              onChange={(url) => setValue("desktop_image_url", url)}
              onUploadingChange={setUploadingDesktopImage}
              onUploadComplete={handleUploadComplete}
              folder="hero/desktop"
            />
            <ImageUploadField
              label="모바일 이미지 (선택)"
              value={mobileImageUrl}
              onChange={(url) => setValue("mobile_image_url", url)}
              onUploadingChange={setUploadingMobileImage}
              onUploadComplete={handleUploadComplete}
              folder="hero/mobile"
            />
          </div>
          <p className="text-[11px] font-sans text-gray-400 -mt-2">
            모바일 이미지를 설정하지 않으면 데스크톱 이미지가 모바일에도
            표시됩니다.
          </p>

          {/* 버튼 1 */}
          <div>
            <p className="text-xs font-sans text-gray-600 tracking-wider uppercase mb-2">
              첫 번째 버튼
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-sans text-gray-500 mb-1">
                  버튼 텍스트
                </label>
                <input
                  {...register("primary_button_text")}
                  placeholder="예: Programs"
                  className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
                />
              </div>
              <div>
                <label className="block text-xs font-sans text-gray-500 mb-1">
                  버튼 링크
                </label>
                <input
                  {...register("primary_button_link")}
                  placeholder="예: /programs"
                  className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
                />
              </div>
            </div>
          </div>

          {/* 버튼 2 */}
          <div>
            <p className="text-xs font-sans text-gray-600 tracking-wider uppercase mb-2">
              두 번째 버튼
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-sans text-gray-500 mb-1">
                  버튼 텍스트
                </label>
                <input
                  {...register("secondary_button_text")}
                  placeholder="예: Space Rental"
                  className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
                />
              </div>
              <div>
                <label className="block text-xs font-sans text-gray-500 mb-1">
                  버튼 링크
                </label>
                <input
                  {...register("secondary_button_link")}
                  placeholder="예: /reservation"
                  className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
                />
              </div>
            </div>
            <p className="text-[11px] font-sans text-gray-400 mt-1">
              텍스트와 링크가 모두 입력된 버튼만 공개 화면에 표시됩니다.
            </p>
          </div>

          {/* 순서 + 활성화 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">
                표시 순서
              </label>
              <input
                type="number"
                {...register("display_order")}
                className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("is_active")}
                  className="w-4 h-4"
                />
                <span className="text-sm font-sans text-gray-700">활성화</span>
              </label>
            </div>
          </div>

          {/* 게시 기간 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">
                게시 시작일
              </label>
              <input
                type="datetime-local"
                {...register("publish_start_at")}
                className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
              />
            </div>
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">
                게시 종료일
              </label>
              <input
                type="datetime-local"
                {...register("publish_end_at")}
                className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
              />
            </div>
          </div>
          <p className="text-[11px] font-sans text-gray-400 -mt-2">
            비워두면 기간 제한 없이 노출됩니다.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            {submitError && (
              <p className="flex-1 text-xs text-red-500 font-sans">
                {submitError}
              </p>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-sans text-gray-600 hover:text-brand-black"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving || uploadingDesktopImage || uploadingMobileImage}
              className="flex items-center gap-2 px-6 py-2 bg-brand-black text-white text-sm font-sans hover:bg-brand-muted transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminHeroPage() {
  const { data: slides, isLoading, isError, refetch } = useHeroSlides();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
  };

  const handleSuccess = () => {
    invalidate();
    setFormOpen(false);
    setEditingSlide(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 슬라이드를 삭제하시겠습니까?")) return;
    setDeletingId(id);
    setDeleteError(null);
    try {
      await heroSlidesService.delete(id);
      invalidate();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setDeleteError(`삭제 실패: ${msg}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    await heroSlidesService.update(slide.id, { is_active: !slide.is_active });
    invalidate();
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    if (!slides) return;
    const target = slides[index];
    const swapWith = direction === "up" ? slides[index - 1] : slides[index + 1];
    if (!swapWith) return;

    setReorderingId(target.id);
    try {
      await heroSlidesService.swapOrder(
        { id: target.id, display_order: target.display_order },
        { id: swapWith.id, display_order: swapWith.display_order },
      );
      invalidate();
    } finally {
      setReorderingId(null);
    }
  };

  const nextOrder = slides
    ? Math.max(0, ...slides.map((s) => s.display_order)) + 1
    : 1;

  return (
    <div>
      {storageWarning && (
        <div className="flex items-center justify-between gap-3 mb-4 px-4 py-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-sans">
          <span>{storageWarning}</span>
          <button
            type="button"
            onClick={() => setStorageWarning(null)}
            className="shrink-0 text-amber-600 hover:text-amber-900"
          >
            ✕
          </button>
        </div>
      )}
      {deleteError && (
        <div className="flex items-center justify-between gap-3 mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-800 text-sm font-sans">
          <span>{deleteError}</span>
          <button
            type="button"
            onClick={() => setDeleteError(null)}
            className="shrink-0 text-red-600 hover:text-red-900"
          >
            ✕
          </button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-light text-brand-black">
            Hero 슬라이드
          </h1>
          <p className="font-sans text-sm text-gray-500 mt-1">
            홈페이지 메인 Hero 슬라이드 관리
          </p>
        </div>
        <button
          onClick={() => {
            setEditingSlide(null);
            setFormOpen(true);
          }}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-brand-black text-white text-sm font-sans hover:bg-brand-muted transition-colors"
        >
          <Plus size={16} />
          슬라이드 추가
        </button>
      </div>

      {isError ? (
        <div className="text-center py-16 border border-dashed border-red-200">
          <p className="font-sans text-sm text-red-400 mb-3">
            데이터를 불러오지 못했습니다.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="font-sans text-xs text-gray-500 underline hover:text-gray-700"
          >
            다시 시도
          </button>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-20 bg-gray-100 animate-pulse border border-gray-200" />
          ))}
        </div>
      ) : !slides || slides.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200">
          <p className="font-sans text-sm text-gray-400">
            등록된 슬라이드가 없습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide, i) => {
            const { label: statusLabel, color: statusColor } =
              getSlideStatus(slide);
            const isFirst = i === 0;
            const isLast = i === slides.length - 1;

            return (
              <div
                key={slide.id}
                className="bg-white border border-gray-200 flex items-start gap-3 p-4"
              >
                {/* Thumbnail */}
                <div className="w-16 h-12 sm:w-20 sm:h-14 bg-gray-100 shrink-0 overflow-hidden">
                  {slide.desktop_image_url ? (
                    <img
                      src={slide.desktop_image_url}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[10px] font-sans text-gray-300">
                        No image
                      </span>
                    </div>
                  )}
                </div>

                {/* Info + Actions */}
                <div className="flex-1 min-w-0">
                  {/* Status row with action buttons on the right */}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-sans tracking-widest uppercase ${statusColor}`}
                      >
                        {statusLabel}
                      </span>
                      <span className="text-[10px] font-sans text-gray-400">
                        #{slide.display_order}
                      </span>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={() => handleMove(i, "up")}
                        disabled={isFirst || reorderingId === slide.id}
                        title="위로"
                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-brand-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        {reorderingId === slide.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <ChevronUp size={15} />
                        )}
                      </button>
                      <button
                        onClick={() => handleMove(i, "down")}
                        disabled={isLast || reorderingId === slide.id}
                        title="아래로"
                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-brand-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronDown size={15} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(slide)}
                        title={slide.is_active ? "비활성화" : "활성화"}
                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-brand-black transition-colors"
                      >
                        {slide.is_active ? (
                          <Eye size={15} />
                        ) : (
                          <EyeOff size={15} />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditingSlide(slide);
                          setFormOpen(true);
                        }}
                        title="편집"
                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-brand-black transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(slide.id)}
                        disabled={deletingId === slide.id}
                        title="삭제"
                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors"
                      >
                        {deletingId === slide.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="font-sans text-sm text-brand-black whitespace-pre-line leading-tight mb-0.5">
                    {slide.title.replace(/\n/g, " / ")}
                  </p>
                  {slide.subtitle && (
                    <p className="font-sans text-xs text-gray-500 truncate">
                      {slide.subtitle}
                    </p>
                  )}
                  {(slide.primary_button_text ||
                    slide.secondary_button_text) && (
                    <p className="font-sans text-[11px] text-gray-400 mt-1">
                      버튼:{" "}
                      {[slide.primary_button_text, slide.secondary_button_text]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  {(slide.publish_start_at || slide.publish_end_at) && (
                    <p className="font-sans text-[11px] text-gray-400">
                      기간:{" "}
                      {slide.publish_start_at
                        ? isoToLocal(slide.publish_start_at)
                        : "∞"}{" "}
                      ~{" "}
                      {slide.publish_end_at
                        ? isoToLocal(slide.publish_end_at)
                        : "∞"}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {formOpen && (
        <SlideForm
          initialData={editingSlide ?? undefined}
          defaultOrder={nextOrder}
          onClose={() => {
            setFormOpen(false);
            setEditingSlide(null);
          }}
          onSuccess={handleSuccess}
          onWarning={setStorageWarning}
        />
      )}
    </div>
  );
}
