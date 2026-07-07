import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  RefreshCw,
  Rss,
  Youtube,
  Instagram,
  Twitter,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { contentSourcesService } from "../../services/contentSources";
import { runFetchForSource } from "../../services/fetchers/aggregator";
import type { ContentSource, ContentPlatform } from "../../types";
import { format } from "date-fns";

const sourceSchema = z.object({
  name: z.string().min(1, "소스 이름을 입력하세요"),
  platform: z.enum(["rss", "youtube", "instagram", "x"]),
  source_url: z.string().optional().or(z.literal("")),
  rss_url: z.string().optional().or(z.literal("")),
  channel_id: z.string().optional().or(z.literal("")),
  account_handle: z.string().optional().or(z.literal("")),
  is_active: z.boolean().default(true),
  auto_publish: z.boolean().default(false),
  fetch_interval_minutes: z.coerce.number().min(5).max(1440).default(60),
});

type SourceFormData = z.infer<typeof sourceSchema>;

const PLATFORM_ICONS: Record<ContentPlatform, React.ElementType> = {
  rss: Rss,
  youtube: Youtube,
  instagram: Instagram,
  x: Twitter,
};

const PLATFORM_LABELS: Record<ContentPlatform, string> = {
  rss: "Blog RSS",
  youtube: "YouTube",
  instagram: "Instagram",
  x: "X (Twitter)",
};

const PLATFORM_COLORS: Record<ContentPlatform, string> = {
  rss: "text-orange-500",
  youtube: "text-red-500",
  instagram: "text-pink-500",
  x: "text-gray-700",
};

