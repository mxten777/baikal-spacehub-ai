import { useState, useEffect, useRef, useCallback } from "react";
import { X, Save, XCircle, ImageOff } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePhotoMeta } from "../../../services/photoProjects";
import type {
  PhotoRecord,
  ProjectCategory,
  ProjectStage,
} from "../../../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  main: "Main",
  wedding: "Wedding",
  space: "Space",
  food_beverage: "F&B",
  archive: "Archive",
  online_wedding: "Online Wedding",
  online_space: "Online Space",
  contact: "Contact",
  about: "About",
};

const STAGE_LABELS: Record<ProjectStage, string> = {
  source: "Source",
  selected: "Selected",
  edited: "Edited",
  web: "Web",
  pdf: "PDF",
};

// ─── Tag Input ────────────────────────────────────────────────────────────────

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = useCallback(
    (raw: string) => {
      const candidates = raw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const next = [...tags];
      for (const c of candidates) {
        if (!next.includes(c)) next.push(c);
      }
      onChange(next);
      setInput("");
    },
    [tags, onChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (input.trim()) addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  return (
    <div
      className="flex flex-wrap gap-1.5 p-2 border border-gray-200 focus-within:border-brand-black cursor-text min-h-[40px]"
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-xs font-sans text-gray-700"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(tag);
            }}
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label={`태그 "${tag}" 삭제`}
          >
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (input.trim()) addTag(input);
        }}
        placeholder={tags.length === 0 ? "태그 입력 후 Enter 또는 쉼표" : ""}
        className="flex-1 min-w-[80px] text-xs font-sans outline-none bg-transparent text-gray-700 placeholder:text-gray-300"
      />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface PhotoDetailPanelProps {
  photo: PhotoRecord;
  projectId: string;
  onClose: () => void;
  onSaved: (updated: PhotoRecord) => void;
}

export default function PhotoDetailPanel({
  photo,
  projectId,
  onClose,
  onSaved,
}: PhotoDetailPanelProps) {
  const queryClient = useQueryClient();

  // Editable fields
  const [title, setTitle] = useState(photo.title ?? "");
  const [description, setDescription] = useState(photo.description ?? "");
  const [tags, setTags] = useState<string[]>(photo.tags ?? []);
  const [note, setNote] = useState(photo.note ?? "");

  // Reset when photo changes
  useEffect(() => {
    setTitle(photo.title ?? "");
    setDescription(photo.description ?? "");
    setTags(photo.tags ?? []);
    setNote(photo.note ?? "");
  }, [photo.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Dirty check
  const isDirty =
    title.trim() !== (photo.title ?? "") ||
    description.trim() !== (photo.description ?? "") ||
    note.trim() !== (photo.note ?? "") ||
    JSON.stringify(tags) !== JSON.stringify(photo.tags ?? []);

  const mutation = useMutation({
    mutationFn: () =>
      updatePhotoMeta(photo.id, {
        title: title.trim() || null,
        description: description.trim() || null,
        tags,
        note: note.trim() || null,
      }),
    onSuccess: (updated) => {
      // 셀 목록 쿼리 갱신
      queryClient.invalidateQueries({
        queryKey: [
          "project-cell-photos",
          projectId,
          photo.project_category,
          photo.project_stage,
        ],
      });
      onSaved(updated);
    },
  });

  const handleSave = () => {
    if (!isDirty || mutation.isPending) return;
    mutation.mutate();
  };

  const handleCancel = () => {
    setTitle(photo.title ?? "");
    setDescription(photo.description ?? "");
    setTags(photo.tags ?? []);
    setNote(photo.note ?? "");
  };

  const categoryLabel = photo.project_category
    ? CATEGORY_LABELS[photo.project_category]
    : "—";
  const stageLabel = photo.project_stage
    ? STAGE_LABELS[photo.project_stage]
    : "—";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
        <p className="font-display text-base font-light text-brand-black">
          Photo Detail
        </p>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-brand-black transition-colors"
          aria-label="닫기"
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* Thumbnail */}
        <div className="bg-gray-50 border-b border-gray-100">
          {photo.public_url ? (
            <img
              src={photo.public_url}
              alt={photo.original_name}
              className="w-full max-h-[260px] object-contain"
            />
          ) : (
            <div className="w-full h-[180px] flex items-center justify-center text-gray-300">
              <ImageOff size={36} />
            </div>
          )}
        </div>

        {/* Read-only info */}
        <div className="px-5 py-4 space-y-2 border-b border-gray-100">
          <InfoRow label="파일명" value={photo.original_name} mono />
          <InfoRow label="파일 크기" value={formatBytes(photo.file_size)} />
          <InfoRow label="업로드일" value={formatDate(photo.created_at)} />
          <InfoRow label="Category" value={categoryLabel} />
          <InfoRow label="Stage" value={stageLabel} />
        </div>

        {/* Editable fields */}
        <div className="px-5 py-4 space-y-4">
          {/* Title */}
          <Field label="제목">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="사진 제목 (선택)"
              className="w-full px-2.5 py-1.5 border border-gray-200 focus:border-brand-black text-sm font-sans text-gray-800 outline-none placeholder:text-gray-300"
            />
          </Field>

          {/* Description */}
          <Field label="설명">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="사진 설명 (선택)"
              rows={3}
              className="w-full px-2.5 py-1.5 border border-gray-200 focus:border-brand-black text-sm font-sans text-gray-800 outline-none resize-none placeholder:text-gray-300"
            />
          </Field>

          {/* Tags */}
          <Field label="태그">
            <TagInput tags={tags} onChange={setTags} />
            <p className="mt-1 text-[10px] font-sans text-gray-400">
              Enter 또는 쉼표로 추가 · Backspace로 마지막 태그 삭제
            </p>
          </Field>

          {/* Note */}
          <Field label="메모">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="내부 메모 (관리자 전용)"
              rows={3}
              className="w-full px-2.5 py-1.5 border border-gray-200 focus:border-brand-black text-sm font-sans text-gray-800 outline-none resize-none placeholder:text-gray-300"
            />
          </Field>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-100 shrink-0 flex items-center justify-between gap-3">
        {mutation.isError && (
          <p className="text-xs font-sans text-red-600 flex-1 truncate">
            {(mutation.error as Error).message}
          </p>
        )}
        {mutation.isSuccess && !isDirty && (
          <p className="text-xs font-sans text-green-600 flex-1">
            저장되었습니다.
          </p>
        )}
        {!mutation.isError && !(mutation.isSuccess && !isDirty) && (
          <span className="flex-1" />
        )}

        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCancel}
            disabled={!isDirty || mutation.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-gray-200 text-gray-600 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <XCircle size={12} />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || mutation.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans bg-brand-black text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Save size={12} />
            {mutation.isPending ? "저장 중…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-20 shrink-0 text-[11px] font-sans text-gray-400 pt-px">
        {label}
      </span>
      <span
        className={`flex-1 text-[11px] font-sans text-gray-700 break-all ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-sans font-medium text-gray-500 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}
