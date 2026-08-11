import { useState, useRef, useEffect } from "react";
import { archiveService } from "../../services/archive";
import type { ArchiveItem } from "../../types";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { isSupabaseConfigured } from "../../lib/supabase";
import { Plus, Pencil, Trash2, X, Check, Loader2, Images } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ImageUploadField from "../../components/admin/ImageUploadField";
import { deleteStorageFilesByUrls } from "../../lib/storage";
import PhotoPickerModal from "../../components/admin/PhotoPickerModal";
import AdminQueryError from "../../components/admin/AdminQueryError";

const archiveSchema = z.object({
  title: z.string().min(1, "제목을 입력하세요"),
  slug: z
    .string()
    .min(1, "slug를 입력하세요")
    .regex(/^[a-z0-9-]+$/, "소문자, 숫자, 하이픈만 허용됩니다"),
  description: z.string().optional(),
  category: z.string().min(1, "카테고리를 입력하세요"),
  date: z.string().optional(),
  cover_image_url: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
  is_featured: z.boolean().default(false),
  publish_status: z
    .enum(["draft", "published", "archived"])
    .default("published"),
  media_type: z.enum(["photo", "video"]).default("photo"),
  subcategory: z.string().optional(),
  video_url: z.string().nullable().optional(),
});

type ArchiveFormData = z.infer<typeof archiveSchema>;

const toSlug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "archive";