function SourceForm({
  initialData,
  onClose,
  onSuccess,
}: {
  initialData?: ContentSource;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SourceFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(sourceSchema) as any,
    defaultValues: initialData
      ? {
          name: initialData.name,
          platform: initialData.platform,
          source_url: initialData.source_url ?? "",
          rss_url: initialData.rss_url ?? "",
          channel_id: initialData.channel_id ?? "",
          account_handle: initialData.account_handle ?? "",
          is_active: initialData.is_active,
          auto_publish: initialData.auto_publish,
          fetch_interval_minutes: initialData.fetch_interval_minutes,
        }
      : {
          platform: "rss",
          is_active: true,
          auto_publish: false,
          fetch_interval_minutes: 60,
        },
  });

  const platform = watch("platform");

  const onSubmit = async (data: SourceFormData) => {
    setSaving(true);
    try {
      const payload = {
        name: data.name,
        platform: data.platform,
        source_url: data.source_url || null,
        rss_url: data.rss_url || null,
        channel_id: data.channel_id || null,
        account_handle: data.account_handle || null,
        is_active: data.is_active,
        auto_publish: data.auto_publish,
        fetch_interval_minutes: data.fetch_interval_minutes,
      };
      if (initialData) {
        await contentSourcesService.update(initialData.id, payload);
      } else {
        await contentSourcesService.create(payload);
      }
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="font-display text-lg font-light">
            {initialData ? "소스 편집" : "새 소스 추가"}
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
          <div>
            <label className="label-xs">소스 이름 *</label>
            <input
              {...register("name")}
              placeholder="예: 더릿 네이버 블로그"
              className="input-base"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="label-xs">플랫폼 *</label>
            <select {...register("platform")} className="input-base bg-white">
              {(Object.keys(PLATFORM_LABELS) as ContentPlatform[]).map((p) => (
                <option key={p} value={p}>
                  {PLATFORM_LABELS[p]}
                </option>
              ))}
            </select>
          </div>

          {platform === "rss" && (
            <div>
              <label className="label-xs">RSS URL *</label>
              <input
                {...register("rss_url")}
                placeholder="https://blog.naver.com/.../rss"
                className="input-base"
              />
            </div>
          )}

          {platform === "youtube" && (
            <>
              <div>
                <label className="label-xs">채널 ID</label>
                <input
                  {...register("channel_id")}
                  placeholder="UCxxxxxxxxxxxxxxxx"
                  className="input-base"
                />
                <p className="text-xs text-gray-400 mt-1">
                  채널 ID 또는 아래 Playlist URL 둘 중 하나 입력
                </p>
              </div>
              <div>
                <label className="label-xs">Playlist URL (선택)</label>
                <input
                  {...register("source_url")}
                  placeholder="https://youtube.com/playlist?list=..."
                  className="input-base"
                />
              </div>
            </>
          )}

          {platform === "instagram" && (
            <div>
              <label className="label-xs">계정 핸들</label>
              <input
                {...register("account_handle")}
                placeholder="@thelit_kr"
                className="input-base"
              />
              <p className="text-xs text-gray-400 mt-1">
                Access Token은 Settings 페이지에서 설정하세요
              </p>
            </div>
          )}

          {platform === "x" && (
            <div>
              <label className="label-xs">계정 핸들 *</label>
              <input
                {...register("account_handle")}
                placeholder="@thelit_kr"
                className="input-base"
              />
              <p className="text-xs text-gray-400 mt-1">
                Bearer Token은 Settings 페이지에서 설정하세요
              </p>
            </div>
          )}

          <div>
            <label className="label-xs">수집 주기 (분)</label>
            <input
              type="number"
              {...register("fetch_interval_minutes")}
              className="input-base"
              min={5}
              max={1440}
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("is_active")}
                className="w-4 h-4"
              />
              <span className="text-sm font-sans text-gray-700">활성화</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("auto_publish")}
                className="w-4 h-4"
              />
              <span className="text-sm font-sans text-gray-700">
                수집 즉시 자동 공개
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-5 py-2"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-5 py-2 flex items-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {initialData ? "저장" : "추가"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminContentSourcesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<ContentSource | undefined>();
  const [fetchingId, setFetchingId] = useState<string | null>(null);
  const [fetchResult, setFetchResult] = useState<string | null>(null);

  const { data: sources = [], isLoading } = useQuery({
    queryKey: ["content-sources"],
    queryFn: () => contentSourcesService.getAll(),
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["content-sources"] });

  const handleDelete = async (id: string) => {
    if (!confirm("이 소스를 삭제하시겠습니까? 수집된 콘텐츠는 유지됩니다."))
      return;
    await contentSourcesService.delete(id);
    refresh();
  };

  const handleFetch = async (source: ContentSource) => {
    setFetchingId(source.id);
    setFetchResult(null);
    try {
      const result = await runFetchForSource(source.id);
      setFetchResult(
        `✓ ${result.items_found}개 확인 · ${result.items_new}개 신규 저장 · ${result.items_skipped}개 중복 건너뜀`,
      );
      refresh();
      qc.invalidateQueries({ queryKey: ["external-contents"] });
    } catch (e) {
      setFetchResult(`✗ 오류: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setFetchingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-light text-brand-black">
            콘텐츠 소스 관리
          </h1>
          <p className="font-sans text-sm text-gray-500 mt-1">
            RSS, YouTube, Instagram, X 수집 소스를 등록·관리합니다
          </p>
        </div>
        <button
          onClick={() => {
            setEditTarget(undefined);
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2 px-5 py-2"
        >
          <Plus size={16} />새 소스 추가
        </button>
      </div>

      {fetchResult && (
        <div
          className={`mb-4 p-3 text-sm font-sans border ${
            fetchResult.startsWith("✓")
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {fetchResult}
          <button
            onClick={() => setFetchResult(null)}
            className="ml-3 opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-16 text-gray-400">
          <Loader2 size={32} className="animate-spin mx-auto" />
        </div>
      ) : sources.length === 0 ? (
        <div className="text-center py-16 text-gray-400 border border-dashed border-gray-200">
          <Rss size={32} className="mx-auto mb-3 opacity-40" />
          <p className="font-sans text-sm">등록된 소스가 없습니다.</p>
          <p className="font-sans text-xs mt-1">
            위 "새 소스 추가" 버튼으로 RSS, YouTube, Instagram, X 소스를
            등록하세요.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sources.map((source) => {
            const Icon = PLATFORM_ICONS[source.platform];
            const isFetching = fetchingId === source.id;
            return (
              <div
                key={source.id}
                className="bg-white border border-gray-200 p-5 flex items-center gap-4"
              >
                <div className={`shrink-0 ${PLATFORM_COLORS[source.platform]}`}>
                  <Icon size={24} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-sans text-sm font-medium text-brand-black">
                      {source.name}
                    </span>
                    <span className="text-xs text-gray-400 uppercase tracking-wider">
                      {PLATFORM_LABELS[source.platform]}
                    </span>
                    {!source.is_active && (
                      <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5">
                        비활성
                      </span>
                    )}
                    {source.auto_publish && (
                      <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5">
                        자동 공개
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    {source.rss_url ??
                      source.channel_id ??
                      source.account_handle ??
                      source.source_url ??
                      "—"}
                  </p>
                  <p className="text-xs text-gray-300 mt-0.5">
                    수집 주기: {source.fetch_interval_minutes}분 · 마지막 수집:{" "}
                    {source.last_fetched_at
                      ? format(new Date(source.last_fetched_at), "MM/dd HH:mm")
                      : "없음"}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleFetch(source)}
                    disabled={isFetching || !source.is_active}
                    title="지금 수집 실행"
                    className="p-2 text-gray-400 hover:text-brand-black disabled:opacity-40 transition-colors"
                  >
                    {isFetching ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <RefreshCw size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setEditTarget(source);
                      setShowForm(true);
                    }}
                    className="p-2 text-gray-400 hover:text-brand-black transition-colors"
                    title="편집"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(source.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <SourceForm
          initialData={editTarget}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}
