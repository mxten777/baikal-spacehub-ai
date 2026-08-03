import { useState } from "react";
import { useMedia } from "../../hooks/useData";
import { mediaService } from "../../services/media";
import type { MediaItem } from "../../types";
import { useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  Youtube,
  Instagram,
  Twitter,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AdminQueryError from "../../components/admin/AdminQueryError";

const mediaSchema = z.object({
  platform: z.enum(["youtube", "instagram", "x"]),
  url: z.string().url("유효한 URL을 입력하세요"),
  title: z.string().optional(),
  description: z.string().optional(),
  thumbnail_url: z
    .string()
    .url("유효한 URL을 입력하세요")
    .optional()
    .or(z.literal("")),
  published_at: z.string().optional(),
  is_featured: z.boolean().default(false),
  sort_order: z.coerce.number().default(0),
});

type MediaFormData = z.infer<typeof mediaSchema>;

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  youtube: Youtube,
  instagram: Instagram,
  x: Twitter,
};

const PLATFORM_COLORS: Record<string, string> = {
  youtube: "text-red-500",
  instagram: "text-pink-500",
  x: "text-gray-700",
};

function MediaItemForm({
  initialData,
  onClose,
  onSuccess,
}: {
  initialData?: MediaItem;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MediaFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(mediaSchema) as any,
    defaultValues: initialData
      ? {
          platform: initialData.platform,
          url: initialData.url,
          title: initialData.title ?? "",
          description: initialData.description ?? "",
          thumbnail_url: initialData.thumbnail_url ?? "",
          published_at: initialData.published_at?.split("T")[0] ?? "",
          is_featured: initialData.is_featured,
          sort_order: initialData.sort_order,
        }
      : {
          platform: "youtube",
          url: "",
          title: "",
          description: "",
          thumbnail_url: "",
          published_at: "",
          is_featured: false,
          sort_order: 0,
        },
  });

  const onSubmit = async (data: MediaFormData) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        thumbnail_url: data.thumbnail_url || null,
        published_at: data.published_at || null,
      };
      if (initialData) {
        await mediaService.upsert({ ...payload, id: initialData.id });
      } else {
        await mediaService.upsert(payload);
      }
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="font-display text-lg font-light">
            {initialData ? "미디어 편집" : "미디어 추가"}
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
                플랫폼
              </label>
              <select
                {...register("platform")}
                className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black bg-white"
              >
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="x">X (Twitter)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">
                발행일
              </label>
              <input
                type="date"
                {...register("published_at")}
                className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">
              URL *
            </label>
            <input
              {...register("url")}
              placeholder="https://"
              className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
            />
            {errors.url && (
              <p className="text-red-500 text-xs mt-1">{errors.url.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">
              제목
            </label>
            <input
              {...register("title")}
              className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
            />
          </div>
          <div>
            <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">
              설명
            </label>
            <textarea
              {...register("description")}
              rows={2}
              className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">
              썸네일 URL
            </label>
            <input
              {...register("thumbnail_url")}
              placeholder="https://"
              className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
            />
            {errors.thumbnail_url && (
              <p className="text-red-500 text-xs mt-1">
                {errors.thumbnail_url.message}
              </p>
            )}
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
                  {...register("is_featured")}
                  className="w-4 h-4"
                />
                <span className="text-sm font-sans text-gray-700">
                  메인 노출
                </span>
              </label>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-sans text-gray-600 hover:text-brand-black"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
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

export default function AdminMediaPage() {
  const { data: mediaItems, isLoading, isError, refetch } = useMedia();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["media"] });
    setFormOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 미디어 항목을 삭제하시겠습니까?")) return;
    setDeletingId(id);
    try {
      await mediaService.delete(id);
      queryClient.invalidateQueries({ queryKey: ["media"] });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-light text-brand-black">
            Media
          </h1>
          <p className="font-sans text-sm text-gray-500 mt-1">
            SNS 미디어 관리
          </p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-black text-white text-sm font-sans hover:bg-brand-muted transition-colors"
        >
          <Plus size={16} />
          미디어 추가
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
                  플랫폼
                </th>
                <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase">
                  제목 / URL
                </th>
                <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase hidden lg:table-cell">
                  발행일
                </th>
                <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase hidden md:table-cell">
                  Featured
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
              ) : mediaItems && mediaItems.length > 0 ? (
                mediaItems.map((item) => {
                  const PlatformIcon = PLATFORM_ICONS[item.platform] ?? Twitter;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <PlatformIcon
                          size={18}
                          className={
                            PLATFORM_COLORS[item.platform] ?? "text-gray-400"
                          }
                        />
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-sans text-sm font-medium text-brand-black line-clamp-1">
                          {item.title || "(제목 없음)"}
                        </p>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-sans text-xs text-brand-accent hover:underline line-clamp-1"
                        >
                          {item.url}
                        </a>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-xs font-sans text-gray-600">
                          {item.published_at
                            ? new Date(item.published_at).toLocaleDateString(
                                "ko-KR",
                              )
                            : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        {item.is_featured ? (
                          <span className="inline-block px-2 py-0.5 text-[10px] font-sans tracking-widest uppercase bg-brand-accent/20 text-brand-accent">
                            Yes
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
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
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center font-sans text-sm text-gray-400"
                  >
                    등록된 미디어 항목이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {(formOpen || editingItem) && (
        <MediaItemForm
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
