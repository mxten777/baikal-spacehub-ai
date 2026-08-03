import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Upload, X, Trash2, ImageOff } from "lucide-react";
import { useRef, useState, useCallback, useMemo } from "react";
import {
  getPhotoProjectById,
  getProjectPhotoCounts,
  getProjectPhotosByCell,
} from "../../services/photoProjects";
import { uploadProjectPhoto, deletePhoto } from "../../services/photoStorage";
import {
  markPhotoDeletePending,
  deletePhotoRecord,
} from "../../services/photoRepository";
import { useAuth } from "../../hooks/useAuth";
import type { PhotoRecord, ProjectCategory, ProjectStage } from "../../types";
import PhotoDetailPanel from "../../components/admin/photo-projects/PhotoDetailPanel";

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES: { key: ProjectCategory; label: string }[] = [
  { key: "main", label: "Main" },
  { key: "wedding", label: "Wedding" },
  { key: "space", label: "Space" },
  { key: "food_beverage", label: "F&B" },
  { key: "archive", label: "Archive" },
  { key: "online_wedding", label: "Online Wedding" },
  { key: "online_space", label: "Online Space" },
  { key: "contact", label: "Contact" },
  { key: "about", label: "About" },
];

const STAGES: { key: ProjectStage; label: string }[] = [
  { key: "source", label: "Source" },
  { key: "selected", label: "Selected" },
  { key: "edited", label: "Edited" },
  { key: "web", label: "Web" },
  { key: "pdf", label: "PDF" },
];

// ─── Stage Upload Cell ────────────────────────────────────────────────────────

interface CellProgress {
  done: number;
  total: number;
}

interface StageUploadCellProps {
  count: number;
  progress: CellProgress | null;
  error: string | null;
  onUploadClick: () => void;
  onViewClick: () => void;
}

function StageUploadCell({
  count,
  progress,
  error,
  onUploadClick,
  onViewClick,
}: StageUploadCellProps) {
  const isUploading = progress !== null;
  return (
    <td className="px-3 py-4 text-center border-l border-gray-100">
      <div className="inline-flex items-center gap-1">
        {/* Count badge — click opens slideout when there are photos */}
        <button
          type="button"
          onClick={count > 0 && !isUploading ? onViewClick : undefined}
          disabled={isUploading || count === 0}
          title={
            isUploading
              ? `업로드 중 ${progress!.done}/${progress!.total}`
              : count > 0
                ? `${count}장 보기`
                : "사진 없음"
          }
          className={`text-xs font-sans tabular-nums px-2 py-0.5 transition-colors ${
            isUploading
              ? "bg-blue-100 text-blue-600 cursor-default"
              : count > 0
                ? "bg-brand-black text-white hover:bg-gray-700 cursor-pointer"
                : "bg-gray-100 text-gray-400 cursor-default"
          }`}
        >
          {isUploading ? `${progress!.done}/${progress!.total}` : count}
        </button>

        {/* Upload button */}
        <button
          type="button"
          onClick={onUploadClick}
          disabled={isUploading}
          title="이미지 업로드 (복수 선택 가능)"
          className="p-0.5 text-gray-400 hover:text-brand-black disabled:opacity-30 transition-colors"
        >
          <Upload size={11} />
        </button>
      </div>
      {error && (
        <p className="mt-0.5 text-[10px] text-red-500 leading-tight">{error}</p>
      )}
    </td>
  );
}

// ─── Category Row ─────────────────────────────────────────────────────────────

interface CategoryRowProps {
  category: ProjectCategory;
  label: string;
  counts: Record<string, number>;
  progress: Record<string, CellProgress>;
  errors: Record<string, string>;
  onUploadClick: (category: ProjectCategory, stage: ProjectStage) => void;
  onViewClick: (category: ProjectCategory, stage: ProjectStage) => void;
}

function CategoryRow({
  category,
  label,
  counts,
  progress,
  errors,
  onUploadClick,
  onViewClick,
}: CategoryRowProps) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 border-r border-gray-100">
        <span className="font-sans text-sm text-brand-black">{label}</span>
      </td>
      {STAGES.map((stage) => {
        const key = `${category}/${stage.key}`;
        return (
          <StageUploadCell
            key={stage.key}
            count={counts[key] ?? 0}
            progress={progress[key] ?? null}
            error={errors[key] ?? null}
            onUploadClick={() => onUploadClick(category, stage.key)}
            onViewClick={() => onViewClick(category, stage.key)}
          />
        );
      })}
    </tr>
  );
}

// ─── Cell Photo Slideout ──────────────────────────────────────────────────────

interface CellPhotoSlideoutProps {
  projectId: string;
  category: ProjectCategory;
  stage: ProjectStage;
  onClose: () => void;
  onCountChanged: () => void;
}

