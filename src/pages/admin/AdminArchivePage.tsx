import { useState } from "react";
import { useArchive } from "../../hooks/useData";
import { archiveService } from "../../services/archive";
import type { ArchiveItem } from "../../types";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X, Check, Loader2, Images } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ImageUploadField from "../../components/admin/ImageUploadField";
import PhotoPickerModal from "../../components/admin/PhotoPickerModal";

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
});

type ArchiveFormData = z.infer<typeof archiveSchema>;

function ArchiveItemForm({
  initialData,
  onClose,
  onSuccess,
}: {
  initialData?: ArchiveItem;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
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
        },
  });
  const coverImageUrl = watch("cover_image_url");
  const galleryImages = watch("images") ?? [];

  const onSubmit = async (data: ArchiveFormData) => {
    setSaving(true);
    setSubmitError(null);
    try {
      const payload = {
        ...data,
        images: data.images ?? [],
        cover_image_url: data.cover_image_url ?? null,
      };
      if (initialData) {
        await archiveService.update(initialData.id, payload);
      } else {
        await archiveService.create(payload);
      }
      onSuccess();
    } catch (e) {
      console.error("[AdminArchivePage] save error:", e);
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
            {initialData ? "아카이브 편집" : "아카이브 추가"}
          </h2>
          <button
            onClick={onClose}
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
                카테고리 *
              </label>
              <input
                {...register("category")}
                placeholder="전시, 공연, 이벤트..."
                className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
              />
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
              설명
            </label>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black resize-none"
            />
          </div>
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
                  <div key={idx} className="relative group aspect-square bg-gray-100 overflow-hidden">
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
          </div>{" "}
          <ImageUploadField
            label="대표 이미지 (cover)"
            value={coverImageUrl}
            onChange={(url) => setValue("cover_image_url", url)}
            onUploadingChange={setUploadingImage}
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
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            {submitError && (
              <p className="flex-1 text-xs text-red-500 font-sans">{submitError}</p>
            )}
            <button
              type="button"
              onClick={onClose}
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
  const { data: archives, isLoading } = useArchive();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ArchiveItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["archive"] });
    setFormOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 아카이브 항목을 삭제하시겠습니까?")) return;
    setDeletingId(id);
    try {
      await archiveService.delete(id);
      queryClient.invalidateQueries({ queryKey: ["archive"] });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
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

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={24} className="animate-spin text-brand-muted" />
        </div>
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
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {archives && archives.length > 0 ? (
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
        />
      )}
    </div>
  );
}