function ArchiveItemForm({
  initialData,
  onClose,
  onSuccess,
  onWarning,
}: {
  initialData?: ArchiveItem;
  onClose: () => void;
  onSuccess: () => void;
  onWarning?: (msg: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);
  const uploadedUrlsRef = useRef<Set<string>>(new Set());
  const originalCoverUrlRef = useRef<string | null>(
    initialData?.cover_image_url ?? null,
  );
  const handleUploadComplete = (url: string) => {
    uploadedUrlsRef.current.add(url);
  };
  const handleClose = () => {
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
    getValues,
    formState: { errors },
  } = useForm<ArchiveFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(archiveSchema) as any,
    defaultValues: initialData
      ? {
          title: initialData.title,
          slug: initialData.slug,
          description: initialData.description ?? "",
          category: initialData.category,
          date: initialData.date?.split("T")[0] ?? "",
          cover_image_url: initialData.cover_image_url ?? null,
          images: initialData.images ?? [],
          is_featured: initialData.is_featured,
          publish_status: (initialData.publish_status ?? "published") as
            | "draft"
            | "published"
            | "archived",
          media_type: (initialData.media_type ?? "photo") as "photo" | "video",
          subcategory: initialData.subcategory ?? "",
          video_url: initialData.video_url ?? null,
        }
      : {
          title: "",
          slug: "",
          description: "",
          category: "",
          date: "",
          cover_image_url: null,
          images: [],
          is_featured: false,
          publish_status: "published" as const,
          media_type: "photo" as const,
          subcategory: "",
          video_url: null,
        },
  });
  const coverImageUrl = watch("cover_image_url");
  const galleryImages = watch("images") ?? [];
  const mediaType = watch("media_type");
  const titleValue = watch("title");

  // Auto-generate slug from title on new forms when slug is still empty
  useEffect(() => {
    if (initialData) return;
    if (!getValues("slug")) setValue("slug", toSlug(titleValue));
  }, [titleValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: ArchiveFormData) => {
    setSaving(true);
    setSubmitError(null);
    try {
      // Resolve unique slug before saving
      let finalSlug = data.slug;
      const base = data.slug;
      if (!(await archiveService.slugExists(base, initialData?.id))) {
        finalSlug = base;
      } else {
        let n = 2;
        while (n <= 99) {
          const candidate = `${base}-${n}`;
          if (!(await archiveService.slugExists(candidate, initialData?.id))) {
            finalSlug = candidate;
            break;
          }
          n++;
        }
        if (finalSlug === base) finalSlug = `${base}-${Date.now()}`;
      }
      if (finalSlug !== data.slug) setValue("slug", finalSlug);
      const payload = {
        ...data,
        slug: finalSlug,
        images: data.images ?? [],
        cover_image_url: data.cover_image_url ?? null,
        publish_status: data.publish_status,
      };
      if (initialData) {
        await archiveService.update(initialData.id, payload);
      } else {
        await archiveService.create(payload);
      }
      const savedUrl = payload.cover_image_url;
      if (savedUrl !== null) uploadedUrlsRef.current.delete(savedUrl);
      const toClean = new Set(uploadedUrlsRef.current);
      uploadedUrlsRef.current.clear();
      const prevUrl = originalCoverUrlRef.current;
      originalCoverUrlRef.current = savedUrl;
      onSuccess();
      const urlsToDelete = new Set(toClean);
      if (prevUrl !== null && prevUrl !== savedUrl) urlsToDelete.add(prevUrl);
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
      console.error("[AdminArchivePage] save error:", e);
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e !== null && "message" in e
            ? String((e as { message: unknown }).message)
            : "저장 중 오류가 발생했습니다.";
      setSubmitError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="font-display text-lg font-light">
            {initialData ? "아카이브 편집" : "아카이브 추가"}
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
            onSubmit as any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
          )}
          className="p-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-2">
              콘텐츠 유형 *
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="photo"
                  {...register("media_type")}
                  className="w-4 h-4 accent-brand-black"
                />
                <span className="text-sm font-sans text-gray-700">사진</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="video"
                  {...register("media_type")}
                  className="w-4 h-4 accent-brand-black"
                />
                <span className="text-sm font-sans text-gray-700">동영상</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">
                제목 *
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
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">
                Slug *
              </label>
              <input
                {...register("slug")}
                className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
              />
              {errors.slug && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.slug.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">
                대분류 *
              </label>
              <input
                type="text"
                list="archive-categories"
                {...register("category")}
                placeholder="예: K-POP, Drama, 기업행사..."
                className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
              />
              <datalist id="archive-categories">
                <option value="K-POP" />
                <option value="Drama" />
                <option value="매거진" />
                <option value="기업행사" />
                <option value="패션쇼" />
                <option value="전시회" />
              </datalist>
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">
                날짜
              </label>
              <input
                type="date"
                {...register("date")}
                className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">
              중분류
            </label>
            <input
              type="text"
              list="archive-subcategories"
              {...register("subcategory")}
              placeholder="예: Ceremony, Showcase, Interior..."
              className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
            />
            <datalist id="archive-subcategories">
              <option value="Ceremony" />
              <option value="Reception" />
              <option value="Concert" />
              <option value="Showcase" />
              <option value="Interior" />
              <option value="Shooting" />
            </datalist>
          </div>
          <div>
            <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">
              설명
            </label>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black resize-none"
            />
          </div>
          {mediaType === "photo" && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs text-gray-600 tracking-wider uppercase">
                  갤러리 이미지 ({galleryImages.length})
                </label>
                <button
                  type="button"
                  onClick={() => setGalleryPickerOpen(true)}
                  className="flex items-center gap-1 text-xs font-sans text-gray-500 hover:text-brand-black transition-colors"
                >
                  <Images size={13} />
                  라이브러리에서 추가
                </button>
              </div>
              {galleryImages.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {galleryImages.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative group aspect-square bg-gray-100 overflow-hidden"
                    >
                      <img
                        src={url}
                        alt={`gallery-${idx}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setValue(
                            "images",
                            galleryImages.filter((_, i) => i !== idx),
                          )
                        }
                        className="absolute top-1 right-1 w-5 h-5 bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-16 border border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">
                  라이브러리에서 이미지를 추가하세요
                </div>
              )}
              {galleryPickerOpen && (
                <PhotoPickerModal
                  open={galleryPickerOpen}
                  onClose={() => setGalleryPickerOpen(false)}
                  onSelect={() => {}}
                  multiSelect
                  onMultiSelect={(urls) =>
                    setValue("images", [
                      ...galleryImages,
                      ...urls.filter((u) => !galleryImages.includes(u)),
                    ])
                  }
                  defaultCategory="archive"
                />
              )}
            </div>
          )}
          {mediaType === "video" && (
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">
                영상 링크
              </label>
              <input
                type="text"
                {...register("video_url")}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
              />
              <p className="text-xs text-gray-400 mt-1">
                YouTube, Instagram Reels 또는 기타 외부 영상 URL
              </p>
            </div>
          )}
          <ImageUploadField
            label="대표 이미지 (cover)"
            value={coverImageUrl}
            onChange={(url) => setValue("cover_image_url", url)}
            onUploadingChange={setUploadingImage}
            onUploadComplete={handleUploadComplete}
            folder="archive"
            photoPickerCategory="archive"
          />{" "}
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("is_featured")}
                className="w-4 h-4"
              />
              <span className="text-sm font-sans text-gray-700">
                메인 노출 (Featured)
              </span>
            </label>
          </div>{" "}
          <div>
            <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">
              공개 상태
            </label>
            <select
              {...register("publish_status")}
              className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black bg-white"
            >
              <option value="draft">초안 (비공개)</option>
              <option value="published">공개</option>
              <option value="archived">보관</option>
            </select>
          </div>{" "}
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
              disabled={saving || uploadingImage}
              className="flex items-center gap-2 px-6 py-2 bg-brand-black text-white text-sm font-sans hover:bg-brand-muted transition-colors disabled:opacity-50"
            >
              {saving || uploadingImage ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              {uploadingImage ? "이미지 업로드 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminArchivePage() {
  const {
    data: archives,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-archive"],
    queryFn: () => archiveService.getAllAdmin(),
    staleTime: 2 * 60 * 1000,
    enabled: isSupabaseConfigured,
  });
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ArchiveItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["archive"] });
    queryClient.invalidateQueries({ queryKey: ["admin-archive"] });
    setFormOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 아카이브 항목을 삭제하시겠습니까?")) return;
    setDeletingId(id);
    try {
      await archiveService.delete(id);
      queryClient.invalidateQueries({ queryKey: ["archive"] });
      queryClient.invalidateQueries({ queryKey: ["admin-archive"] });
    } finally {
      setDeletingId(null);
    }
  };

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-light text-brand-black">
            Archive
          </h1>
          <p className="font-sans text-sm text-gray-500 mt-1">아카이브 관리</p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-black text-white text-sm font-sans hover:bg-brand-muted transition-colors"
        >
          <Plus size={16} />
          아카이브 추가
        </button>
      </div>

      {isError ? (
        <AdminQueryError onRetry={refetch} />
      ) : (
        <div className="bg-white border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase">
                  제목
                </th>
                <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase hidden md:table-cell">
                  카테고리
                </th>
                <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase hidden lg:table-cell">
                  날짜
                </th>
                <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase hidden lg:table-cell">
                  공개 상태
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }, (_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td colSpan={99} className="px-6 py-4">
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                    </td>
                  </tr>
                ))
              ) : archives && archives.length > 0 ? (
                archives.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-sans text-sm font-medium text-brand-black">
                        {item.title}
                      </p>
                      {item.is_featured && (
                        <span className="text-[10px] font-sans tracking-widest uppercase text-brand-accent">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-xs font-sans text-gray-600">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-xs font-sans text-gray-600">
                        {item.date
                          ? new Date(item.date).toLocaleDateString("ko-KR")
                          : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-sans tracking-widest uppercase ${
                          item.publish_status === "published"
                            ? "bg-green-100 text-green-700"
                            : item.publish_status === "draft"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {item.publish_status === "published"
                          ? "공개"
                          : item.publish_status === "draft"
                            ? "초안"
                            : "보관"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-1.5 text-gray-400 hover:text-brand-black transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        >
                          {deletingId === item.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center font-sans text-sm text-gray-400"
                  >
                    등록된 아카이브 항목이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {(formOpen || editingItem) && (
        <ArchiveItemForm
          initialData={editingItem ?? undefined}
          onClose={() => {
            setFormOpen(false);
            setEditingItem(null);
          }}
          onSuccess={handleSuccess}
          onWarning={setStorageWarning}
        />
      )}
    </div>
  );
}
