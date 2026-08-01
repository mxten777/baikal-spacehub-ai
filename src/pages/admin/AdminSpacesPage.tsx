import { useState, useRef } from "react";
import { spacesService } from "../../services/spaces";
import type { Space } from "../../types";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { isSupabaseConfigured } from "../../lib/supabase";
import { Plus, Pencil, Trash2, X, Check, Loader2, Images } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ImageUploadField from "../../components/admin/ImageUploadField";
import PhotoPickerModal from "../../components/admin/PhotoPickerModal";
import { deleteStorageFilesByUrls } from "../../lib/storage";
import { listPhotoProjects } from "../../services/photoProjects";
import AdminQueryError from "../../components/admin/AdminQueryError";

const spaceSchema = z.object({
  name: z.string().min(1, "공간명을 입력하세요"),
  slug: z
    .string()
    .min(1, "slug를 입력하세요")
    .regex(/^[a-z0-9-]+$/, "소문자, 숫자, 하이픈만 허용됩니다"),
  description: z.string().optional(),
  category: z.enum(["cafe", "garden", "studio", "storage", "hall", "other"]),
  capacity: z.coerce.number().min(0).optional(),
  size_sqm: z.coerce.number().min(0).optional(),
  rental_price_per_hour: z.coerce.number().min(0).optional(),
  is_available: z.boolean().default(true),
  publish_status: z
    .enum(["draft", "published", "archived"])
    .default("published"),
  sort_order: z.coerce.number().default(0),
  cover_image_url: z.string().nullable().optional(),
  photo_project_id: z.string().nullable().optional(),
});

type SpaceFormData = z.infer<typeof spaceSchema>;

const CATEGORY_LABELS: Record<string, string> = {
  cafe: "카페",
  garden: "가든",
  studio: "스튜디오",
  storage: "스토리지",
  hall: "홀",
  other: "기타",
};

const PUBLISH_STATUS_LABELS: Record<string, string> = {
  draft: "초안",
  published: "공개",
  archived: "보관",
};

const PUBLISH_STATUS_COLORS: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-700",
  published: "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-500",
};

const defaultValues: SpaceFormData = {
  name: "",
  slug: "",
  description: "",
  category: "other",
  capacity: undefined,
  size_sqm: undefined,
  rental_price_per_hour: undefined,
  is_available: true,
  publish_status: "published",
  sort_order: 0,
  cover_image_url: null,
  photo_project_id: null,
};