function CellPhotoSlideout({
  projectId,
  category,
  stage,
  onClose,
  onCountChanged,
}: CellPhotoSlideoutProps) {
  const queryClient = useQueryClient();
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [deleteErrors, setDeleteErrors] = useState<Record<string, string>>({});
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoRecord | null>(null);

  const queryKey = useMemo(
    () => ["project-cell-photos", projectId, category, stage],
    [projectId, category, stage],
  );

  const {
    data: photos = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey,
    queryFn: () => getProjectPhotosByCell(projectId, category, stage),
  });

  const handlePhotoSaved = useCallback(
    (updated: PhotoRecord) => {
      setSelectedPhoto(updated);
      queryClient.setQueryData(queryKey, (old: PhotoRecord[] | undefined) =>
        old ? old.map((p) => (p.id === updated.id ? updated : p)) : old,
      );
    },
    [queryClient, queryKey],
  );

  const handleDelete = useCallback(
    async (photo: PhotoRecord) => {
      setDeletingIds((prev) => new Set(prev).add(photo.id));
      setDeleteErrors((prev) => {
        const n = { ...prev };
        delete n[photo.id];
        return n;
      });
      try {
        await markPhotoDeletePending(photo.id);
        await deletePhoto(photo.storage_path);
        await deletePhotoRecord(photo.id);
        queryClient.invalidateQueries({ queryKey });
        queryClient.invalidateQueries({
          queryKey: ["project-photo-counts", projectId],
        });
        onCountChanged();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "삭제 실패";
        setDeleteErrors((prev) => ({ ...prev, [photo.id]: msg }));
      } finally {
        setDeletingIds((prev) => {
          const n = new Set(prev);
          n.delete(photo.id);
          return n;
        });
      }
    },
    [queryClient, queryKey, projectId, onCountChanged],
  );

  const categoryLabel =
    CATEGORIES.find((c) => c.key === category)?.label ?? category;
  const stageLabel = STAGES.find((s) => s.key === stage)?.label ?? stage;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={selectedPhoto ? () => setSelectedPhoto(null) : onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className="fixed right-0 top-0 bottom-0 w-[420px] max-w-full bg-white border-l border-gray-200 z-50 flex flex-col shadow-xl"
        role="dialog"
        aria-label={
          selectedPhoto
            ? `${selectedPhoto.original_name} 상세`
            : `${categoryLabel} / ${stageLabel} 사진 목록`
        }
      >
        {selectedPhoto ? (
          /* ── Photo Detail View ── */
          <PhotoDetailPanel
            photo={selectedPhoto}
            projectId={projectId}
            onClose={() => setSelectedPhoto(null)}
            onSaved={handlePhotoSaved}
          />
        ) : (
          /* ── Photo Grid View ── */
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <div>
                <p className="font-sans text-xs text-gray-400 uppercase tracking-wider">
                  {categoryLabel}
                </p>
                <p className="font-display text-lg font-light text-brand-black">
                  {stageLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-brand-black transition-colors"
                aria-label="닫기"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading && (
                <div className="flex items-center justify-center h-32">
                  <Loader2
                    size={20}
                    className="animate-spin text-brand-muted"
                  />
                </div>
              )}
              {isError && (
                <p className="font-sans text-sm text-red-600 text-center mt-8">
                  사진을 불러오지 못했습니다.
                </p>
              )}
              {!isLoading && !isError && photos.length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 gap-2 text-gray-400">
                  <ImageOff size={24} className="opacity-40" />
                  <p className="font-sans text-sm">사진이 없습니다.</p>
                </div>
              )}
              {!isLoading && photos.length > 0 && (
                <ul className="grid grid-cols-2 gap-3">
                  {photos.map((photo) => {
                    const isDeleting = deletingIds.has(photo.id);
                    return (
                      <li
                        key={photo.id}
                        className={`relative group bg-gray-50 border border-gray-100 cursor-pointer hover:border-gray-400 transition-colors ${isDeleting ? "pointer-events-none" : ""}`}
                        onClick={() => !isDeleting && setSelectedPhoto(photo)}
                      >
                        {/* Thumbnail */}
                        {photo.public_url ? (
                          <img
                            src={photo.public_url}
                            alt={photo.original_name}
                            className={`w-full aspect-square object-cover transition-opacity ${isDeleting ? "opacity-30" : ""}`}
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full aspect-square flex items-center justify-center bg-gray-100">
                            <ImageOff size={20} className="text-gray-300" />
                          </div>
                        )}

                        {/* Delete overlay */}
                        {!isDeleting && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(photo);
                            }}
                            title="삭제"
                            className="absolute top-1.5 right-1.5 p-1 bg-white/90 border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-300 opacity-0 group-hover:opacity-100 transition-all"
                            aria-label={`${photo.original_name} 삭제`}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}

                        {isDeleting && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2
                              size={18}
                              className="animate-spin text-brand-muted"
                            />
                          </div>
                        )}

                        {/* Filename */}
                        <p className="px-1.5 py-1 text-[10px] font-sans text-gray-500 truncate">
                          {photo.original_name}
                        </p>

                        {deleteErrors[photo.id] && (
                          <p className="px-1.5 pb-1 text-[10px] text-red-500 leading-tight">
                            {deleteErrors[photo.id]}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 shrink-0">
              <p className="font-sans text-xs text-gray-400">
                {photos.length > 0 ? `${photos.length}장` : "없음"} · 클릭 →
                상세 편집 &nbsp;·&nbsp; 삭제는 ✕ 아이콘
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPhotoAssetExplorerPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeCellRef = useRef<{
    category: ProjectCategory;
    stage: ProjectStage;
  } | null>(null);

  // Multi-upload progress: key → { done, total }
  const [cellProgress, setCellProgress] = useState<
    Record<string, CellProgress>
  >({});
  const [cellErrors, setCellErrors] = useState<Record<string, string>>({});

  // Drill-down slideout
  const [activeCell, setActiveCell] = useState<{
    category: ProjectCategory;
    stage: ProjectStage;
  } | null>(null);

  const {
    data: project,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-photo-project", projectId],
    queryFn: () => getPhotoProjectById(projectId!),
    enabled: !!projectId,
  });

  const { data: counts = {} } = useQuery({
    queryKey: ["project-photo-counts", projectId],
    queryFn: () => getProjectPhotoCounts(projectId!),
    enabled: !!projectId,
  });

  const handleUploadClick = (
    category: ProjectCategory,
    stage: ProjectStage,
  ) => {
    if (!fileInputRef.current) return;
    activeCellRef.current = { category, stage };
    fileInputRef.current.value = "";
    fileInputRef.current.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const active = activeCellRef.current;
    if (!files.length || !active || !project || !user) return;

    const key = `${active.category}/${active.stage}`;
    setCellErrors((prev) => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
    setCellProgress((prev) => ({
      ...prev,
      [key]: { done: 0, total: files.length },
    }));

    let done = 0;
    const errors: string[] = [];

    for (const file of files) {
      try {
        await uploadProjectPhoto({
          projectId: project.id,
          projectSlug: project.slug,
          category: active.category,
          stage: active.stage,
          file,
          uploadedBy: user.id,
        });
        done++;
        setCellProgress((prev) => ({
          ...prev,
          [key]: { done, total: files.length },
        }));
        queryClient.invalidateQueries({
          queryKey: ["project-photo-counts", projectId],
        });
      } catch (err) {
        errors.push(err instanceof Error ? err.message : "업로드 실패");
        done++;
        setCellProgress((prev) => ({
          ...prev,
          [key]: { done, total: files.length },
        }));
      }
    }

    setCellProgress((prev) => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
    if (errors.length > 0) {
      setCellErrors((prev) => ({
        ...prev,
        [key]: `${errors.length}개 실패: ${errors[0]}`,
      }));
    }
    activeCellRef.current = null;
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-28" />
        <div className="h-7 bg-gray-100 rounded w-56" />
        <div className="h-64 bg-gray-100 rounded" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <Link
          to="/admin/photo-projects"
          className="inline-flex items-center gap-1.5 text-sm font-sans text-gray-500 hover:text-brand-black transition-colors"
        >
          <ArrowLeft size={14} />
          Photo Projects
        </Link>
        <p className="font-sans text-sm text-red-600">
          프로젝트를 불러오지 못했습니다.
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-4">
        <Link
          to="/admin/photo-projects"
          className="inline-flex items-center gap-1.5 text-sm font-sans text-gray-500 hover:text-brand-black transition-colors"
        >
          <ArrowLeft size={14} />
          Photo Projects
        </Link>
        <p className="font-sans text-sm text-red-600">
          존재하지 않는 프로젝트입니다.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Hidden multi-file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Back navigation */}
      <Link
        to="/admin/photo-projects"
        className="inline-flex items-center gap-1.5 text-sm font-sans text-gray-500 hover:text-brand-black transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Photo Projects
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-light text-brand-black">
            {project.name}
          </h1>
          <p className="font-sans text-xs text-gray-400 mt-1">
            /{project.slug}
          </p>
        </div>
        <span
          className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-sans tracking-widest uppercase ${
            project.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {project.status}
        </span>
      </div>

      {/* Asset Explorer Grid */}
      <div className="bg-white border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase border-r border-gray-200 w-40">
                Category
              </th>
              {STAGES.map((stage) => (
                <th
                  key={stage.key}
                  className="px-4 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase text-center border-l border-gray-200"
                >
                  {stage.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {CATEGORIES.map((cat) => (
              <CategoryRow
                key={cat.key}
                category={cat.key}
                label={cat.label}
                counts={counts}
                progress={cellProgress}
                errors={cellErrors}
                onUploadClick={handleUploadClick}
                onViewClick={(category, stage) =>
                  setActiveCell({ category, stage })
                }
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <p className="mt-4 font-sans text-xs text-gray-400">
        숫자 배지 클릭 → 사진 목록 보기 / 삭제 &nbsp;·&nbsp; ↑ 아이콘 클릭 →
        이미지 업로드 (JPG · PNG · WebP, 20MB 이하, 다중 선택 가능)
      </p>

      {/* Cell drill-down slideout */}
      {activeCell && projectId && (
        <CellPhotoSlideout
          projectId={projectId}
          category={activeCell.category}
          stage={activeCell.stage}
          onClose={() => setActiveCell(null)}
          onCountChanged={() =>
            queryClient.invalidateQueries({
              queryKey: ["project-photo-counts", projectId],
            })
          }
        />
      )}
    </div>
  );
}
