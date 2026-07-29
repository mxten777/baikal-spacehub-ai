import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Star, ImageOff, FolderKanban, Loader2 } from "lucide-react";
import {
  getAdminPhotosByCategory,
  updatePhotoRecord,
} from "../../services/photoRepository";
import type { PhotoRecord, ProjectStage } from "../../types";
import PhotoDetailPanel from "../../components/admin/photo-projects/PhotoDetailPanel";
import AdminQueryError from "../../components/admin/AdminQueryError";
import { isSupabaseConfigured } from "../../lib/supabase";

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGE_TABS: { value: ProjectStage | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "source", label: "Source" },
  { value: "selected", label: "Selected" },
  { value: "edited", label: "Edited" },
  { value: "web", label: "Web (공개)" },
  { value: "pdf", label: "PDF" },
];

const STAGE_BADGE: Record<ProjectStage, string> = {
  web: "bg-green-100 text-green-700",
  edited: "bg-blue-100 text-blue-700",
  selected: "bg-yellow-100 text-yellow-700",
  source: "bg-gray-100 text-gray-500",
  pdf: "bg-purple-100 text-purple-700",
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-4 border bg-white ${highlight ? "border-brand-black" : "border-brand-border"}`}
    >
      <p className="text-2xl font-display font-light text-brand-black">
        {value}
      </p>
      <p className="mt-1 text-[10px] font-sans text-brand-muted tracking-widest uppercase">
        {label}
      </p>
    </div>
  );
}

// ─── Photo Tile ───────────────────────────────────────────────────────────────

function PhotoTile({
  photo,
  isSelected,
  onSelect,
  onToggleFeatured,
}: {
  photo: PhotoRecord;
  isSelected: boolean;
  onSelect: () => void;
  onToggleFeatured: () => void;
}) {
  return (
    <div
      className={`relative group cursor-pointer border-2 transition-colors ${
        isSelected
          ? "border-brand-black"
          : "border-transparent hover:border-gray-300"
      }`}
      onClick={onSelect}
    >
      {/* Thumbnail */}
      <div className="aspect-square bg-gray-100 overflow-hidden">
        {photo.public_url ? (
          <img
            src={photo.public_url}
            alt={photo.original_name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ImageOff size={20} />
          </div>
        )}
      </div>

      {/* Stage badge */}
      {photo.project_stage && (
        <span
          className={`absolute top-1 left-1 px-1.5 py-0.5 text-[9px] font-sans uppercase tracking-wide ${STAGE_BADGE[photo.project_stage] ?? "bg-gray-100 text-gray-500"}`}
        >
          {photo.project_stage}
        </span>
      )}

      {/* Featured toggle */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFeatured();
        }}
        className={`absolute top-1 right-1 p-0.5 transition-colors ${
          photo.is_featured
            ? "text-amber-500"
            : "text-transparent group-hover:text-white/70 hover:!text-amber-400"
        }`}
        aria-label={photo.is_featured ? "대표 사진 해제" : "대표 사진 지정"}
      >
        <Star
          size={14}
          fill={photo.is_featured ? "currentColor" : "none"}
          stroke={photo.is_featured ? "currentColor" : "white"}
        />
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminWeddingPage() {
  const queryClient = useQueryClient();
  const [stage, setStage] = useState<ProjectStage | "all">("all");
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoRecord | null>(null);

  const {
    data: photos = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-wedding-photos"],
    queryFn: () => getAdminPhotosByCategory("wedding"),
    enabled: isSupabaseConfigured,
    staleTime: 60 * 1000,
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: ({
      id,
      is_featured,
    }: {
      id: string;
      is_featured: boolean;
    }) => updatePhotoRecord(id, { is_featured }),
    onSuccess: (updated) => {
      queryClient.setQueryData<PhotoRecord[]>(
        ["admin-wedding-photos"],
        (old) => old?.map((p) => (p.id === updated.id ? updated : p)) ?? [],
      );
      if (selectedPhoto?.id === updated.id) {
        setSelectedPhoto(updated);
      }
    },
  });

  const handleSaved = useCallback(
    (updated: PhotoRecord) => {
      queryClient.setQueryData<PhotoRecord[]>(
        ["admin-wedding-photos"],
        (old) => old?.map((p) => (p.id === updated.id ? updated : p)) ?? [],
      );
      setSelectedPhoto(updated);
    },
    [queryClient],
  );

  const filtered =
    stage === "all"
      ? photos
      : photos.filter((p) => p.project_stage === stage);

  const webReady = photos.filter((p) => p.project_stage === "web").length;
  const featuredCount = photos.filter((p) => p.is_featured).length;

  return (
    <div className="flex gap-0 h-full">
      {/* Main content */}
      <div className="flex-1 min-w-0 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-light text-brand-black">
              웨딩 사진 관리
            </h1>
            <p className="mt-1 text-sm font-sans text-brand-muted">
              Stage가 <span className="font-medium text-green-700">Web</span>인
              사진이 <code className="text-xs">/wedding</code> 공개 페이지에
              표시됩니다
            </p>
          </div>
          <Link
            to="/admin/photo-projects"
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-sans border border-brand-border hover:border-brand-black transition-colors text-brand-black"
          >
            <FolderKanban size={14} />
            포토 프로젝트
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard label="전체 사진" value={photos.length} />
          <StatCard label="Web (공개)" value={webReady} highlight />
          <StatCard label="대표 사진" value={featuredCount} />
        </div>

        {/* Stage filter */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {STAGE_TABS.map((tab) => {
            const count =
              tab.value === "all"
                ? photos.length
                : photos.filter((p) => p.project_stage === tab.value).length;
            return (
              <button
                key={tab.value}
                onClick={() => setStage(tab.value)}
                className={`px-3 py-1.5 text-xs font-sans tracking-wide transition-colors ${
                  stage === tab.value
                    ? "bg-brand-black text-white"
                    : "border border-brand-border text-brand-muted hover:border-brand-black hover:text-brand-black"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Content area */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-brand-muted">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : error ? (
          <AdminQueryError message={(error as Error).message} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-brand-muted gap-3">
            <ImageOff size={32} className="opacity-30" />
            <p className="text-sm font-sans">
              {stage === "all"
                ? "등록된 웨딩 사진이 없습니다"
                : `${stage} 단계의 사진이 없습니다`}
            </p>
            <Link
              to="/admin/photo-projects"
              className="text-xs underline underline-offset-2"
            >
              포토 프로젝트에서 업로드하기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {filtered.map((photo) => (
              <PhotoTile
                key={photo.id}
                photo={photo}
                isSelected={selectedPhoto?.id === photo.id}
                onSelect={() =>
                  setSelectedPhoto(
                    selectedPhoto?.id === photo.id ? null : photo,
                  )
                }
                onToggleFeatured={() =>
                  toggleFeaturedMutation.mutate({
                    id: photo.id,
                    is_featured: !photo.is_featured,
                  })
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail panel — sticky slideout */}
      {selectedPhoto && (
        <div className="w-[320px] shrink-0 border-l border-brand-border bg-white h-full overflow-y-auto">
          <PhotoDetailPanel
            photo={selectedPhoto}
            projectId={selectedPhoto.project_id ?? ""}
            onClose={() => setSelectedPhoto(null)}
            onSaved={handleSaved}
          />
        </div>
      )}
    </div>
  );
}