function SpaceForm({
  initialData,
  onClose,
  onSuccess,
  onWarning,
}: {
  initialData?: Space;
  onClose: () => void;
  onSuccess: () => void;
  onWarning?: (msg: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const handleUploadingChange = (uploading: boolean) =>
    setUploadingCount((prev) => (uploading ? prev + 1 : Math.max(0, prev - 1)));
  const originalImageUrl = useRef<string | null>(
    initialData?.cover_image_url ?? null,
  );
  const { data: photoProjects = [] } = useQuery({
    queryKey: ["photo_projects"],
    queryFn: () => listPhotoProjects(),
  });
  const originalImagesRef = useRef<string[]>(initialData?.images ?? []);
  const [imagesArr, setImagesArr] = useState<(string | null)[]>(
    initialData?.images?.length ? [...initialData.images] : [],
  );
  const [multiPickerOpen, setMultiPickerOpen] = useState(false);
  const uploadedUrlsRef = useRef<Set<string>>(new Set());
  const handleUploadComplete = (url: string) => {
    uploadedUrlsRef.current.add(url);
  };
  const addImageSlot = () => setImagesArr((prev) => [...prev, null]);
  const updateImageSlot = (idx: number, url: string | null) => {
    if (url === null) {
      setImagesArr((prev) => prev.filter((_, i) => i !== idx));
    } else {
      setImagesArr((prev) => prev.map((v, i) => (i === idx ? url : v)));
      uploadedUrlsRef.current.add(url);
    }
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
    formState: { errors },
  } = useForm<SpaceFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(spaceSchema) as any,
    defaultValues: initialData
      ? {
          name: initialData.name,
          slug: initialData.slug,
          description: initialData.description ?? "",
          category: initialData.category,
          capacity: initialData.capacity ?? undefined,
          size_sqm: initialData.size_sqm ?? undefined,
          rental_price_per_hour: initialData.rental_price_per_hour ?? undefined,
          is_available: initialData.is_available,
          sort_order: initialData.sort_order,
          cover_image_url: initialData.cover_image_url ?? null,
          photo_project_id: initialData.photo_project_id ?? null,
        }
      : defaultValues,
  });
  const coverImageUrl = watch("cover_image_url");

  const onSubmit = async (data: SpaceFormData) => {
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        category: data.category,
        capacity: data.capacity ?? null,
        size_sqm: data.size_sqm ?? null,
        rental_price_per_hour: data.rental_price_per_hour ?? null,
        is_available: data.is_available ?? true,
        publish_status: data.publish_status,
        sort_order: data.sort_order ?? 0,
        cover_image_url: data.cover_image_url ?? null,
        images: imagesArr.filter((u): u is string => Boolean(u)),
        photo_project_id: data.photo_project_id ?? null,
      };
      if (initialData) {
        await spacesService.update(initialData.id, payload);
      } else {
        await spacesService.create({
          ...payload,
          is_available: payload.is_available,
          sort_order: payload.sort_order,
        });
      }
      const savedUrl = payload.cover_image_url;
      const savedImages = payload.images;
      if (savedUrl !== null) uploadedUrlsRef.current.delete(savedUrl);
      savedImages.forEach((u) => uploadedUrlsRef.current.delete(u));
      const toClean = new Set(uploadedUrlsRef.current);
      uploadedUrlsRef.current.clear();
      const prevUrl = originalImageUrl.current;
      originalImageUrl.current = savedUrl;
      onSuccess();
      const urlsToDelete = new Set(toClean);
      if (prevUrl !== null && prevUrl !== savedUrl) urlsToDelete.add(prevUrl);
      const removedOriginals = originalImagesRef.current.filter(
        (u) => !savedImages.includes(u),
      );
      removedOriginals.forEach((u) => urlsToDelete.add(u));
      originalImagesRef.current = savedImages;
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
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "저장 중 오류가 발생했습니다.";
      setSaveError(message);
      console.error("[SpaceForm] save error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="font-display text-lg font-light">
            {initialData ? "공간 편집" : "공간 추가"}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">
                공간명 *
              </label>
              <input
                {...register("name")}
                placeholder="예: 더 릿 스튜디오 A"
                className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">
                Slug *
              </label>
              <input
                {...register("slug")}
                placeholder="예: studio-a"
                className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
              />
              {errors.slug && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.slug.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">
              설명
            </label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="예: 자연광이 풍부한 멀티 스튜디오 공간입니다. 촬영, 워크숍, 소규모 공연에 최적화되어 있습니다."
              className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">
                카테고리
              </label>
              <select
                {...register("category")}
                className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black bg-white"
              >
                {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">
                수용 인원
              </label>
              <input
                type="number"
                {...register("capacity")}
                placeholder="예: 30"
                className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">
                면적 (㎡)
              </label>
              <input
                type="number"
                {...register("size_sqm")}
                placeholder="예: 85"
                className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
              />
            </div>
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">
                시간당 대여 가격 (₩)
              </label>
              <input
                type="number"
                {...register("rental_price_per_hour")}
                placeholder="예: 50000"
                className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">
                정렬 순서
              </label>
              <input
                type="number"
                {...register("sort_order")}
                className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("is_available")}
                  className="w-4 h-4"
                />
                <span className="text-sm font-sans text-gray-700">
                  대여 가능
                </span>
              </label>
            </div>
          </div>
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
          </div>
          <div>
            <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">
              연결된 포토 프로젝트
            </label>
            <select
              {...register("photo_project_id")}
              className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black bg-white"
            >
              <option value="">— 연결 안 함 —</option>
              {photoProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.status === "archived" ? " (보관)" : ""}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 font-sans mt-1">
              이 공간의 이미지 자산을 관리하는 포토 프로젝트를 선택하세요.
            </p>
          </div>
          <ImageUploadField
            label="대표 이미지"
            value={coverImageUrl}
            onChange={(url) => setValue("cover_image_url", url)}
            onUploadingChange={handleUploadingChange}
            onUploadComplete={handleUploadComplete}
            folder="spaces"
            photoPickerCategory="space"
          />

          {/* Additional images */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase">
                추가 이미지
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMultiPickerOpen(true)}
                  className="flex items-center gap-1 text-xs font-sans text-gray-500 hover:text-brand-black transition-colors"
                >
                  <Images size={12} /> 라이브러리에서 선택
                </button>
                <button
                  type="button"
                  onClick={addImageSlot}
                  className="flex items-center gap-1 text-xs font-sans text-gray-500 hover:text-brand-black transition-colors"
                >
                  <Plus size={12} /> 슬롯 추가
                </button>
              </div>
            </div>
            {imagesArr.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {imagesArr.map((url, idx) => (
                  <ImageUploadField
                    key={idx}
                    label=""
                    value={url}
                    onChange={(u) => updateImageSlot(idx, u)}
                    onUploadingChange={handleUploadingChange}
                    onUploadComplete={handleUploadComplete}
                    folder="spaces"
                    photoPickerCategory="space"
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 font-sans py-2">
                슬롯 추가를 눌러 이미지를 업로드하세요.
              </p>
            )}
          </div>

          {saveError && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm font-sans">
              {saveError}
            </div>
          )}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-sans text-gray-600 hover:text-brand-black"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving || uploadingCount > 0}
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
        <PhotoPickerModal
          open={multiPickerOpen}
          onClose={() => setMultiPickerOpen(false)}
          onSelect={() => {}}
          multiSelect
          onMultiSelect={(urls) => {
            setImagesArr((prev) => {
              const existing = new Set(prev.filter(Boolean));
              const newUrls = urls.filter((u) => !existing.has(u));
              return [...prev, ...newUrls];
            });
          }}
          defaultCategory="space"
        />
      </div>
    </div>
  );
}

export default function AdminSpacesPage() {
  const {
    data: spaces,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-spaces"],
    queryFn: () => spacesService.getAllAdmin(),
    staleTime: 2 * 60 * 1000,
    enabled: isSupabaseConfigured,
  });
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["spaces"] });
    queryClient.invalidateQueries({ queryKey: ["admin-spaces"] });
    setFormOpen(false);
    setEditingSpace(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 공간을 삭제하시겠습니까?")) return;
    setDeletingId(id);
    try {
      await spacesService.delete(id);
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      queryClient.invalidateQueries({ queryKey: ["admin-spaces"] });
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
            Spaces
          </h1>
          <p className="font-sans text-sm text-gray-500 mt-1">공간 관리</p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-black text-white text-sm font-sans hover:bg-brand-muted transition-colors"
        >
          <Plus size={16} />
          공간 추가
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={24} className="animate-spin text-brand-muted" />
        </div>
      ) : isError ? (
        <AdminQueryError onRetry={refetch} />
      ) : (
        <div className="bg-white border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase">
                  공간명
                </th>
                <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase hidden md:table-cell">
                  카테고리
                </th>
                <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase hidden lg:table-cell">
                  수용 인원
                </th>
                <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase hidden lg:table-cell">
                  상태
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {spaces && spaces.length > 0 ? (
                spaces.map((space) => (
                  <tr key={space.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-sans text-sm font-medium text-brand-black">
                        {space.name}
                      </p>
                      <p className="font-sans text-xs text-gray-400 mt-0.5">
                        /{space.slug}
                      </p>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-xs font-sans text-gray-600">
                        {CATEGORY_LABELS[space.category] ?? space.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-xs font-sans text-gray-600">
                        {space.capacity ? `${space.capacity}명` : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-sans tracking-widest uppercase ${PUBLISH_STATUS_COLORS[space.publish_status] ?? "bg-gray-100 text-gray-500"}`}
                        >
                          {PUBLISH_STATUS_LABELS[space.publish_status] ??
                            space.publish_status}
                        </span>
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-sans tracking-widest uppercase ${space.is_available ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"}`}
                        >
                          {space.is_available ? "대여가능" : "대여불가"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingSpace(space)}
                          className="p-1.5 text-gray-400 hover:text-brand-black transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(space.id)}
                          disabled={deletingId === space.id}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        >
                          {deletingId === space.id ? (
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
                    colSpan={5}
                    className="px-6 py-12 text-center font-sans text-sm text-gray-400"
                  >
                    등록된 공간이 없습니다. 공간을 추가하세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {(formOpen || editingSpace) && (
        <SpaceForm
          initialData={editingSpace ?? undefined}
          onClose={() => {
            setFormOpen(false);
            setEditingSpace(null);
          }}
          onSuccess={handleSuccess}
          onWarning={setStorageWarning}
        />
      )}
    </div>
  );
}
