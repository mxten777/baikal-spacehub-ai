import { useState, useRef, useEffect } from "react";
import { Images, Upload, X, CheckCircle2, Loader2, ImageOff, Star, Heart, Pencil } from "lucide-react";
import { format } from "date-fns";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { uploadPhoto, deletePhoto, extractImageDimensions } from "../../services/photoStorage";
import {
  createPhotoRecord,
  getPhotoRecords,
  updatePhotoRecord,
  deletePhotoRecord,
  markPhotoDeletePending,
  markPhotoCompleted,
  markPhotoError,
  PHOTO_PAGE_SIZE,
} from "../../services/photoRepository";
import type {
  PhotoRecord,
  PhotoSpaceCategory,
  PhotoType,
  PhotoSortOption,
  UpdatePhotoRecordInput,
  AiAnalysisStatus,
} from "../../types";

// ─── Page-level constants ─────────────────────────────────────────────────────

const SPACE_CATEGORY_LABELS: Record<PhotoSpaceCategory, string> = {
  cafe: "카페", garden: "가든", studio: "스튜디오", exterior: "외부 전경",
  program: "프로그램", event: "행사", exhibition: "전시", performance: "공연",
  food: "음식", people: "인물", other: "기타", unclassified: "미분류",
};

const PHOTO_TYPE_LABELS: Record<PhotoType, string> = {
  hero: "메인 비주얼", representative: "대표사진", interior: "내부", exterior: "외부",
  detail: "상세", people: "인물", event: "행사", promotional: "홍보용",
  archive: "아카이브", general: "일반",
};

const SORT_OPTIONS: { value: PhotoSortOption; label: string }[] = [
  { value: "newest", label: "최신순" }, { value: "oldest", label: "오래된순" },
  { value: "name_asc", label: "파일명 ↑" }, { value: "name_desc", label: "파일명 ↓" },
];

// Sprint 5-A: AI analysis status display config
const AI_STATUS_CONFIG: Record<AiAnalysisStatus, {
  badge: string; badgeClass: string; buttonLabel: string; buttonClass: string;
}> = {
  not_requested: { badge: "미분석",   badgeClass: "text-brand-muted border-brand-border",           buttonLabel: "AI 분석",       buttonClass: "text-brand-muted hover:text-brand-black" },
  processing:    { badge: "분석 중",  badgeClass: "text-blue-700 bg-blue-50 border-blue-200",        buttonLabel: "분석 중...",    buttonClass: "text-blue-600 cursor-not-allowed" },
  completed:     { badge: "분석 완료",badgeClass: "text-green-700 bg-green-50 border-green-200",     buttonLabel: "결과 보기",     buttonClass: "text-green-700 hover:text-green-900" },
  error:         { badge: "분석 실패",badgeClass: "text-rose-700 bg-rose-50 border-rose-200",        buttonLabel: "다시 시도",     buttonClass: "text-rose-600 hover:text-rose-800" },
};

// ─── Upload-session types ─────────────────────────────────────────────────────

type UploadStatus = "pending" | "uploading" | "success" | "error";

interface SelectedFile {
  id: string; file: File; previewUrl: string; originalName: string;
  status: UploadStatus; progress: number;
  storagePath?: string; publicUrl?: string; dbRecordId?: string; errorMessage?: string;
}
interface ToastMessage { id: string; message: string; type: "error" | "info"; }
interface UploadCounts { total: number; pending: number; uploading: number; success: number; error: number; }

// ─── Constants & helpers ──────────────────────────────────────────────────────

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 20 * 1024 * 1024;
const CONCURRENCY = 3;

const UPLOAD_STATUS_CONFIG: Record<UploadStatus, { label: string; cls: string }> = {
  pending:   { label: "업로드 대기", cls: "text-amber-700 bg-amber-50 border-amber-200" },
  uploading: { label: "업로드 중",   cls: "text-blue-700 bg-blue-50 border-blue-200" },
  success:   { label: "업로드 완료", cls: "text-green-700 bg-green-50 border-green-200" },
  error:     { label: "업로드 실패", cls: "text-rose-700 bg-rose-50 border-rose-200" },
};

function fileKey(f: File) { return `${f.name}_${f.size}_${f.lastModified}`; }
function formatSize(b: number) { return b < 1024*1024 ? `${(b/1024).toFixed(0)} KB` : `${(b/(1024*1024)).toFixed(1)} MB`; }

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: "error"|"info"; onClose: ()=>void }) {
  useEffect(() => { const t = setTimeout(onClose, 5000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div role="alert" className={`flex items-start gap-3 px-4 py-3 border text-sm font-sans shadow-lg max-w-sm w-full ${type==="error" ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-brand-cream border-brand-border text-brand-black"}`}>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="shrink-0 mt-0.5 text-current/60 hover:text-current" aria-label="알림 닫기"><X size={14} /></button>
    </div>
  );
}

// ─── TagInput ─────────────────────────────────────────────────────────────────

function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState("");
  const MAX_TAGS = 20, MAX_LEN = 20;

  function addTag(raw: string) {
    const v = raw.trim();
    if (!v || v.length > MAX_LEN || tags.length >= MAX_TAGS) return;
    if (tags.some(t => t.toLowerCase() === v.toLowerCase())) return;
    onChange([...tags, v]);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); addTag(input); setInput(""); }
    else if (e.key === "Backspace" && !input && tags.length > 0) onChange(tags.slice(0, -1));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    if (v.endsWith(",")) { addTag(v.slice(0, -1)); setInput(""); }
    else setInput(v);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1 min-h-[2rem] mb-1.5">
        {tags.map(tag => (
          <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-brand-cream border border-brand-border text-2xs font-sans">
            {tag}
            <button onClick={() => onChange(tags.filter(t => t !== tag))} aria-label={`태그 "${tag}" 삭제`} className="text-brand-muted hover:text-brand-black"><X size={9} /></button>
          </span>
        ))}
      </div>
      {tags.length < MAX_TAGS && (
        <input value={input} onChange={handleChange} onKeyDown={handleKeyDown}
          placeholder="입력 후 Enter 또는 쉼표"
          className="w-full border border-brand-border px-3 py-1.5 text-sm font-sans focus:outline-none focus:border-brand-black" />
      )}
      <p className="text-2xs font-sans text-brand-muted mt-1">{tags.length}/{MAX_TAGS}개</p>
    </div>
  );
}

// ─── PhotoEditPanel ───────────────────────────────────────────────────────────

function PhotoEditPanel({ record, onClose, onSave, onDelete }: {
  record: PhotoRecord; onClose: ()=>void;
  onSave: (patch: UpdatePhotoRecordInput) => Promise<void>;
  onDelete: (r: PhotoRecord) => void;
}) {
  const [form, setForm] = useState({
    space_category: record.space_category,
    photo_type: record.photo_type,
    tags: [...record.tags],
    is_featured: record.is_featured,
    is_favorite: record.is_favorite,
    admin_memo: record.admin_memo ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSave() {
    if (saving) return;
    setSaving(true); setSaveError(null);
    try {
      await onSave({ space_category: form.space_category, photo_type: form.photo_type, tags: form.tags, is_featured: form.is_featured, is_favorite: form.is_favorite, admin_memo: form.admin_memo || null });
    } catch { setSaveError("사진 정보를 저장하지 못했습니다."); }
    finally { setSaving(false); }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brand-border shrink-0">
          <h2 className="font-sans text-sm font-semibold text-brand-black">사진 정보 편집</h2>
          <button onClick={onClose} aria-label="닫기" className="text-brand-muted hover:text-brand-black"><X size={18} /></button>
        </div>
        {/* Image preview */}
        <div className="p-4 border-b border-brand-border shrink-0">
          <div className="aspect-[4/3] bg-brand-cream overflow-hidden mb-3">
            {record.public_url
              ? <img src={record.public_url} alt={record.original_name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><ImageOff size={24} className="text-brand-muted/50" /></div>}
          </div>
          <p className="text-xs font-sans font-medium text-brand-black truncate" title={record.original_name}>{record.original_name}</p>
          <div className="flex gap-3 mt-1 text-2xs font-sans text-brand-muted flex-wrap">
            <span>{formatSize(record.file_size)}</span>
            {record.width && record.height && <span>{record.width}×{record.height}</span>}
            <span>{format(new Date(record.created_at), "yyyy. M. d.")}</span>
          </div>
        </div>
        {/* Form body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-xs font-sans font-medium text-brand-black mb-1.5">공간 분류</label>
            <select value={form.space_category} onChange={e => setForm(f => ({ ...f, space_category: e.target.value as PhotoSpaceCategory }))} className="w-full border border-brand-border px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black bg-white">
              {(Object.entries(SPACE_CATEGORY_LABELS) as [PhotoSpaceCategory, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-sans font-medium text-brand-black mb-1.5">사진 유형</label>
            <select value={form.photo_type} onChange={e => setForm(f => ({ ...f, photo_type: e.target.value as PhotoType }))} className="w-full border border-brand-border px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black bg-white">
              {(Object.entries(PHOTO_TYPE_LABELS) as [PhotoType, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-sans font-medium text-brand-black mb-1.5">태그</label>
            <TagInput tags={form.tags} onChange={tags => setForm(f => ({ ...f, tags }))} />
          </div>
          <div className="flex gap-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="w-4 h-4" />
              <span className="text-sm font-sans text-brand-black">대표사진</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_favorite} onChange={e => setForm(f => ({ ...f, is_favorite: e.target.checked }))} className="w-4 h-4" />
              <span className="text-sm font-sans text-brand-black">즐겨찾기</span>
            </label>
          </div>
          <div>
            <label className="block text-xs font-sans font-medium text-brand-black mb-1.5">관리자 메모</label>
            <textarea value={form.admin_memo} onChange={e => setForm(f => ({ ...f, admin_memo: e.target.value }))} rows={3} placeholder="내부 메모를 입력하세요" className="w-full border border-brand-border px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black resize-none" />
          </div>

          {/* AI Analysis Results (Sprint 5-A scaffold) */}
          <div className="border-t border-brand-border pt-4">
            <p className="text-xs font-sans font-semibold text-brand-black mb-3">AI 분석 결과</p>
            {record.ai_analysis_status === "not_requested" && (
              <p className="text-xs font-sans text-brand-muted">아직 AI 분석 결과가 없습니다.</p>
            )}
            {record.ai_analysis_status === "processing" && (
              <div className="flex items-center gap-2"><Loader2 size={14} className="animate-spin text-blue-600" /><p className="text-xs font-sans text-blue-600">분석 중입니다...</p></div>
            )}
            {record.ai_analysis_status === "error" && (
              <p className="text-xs font-sans text-rose-600">{record.ai_error_message ?? "분석 중 오류가 발생했습니다."}</p>
            )}
            {record.ai_analysis_status === "completed" && (
              <div className="space-y-2 text-xs font-sans">
                {record.ai_quality_score !== null && (
                  <div className="flex justify-between"><span className="text-brand-muted">품질 점수</span><span className="font-medium">{record.ai_quality_score}/100</span></div>
                )}
                {record.ai_featured_score !== null && (
                  <div className="flex justify-between"><span className="text-brand-muted">대표사진 적합도</span><span className="font-medium">{record.ai_featured_score}/100</span></div>
                )}
                {record.ai_space_category && (
                  <div className="flex justify-between"><span className="text-brand-muted">AI 추천 공간</span><span>{SPACE_CATEGORY_LABELS[record.ai_space_category]}</span></div>
                )}
                {record.ai_photo_type && (
                  <div className="flex justify-between"><span className="text-brand-muted">AI 추천 유형</span><span>{PHOTO_TYPE_LABELS[record.ai_photo_type]}</span></div>
                )}
                {record.ai_tags.length > 0 && (
                  <div>
                    <span className="text-brand-muted block mb-1">AI 추천 태그</span>
                    <div className="flex flex-wrap gap-1">{record.ai_tags.map(t => <span key={t} className="bg-brand-cream border border-brand-border px-1 py-0.5 text-2xs">{t}</span>)}</div>
                  </div>
                )}
                {record.ai_description && (
                  <div><span className="text-brand-muted block mb-1">AI 설명</span><p className="text-brand-black">{record.ai_description}</p></div>
                )}
                {record.ai_analyzed_at && (
                  <div className="flex justify-between"><span className="text-brand-muted">분석 시각</span><span>{format(new Date(record.ai_analyzed_at), "yyyy. M. d. HH:mm")}</span></div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Footer */}
        <div className="p-4 border-t border-brand-border space-y-2 shrink-0">
          {saveError && <p className="text-xs font-sans text-rose-600">{saveError}</p>}
          <button onClick={handleSave} disabled={saving} className="w-full py-2.5 bg-brand-black text-white text-sm font-sans tracking-wide hover:bg-brand-charcoal transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <><Loader2 size={14} className="animate-spin" />저장 중...</> : "변경사항 저장"}
          </button>
          <button onClick={onClose} className="w-full py-2.5 border border-brand-border text-sm font-sans text-brand-black hover:border-brand-black transition-colors">취소</button>
          <button onClick={() => onDelete(record)} className="w-full py-2.5 text-sm font-sans text-rose-600 hover:text-rose-700 transition-colors">사진 삭제</button>
        </div>
      </div>
    </>
  );
}

// ─── PhotoPreviewCard (upload session) ───────────────────────────────────────

function PhotoPreviewCard({ selected, isDeleting, isUploadingBatch, onRemove, onRetry }: {
  selected: SelectedFile; isDeleting: boolean; isUploadingBatch: boolean;
  onRemove: ()=>void; onRetry: ()=>void;
}) {
  const cfg = UPLOAD_STATUS_CONFIG[selected.status];
  const canDelete = selected.status !== "uploading" && !isDeleting;
  return (
    <div className={`group relative bg-white overflow-hidden border ${selected.status==="error" ? "border-rose-200" : "border-brand-border"}`}>
      <div className="aspect-[4/3] overflow-hidden bg-brand-cream">
        <img src={selected.previewUrl} alt={selected.originalName} className={`w-full h-full object-cover transition-opacity ${selected.status==="uploading" ? "opacity-60" : ""}`} loading="lazy" />
      </div>
      {selected.status==="uploading" && <div className="h-0.5 bg-blue-100"><div className="h-full w-full bg-blue-400 animate-pulse" /></div>}
      {selected.status==="success" && <div className="h-0.5 bg-green-500" />}
      <div className="p-2.5">
        <p className="text-xs font-sans text-brand-black truncate" title={selected.originalName}>{selected.originalName}</p>
        <div className="flex items-center justify-between mt-1.5 gap-1 min-w-0">
          <span className="text-2xs font-sans text-brand-muted shrink-0">{formatSize(selected.file.size)}</span>
          <span className={`text-2xs font-sans border px-1.5 py-0.5 whitespace-nowrap shrink-0 ${cfg.cls}`}>{cfg.label}</span>
        </div>
        {selected.status==="error" && selected.errorMessage && <p className="text-2xs font-sans text-rose-600 mt-1 break-words line-clamp-2">{selected.errorMessage}</p>}
        {selected.status==="error" && !isUploadingBatch && <button onClick={onRetry} className="mt-2 w-full py-1 text-xs font-sans text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors">재시도</button>}
      </div>
      {canDelete && (
        <button onClick={onRemove} disabled={isDeleting} className="absolute top-2 right-2 w-7 h-7 bg-brand-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity disabled:opacity-40" aria-label={`${selected.originalName} 삭제`}>
          {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
        </button>
      )}
    </div>
  );
}

// ─── PhotoDropzone ────────────────────────────────────────────────────────────

function PhotoDropzone({ isDragging, hasFiles, onDragOver, onDragLeave, onDrop, onFileSelect }: {
  isDragging: boolean; hasFiles: boolean;
  onDragOver: (e: React.DragEvent)=>void; onDragLeave: (e: React.DragEvent)=>void;
  onDrop: (e: React.DragEvent)=>void; onFileSelect: (f: FileList)=>void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div onDragOver={onDragOver} onDragEnter={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed transition-colors p-10 md:p-14 flex flex-col items-center justify-center gap-4 text-center cursor-pointer select-none ${isDragging ? "border-brand-accent bg-brand-accent/5" : "border-brand-border bg-brand-cream/50 hover:border-brand-accent/50"}`}>
      <div className={`w-14 h-14 flex items-center justify-center transition-colors ${isDragging ? "bg-brand-accent/20" : "bg-brand-border"}`}>
        <Upload size={22} className={isDragging ? "text-brand-accent" : "text-brand-muted"} />
      </div>
      <div>
        <p className="font-sans text-sm font-medium text-brand-black">사진을 이곳에 끌어다 놓아주세요</p>
        <p className="font-sans text-sm text-brand-muted mt-1">또는 파일을 선택해 주세요</p>
        <p className="font-sans text-xs text-brand-muted/70 mt-2">JPG, JPEG, PNG, WEBP · 파일당 최대 20MB</p>
      </div>
      <button type="button" onClick={e => { e.stopPropagation(); inputRef.current?.click(); }} className="px-5 py-2.5 bg-brand-black text-white text-sm font-sans tracking-wide hover:bg-brand-charcoal transition-colors">
        {hasFiles ? "사진 추가" : "사진 선택"}
      </button>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={e => { if (e.target.files?.length) { onFileSelect(e.target.files); e.target.value = ""; } }} />
    </div>
  );
}

// ─── PhotoUploadSummary ───────────────────────────────────────────────────────

function PhotoUploadSummary({ counts, isUploadingBatch, onClearAll, onUpload, onReset }: {
  counts: UploadCounts; isUploadingBatch: boolean;
  onClearAll: ()=>void; onUpload: ()=>void; onReset: ()=>void;
}) {
  const allDone = counts.total > 0 && counts.pending===0 && counts.uploading===0 && counts.error===0;
  const hasUploadable = counts.pending > 0 || counts.error > 0;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-brand-border">
      <div className="flex items-center gap-2 flex-wrap">
        <CheckCircle2 size={16} className="text-brand-accent shrink-0" />
        <span className="font-sans text-sm font-medium text-brand-black">전체 {counts.total}장</span>
        {counts.pending>0 && <span className="text-xs font-sans text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5">대기 {counts.pending}</span>}
        {counts.uploading>0 && <span className="text-xs font-sans text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 flex items-center gap-1"><Loader2 size={10} className="animate-spin" />업로드 중 {counts.uploading}</span>}
        {counts.success>0 && <span className="text-xs font-sans text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5">완료 {counts.success}</span>}
        {counts.error>0 && <span className="text-xs font-sans text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5">실패 {counts.error}</span>}
        {!isUploadingBatch && <button onClick={onClearAll} className="text-xs font-sans text-brand-muted hover:text-rose-600 transition-colors underline underline-offset-2">전체 선택 해제</button>}
      </div>
      <div className="self-start sm:self-auto shrink-0">
        {allDone ? (
          <button onClick={onReset} className="px-5 py-2.5 bg-brand-black text-white text-sm font-sans tracking-wide hover:bg-brand-charcoal transition-colors whitespace-nowrap">새 사진 추가</button>
        ) : hasUploadable ? (
          <button onClick={onUpload} disabled={isUploadingBatch} className="px-5 py-2.5 bg-brand-black text-white text-sm font-sans tracking-wide hover:bg-brand-charcoal transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {isUploadingBatch ? <><Loader2 size={14} className="animate-spin" />업로드 중...</> : "사진 업로드"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

// ─── PhotoRecordCard (history) ────────────────────────────────────────────────

function PhotoRecordCard({ record, isDeleting, isToggling, onEdit, onDelete, onRetryDelete, onToggleFeatured, onToggleFavorite, onAnalyze }: {
  record: PhotoRecord; isDeleting: boolean; isToggling: boolean;
  onEdit: ()=>void; onDelete: ()=>void; onRetryDelete: ()=>void;
  onToggleFeatured: ()=>void; onToggleFavorite: ()=>void;
  onAnalyze: ()=>void;
}) {
  const [imgErr, setImgErr] = useState(false);
  const hasIssue = record.upload_status !== "completed";
  const visibleTags = record.tags.slice(0, 3);
  const extraTags = record.tags.length - visibleTags.length;

  return (
    <div onClick={() => !isDeleting && !hasIssue && onEdit()}
      className={`relative bg-white overflow-hidden border ${hasIssue ? "border-rose-200" : "border-brand-border hover:shadow-sm"} ${!isDeleting && !hasIssue ? "cursor-pointer" : ""} transition-shadow`}>
      {/* Thumbnail */}
      <div className="aspect-[4/3] overflow-hidden bg-brand-cream relative">
        {imgErr || !record.public_url
          ? <div className="w-full h-full flex flex-col items-center justify-center gap-1"><ImageOff size={18} className="text-brand-muted/50" /><p className="text-2xs font-sans text-brand-muted text-center px-1">이미지를 불러올 수 없습니다.</p></div>
          : <img src={record.public_url} alt={record.original_name} onError={() => setImgErr(true)} className="w-full h-full object-cover" loading="lazy" />}
        {record.is_featured && (
          <span className="absolute top-1.5 left-1.5 bg-brand-accent/90 text-white text-2xs font-sans px-1.5 py-0.5">대표</span>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-xs font-sans text-brand-black truncate" title={record.original_name}>{record.original_name}</p>

        {/* Badges */}
        <div className="flex flex-wrap gap-1 mt-1.5">
          <span className={`text-2xs font-sans border px-1 py-0.5 ${record.space_category === "unclassified" ? "text-brand-muted border-brand-border" : "text-blue-700 bg-blue-50 border-blue-100"}`}>
            {SPACE_CATEGORY_LABELS[record.space_category]}
          </span>
          {record.upload_status === "completed" && (
            <span className="text-2xs font-sans text-green-700 bg-green-50 border border-green-200 px-1 py-0.5">완료</span>
          )}
          {record.upload_status === "delete_pending" && (
            <span className="text-2xs font-sans text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.5">삭제 중</span>
          )}
          {record.upload_status === "error" && (
            <span className="text-2xs font-sans text-rose-700 bg-rose-50 border border-rose-200 px-1 py-0.5">오류</span>
          )}
        </div>

        {/* Tags */}
        {record.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {visibleTags.map(tag => (
              <span key={tag} className="text-2xs font-sans bg-brand-cream border border-brand-border px-1 py-0.5 truncate max-w-[80px]">{tag}</span>
            ))}
            {extraTags > 0 && <span className="text-2xs font-sans text-brand-muted">+{extraTags}</span>}
          </div>
        )}

        {/* Date */}
        <p className="text-2xs font-sans text-brand-muted/70 mt-1.5">{format(new Date(record.created_at), "yyyy. M. d.")}</p>

        {/* AI status + action */}
        {!hasIssue && (
          <div className="flex items-center justify-between mt-1.5" onClick={e => e.stopPropagation()}>
            <span className={`text-2xs font-sans border px-1 py-0.5 ${AI_STATUS_CONFIG[record.ai_analysis_status].badgeClass}`}>
              {AI_STATUS_CONFIG[record.ai_analysis_status].badge}
            </span>
            <button
              onClick={record.ai_analysis_status === "completed" ? onEdit : onAnalyze}
              disabled={record.ai_analysis_status === "processing" || isDeleting}
              className={`text-2xs font-sans transition-colors disabled:opacity-40 ${AI_STATUS_CONFIG[record.ai_analysis_status].buttonClass}`}
            >
              {AI_STATUS_CONFIG[record.ai_analysis_status].buttonLabel}
            </button>
          </div>
        )}

        {/* Retry delete */}
        {hasIssue && !isDeleting && (
          <button onClick={e => { e.stopPropagation(); onRetryDelete(); }} className="mt-1.5 w-full py-1 text-xs font-sans text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors">삭제 재시도</button>
        )}
      </div>

      {/* Action bar */}
      {!hasIssue && (
        <div className="flex items-center border-t border-brand-border" onClick={e => e.stopPropagation()}>
          <button onClick={onToggleFeatured} disabled={isToggling || isDeleting} title={record.is_featured ? "대표 해제" : "대표 지정"}
            className={`flex-1 flex items-center justify-center py-1.5 transition-colors disabled:opacity-40 ${record.is_featured ? "text-brand-accent" : "text-brand-muted hover:text-brand-accent"}`}>
            <Star size={13} fill={record.is_featured ? "currentColor" : "none"} />
          </button>
          <button onClick={onToggleFavorite} disabled={isToggling || isDeleting} title={record.is_favorite ? "즐겨찾기 해제" : "즐겨찾기"}
            className={`flex-1 flex items-center justify-center py-1.5 transition-colors disabled:opacity-40 ${record.is_favorite ? "text-rose-500" : "text-brand-muted hover:text-rose-400"}`}>
            <Heart size={13} fill={record.is_favorite ? "currentColor" : "none"} />
          </button>
          <button onClick={onEdit} disabled={isDeleting} title="편집"
            className="flex-1 flex items-center justify-center py-1.5 text-brand-muted hover:text-brand-black transition-colors disabled:opacity-40">
            <Pencil size={13} />
          </button>
          <button onClick={onDelete} disabled={isDeleting} title="삭제"
            className="flex-1 flex items-center justify-center py-1.5 text-brand-muted hover:text-rose-600 transition-colors disabled:opacity-40">
            {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── HistorySkeleton ──────────────────────────────────────────────────────────

function HistorySkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="bg-white border border-brand-border overflow-hidden">
          <div className="aspect-[4/3] bg-brand-cream animate-pulse" />
          <div className="p-2.5 space-y-1.5"><div className="h-3 bg-brand-border animate-pulse" /><div className="h-2 bg-brand-border animate-pulse w-2/3" /></div>
        </div>
      ))}
    </div>
  );
}

// ─── HistoryFilters ───────────────────────────────────────────────────────────

function HistoryFilters({ searchInput, onSearch, spaceFilter, onSpaceFilter, typeFilter, onTypeFilter, featuredFilter, onFeaturedFilter, favoriteFilter, onFavoriteFilter, sortOption, onSort, hasActiveFilters, onReset }: {
  searchInput: string; onSearch: (v: string)=>void;
  spaceFilter: PhotoSpaceCategory|"all"; onSpaceFilter: (v: PhotoSpaceCategory|"all")=>void;
  typeFilter: PhotoType|"all"; onTypeFilter: (v: PhotoType|"all")=>void;
  featuredFilter: "all"|"featured"|"not_featured"; onFeaturedFilter: (v: "all"|"featured"|"not_featured")=>void;
  favoriteFilter: boolean; onFavoriteFilter: (v: boolean)=>void;
  sortOption: PhotoSortOption; onSort: (v: PhotoSortOption)=>void;
  hasActiveFilters: boolean; onReset: ()=>void;
}) {
  const sel = "border border-brand-border px-2 py-1.5 text-xs font-sans focus:outline-none focus:border-brand-black bg-white";
  return (
    <div className="space-y-2 mb-6">
      <div className="flex gap-2">
        <input value={searchInput} onChange={e => onSearch(e.target.value)} placeholder="파일명, 태그, 메모로 검색"
          className="flex-1 min-w-0 border border-brand-border px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black" />
        {searchInput && <button onClick={() => onSearch("")} className="px-3 border border-brand-border text-brand-muted hover:text-brand-black shrink-0" aria-label="검색어 지우기"><X size={14} /></button>}
      </div>
      <div className="flex flex-wrap gap-2">
        <select value={spaceFilter} onChange={e => onSpaceFilter(e.target.value as PhotoSpaceCategory|"all")} className={sel}>
          <option value="all">전체 공간</option>
          {(Object.entries(SPACE_CATEGORY_LABELS) as [PhotoSpaceCategory,string][]).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={typeFilter} onChange={e => onTypeFilter(e.target.value as PhotoType|"all")} className={sel}>
          <option value="all">전체 유형</option>
          {(Object.entries(PHOTO_TYPE_LABELS) as [PhotoType,string][]).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={featuredFilter} onChange={e => onFeaturedFilter(e.target.value as "all"|"featured"|"not_featured")} className={sel}>
          <option value="all">대표사진 전체</option>
          <option value="featured">대표사진만</option>
          <option value="not_featured">대표사진 제외</option>
        </select>
        <select value={favoriteFilter ? "fav" : "all"} onChange={e => onFavoriteFilter(e.target.value === "fav")} className={sel}>
          <option value="all">즐겨찾기 전체</option>
          <option value="fav">즐겨찾기만</option>
        </select>
        <select value={sortOption} onChange={e => onSort(e.target.value as PhotoSortOption)} className={sel}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {hasActiveFilters && (
          <button onClick={onReset} className="px-3 py-1.5 text-xs font-sans text-rose-600 border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-colors">필터 초기화</button>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPhotoCuratorPage() {
  // Upload session
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);
  const [deletingIds, setDeletingIds] = useState<ReadonlySet<string>>(new Set<string>());

  // History
  const [activeTab, setActiveTab] = useState<"upload"|"history">("upload");
  const [photoRecords, setPhotoRecords] = useState<PhotoRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string|null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [historyOffset, setHistoryOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deletingRecordIds, setDeletingRecordIds] = useState<ReadonlySet<string>>(new Set<string>());
  const [togglingIds, setTogglingIds] = useState<ReadonlySet<string>>(new Set<string>());

  // Edit panel
  const [editingRecord, setEditingRecord] = useState<PhotoRecord|null>(null);

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [spaceFilter, setSpaceFilter] = useState<PhotoSpaceCategory|"all">("all");
  const [typeFilter, setTypeFilter] = useState<PhotoType|"all">("all");
  const [featuredFilter, setFeaturedFilter] = useState<"all"|"featured"|"not_featured">("all");
  const [favoriteFilter, setFavoriteFilter] = useState(false);
  const [sortOption, setSortOption] = useState<PhotoSortOption>("newest");
  const [reloadToken, setReloadToken] = useState(0);

  // Shared toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Refs
  const toastCountRef = useRef(0);
  const filesRef = useRef<SelectedFile[]>([]);
  const fetchCountRef = useRef(0);

  useEffect(() => { filesRef.current = files; });

  useEffect(() => {
    return () => { filesRef.current.forEach(f => URL.revokeObjectURL(f.previewUrl)); };
  }, []);

  const anyUploading = files.some(f => f.status === "uploading");
  useEffect(() => {
    if (!anyUploading) return;
    function guard(e: BeforeUnloadEvent) { e.preventDefault(); e.returnValue = "사진 업로드가 진행 중입니다."; }
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [anyUploading]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reload history when tab, filters, or reloadToken changes
  useEffect(() => {
    if (activeTab !== "history") return;
    const fid = ++fetchCountRef.current;
    setHistoryLoading(true); setHistoryError(null);
    getPhotoRecords({ offset: 0, search: debouncedSearch, spaceCategory: spaceFilter, photoType: typeFilter, featured: featuredFilter, favoriteOnly: favoriteFilter, sort: sortOption })
      .then(({ records, hasMore: more }) => {
        if (fid !== fetchCountRef.current) return;
        setPhotoRecords(records); setHasMore(more); setHistoryOffset(0);
      })
      .catch(() => { if (fid !== fetchCountRef.current) return; setHistoryError("사진 목록을 불러오지 못했습니다."); })
      .finally(() => { if (fid === fetchCountRef.current) setHistoryLoading(false); });
  }, [activeTab, debouncedSearch, spaceFilter, typeFilter, featuredFilter, favoriteFilter, sortOption, reloadToken]);

  // ── Toast helpers ──────────────────────────────────────────────────────────

  function addToast(msg: string, type: "error"|"info" = "error") {
    const id = String(++toastCountRef.current);
    setToasts(p => [...p, { id, message: msg, type }]);
  }
  function dismissToast(id: string) { setToasts(p => p.filter(t => t.id !== id)); }

  // ── Upload helpers ─────────────────────────────────────────────────────────

  function patchFile(id: string, patch: Partial<SelectedFile>) {
    setFiles(p => p.map(f => f.id === id ? { ...f, ...patch } : f));
  }

  function processFiles(incoming: FileList) {
    const keys = new Set(filesRef.current.map(f => fileKey(f.file)));
    const add: SelectedFile[] = [];
    Array.from(incoming).forEach(file => {
      if (!ALLOWED_TYPES.includes(file.type)) { addToast(`지원하지 않는 파일 형식입니다. (${file.name})`); return; }
      if (file.size > MAX_SIZE_BYTES) { addToast(`20MB 이하의 이미지만 선택할 수 있습니다. (${file.name})`); return; }
      const k = fileKey(file); if (keys.has(k)) return; keys.add(k);
      add.push({ id: k, file, previewUrl: URL.createObjectURL(file), originalName: file.name, status: "pending", progress: 0 });
    });
    if (add.length) setFiles(p => [...p, ...add]);
  }

  async function handleUpload() {
    if (isUploadingBatch) return;
    if (!isSupabaseConfigured) { addToast("Supabase 환경설정이 완료되지 않았습니다."); return; }
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { addToast("로그인 정보를 확인할 수 없습니다. 다시 로그인해 주세요."); return; }
    const uid = auth.user.id;
    const toUpload = filesRef.current.filter(f => f.status === "pending" || f.status === "error");
    if (!toUpload.length) return;
    setIsUploadingBatch(true);
    let ok = 0, fail = 0;
    const q = [...toUpload];
    async function processOne(item: SelectedFile) {
      patchFile(item.id, { status: "uploading", progress: 0, errorMessage: undefined });
      try {
        const sr = await uploadPhoto(item.file, uid);
        const dims = await extractImageDimensions(item.file);
        try {
          const rec = await createPhotoRecord({ original_name: item.originalName, storage_path: sr.storagePath, public_url: sr.publicUrl, mime_type: item.file.type, file_size: item.file.size, width: dims?.width??null, height: dims?.height??null, uploaded_by: uid });
          patchFile(item.id, { status: "success", progress: 100, storagePath: sr.storagePath, publicUrl: sr.publicUrl, dbRecordId: rec.id });
          setPhotoRecords(p => [rec, ...p]);
          ok++;
        } catch (de) {
          console.error("[photo-curator] DB save failed:", de);
          try { await deletePhoto(sr.storagePath); } catch (ce) { console.error("[photo-curator] compensation failed:", { path: sr.storagePath, de, ce }); }
          patchFile(item.id, { status: "error", progress: 0, errorMessage: "사진 정보 저장에 실패했습니다. 다시 시도해 주세요." }); fail++;
        }
      } catch (se) {
        patchFile(item.id, { status: "error", progress: 0, errorMessage: se instanceof Error ? se.message : "업로드 중 오류가 발생했습니다." }); fail++;
      }
    }
    async function worker() { while (q.length > 0) { const i = q.shift(); if (i) await processOne(i); } }
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, toUpload.length) }, () => worker()));
    setIsUploadingBatch(false);
    if (ok > 0 && fail === 0) addToast(`사진 ${ok}장이 업로드되었습니다.`, "info");
    else if (ok > 0 && fail > 0) addToast(`${ok}장은 업로드되었고 ${fail}장은 실패했습니다.`);
    else addToast("사진 업로드에 실패했습니다.");
  }

  async function handleRetry(id: string) {
    const t = filesRef.current.find(f => f.id === id);
    if (!t || t.status !== "error") return;
    if (!isSupabaseConfigured) { addToast("Supabase 환경설정이 완료되지 않았습니다."); return; }
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { addToast("로그인 정보를 확인할 수 없습니다. 다시 로그인해 주세요."); return; }
    const uid = auth.user.id;
    patchFile(id, { status: "uploading", progress: 0, errorMessage: undefined });
    try {
      const sr = await uploadPhoto(t.file, uid);
      const dims = await extractImageDimensions(t.file);
      try {
        const rec = await createPhotoRecord({ original_name: t.originalName, storage_path: sr.storagePath, public_url: sr.publicUrl, mime_type: t.file.type, file_size: t.file.size, width: dims?.width??null, height: dims?.height??null, uploaded_by: uid });
        patchFile(id, { status: "success", progress: 100, storagePath: sr.storagePath, publicUrl: sr.publicUrl, dbRecordId: rec.id });
        setPhotoRecords(p => [rec, ...p]);
        addToast("사진이 업로드되었습니다.", "info");
      } catch (de) {
        console.error("[photo-curator] retry DB failed:", de);
        try { await deletePhoto(sr.storagePath); } catch (ce) { console.error("[photo-curator] retry compensation failed:", { path: sr.storagePath, de, ce }); }
        const msg = "사진 정보 저장에 실패했습니다. 다시 시도해 주세요.";
        patchFile(id, { status: "error", progress: 0, errorMessage: msg }); addToast(msg);
      }
    } catch (se) {
      const msg = se instanceof Error ? se.message : "업로드 중 오류가 발생했습니다.";
      patchFile(id, { status: "error", progress: 0, errorMessage: msg }); addToast(msg);
    }
  }

  function handleDragOver(e: React.DragEvent) { e.preventDefault(); setIsDragging(true); }
  function handleDragLeave(e: React.DragEvent) { e.preventDefault(); setIsDragging(false); }
  function handleDrop(e: React.DragEvent) { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files); }

  async function handleRemoveUploadedFile(id: string) {
    const t = filesRef.current.find(f => f.id === id);
    if (!t || t.status === "uploading") return;
    if (t.status === "success" && t.storagePath) {
      if (!window.confirm("업로드된 사진을 저장소에서도 삭제하시겠습니까?")) return;
      setDeletingIds(p => { const s = new Set(p); s.add(id); return s; });
      try { await deletePhoto(t.storagePath); } catch (e) {
        addToast(e instanceof Error ? e.message : "삭제 중 오류가 발생했습니다.");
        setDeletingIds(p => { const s = new Set(p); s.delete(id); return s; }); return;
      }
      if (t.dbRecordId) {
        try { await deletePhotoRecord(t.dbRecordId); setPhotoRecords(p => p.filter(r => r.id !== t.dbRecordId)); }
        catch { try { await markPhotoError(t.dbRecordId!); } catch { /* best effort */ } setPhotoRecords(p => p.map(r => r.id === t.dbRecordId ? { ...r, upload_status: "error" as const } : r)); addToast("사진 기록 정리에 실패했습니다."); }
      }
      setDeletingIds(p => { const s = new Set(p); s.delete(id); return s; });
    }
    URL.revokeObjectURL(t.previewUrl);
    setFiles(p => p.filter(f => f.id !== id));
  }

  function handleClearAll() {
    if (isUploadingBatch) { addToast("업로드 중에는 전체 삭제를 할 수 없습니다."); return; }
    setFiles(p => { p.forEach(f => URL.revokeObjectURL(f.previewUrl)); return []; });
  }
  function handleReset() { setFiles(p => { p.forEach(f => URL.revokeObjectURL(f.previewUrl)); return []; }); }

  // ── History operations ─────────────────────────────────────────────────────

  async function handleSaveEdit(patch: UpdatePhotoRecordInput) {
    if (!editingRecord) return;
    const updated = await updatePhotoRecord(editingRecord.id, patch);
    setPhotoRecords(p => p.map(r => r.id === updated.id ? updated : r));
    addToast("사진 정보가 저장되었습니다.", "info");
    setEditingRecord(null);
  }

  async function handleToggleFeatured(record: PhotoRecord) {
    if (togglingIds.has(record.id)) return;
    const prev = record.is_featured;
    setTogglingIds(s => { const n = new Set(s); n.add(record.id); return n; });
    setPhotoRecords(p => p.map(r => r.id === record.id ? { ...r, is_featured: !prev } : r));
    try { await updatePhotoRecord(record.id, { is_featured: !prev }); }
    catch { setPhotoRecords(p => p.map(r => r.id === record.id ? { ...r, is_featured: prev } : r)); addToast("변경사항을 저장하지 못했습니다."); }
    finally { setTogglingIds(s => { const n = new Set(s); n.delete(record.id); return n; }); }
  }

  async function handleToggleFavorite(record: PhotoRecord) {
    if (togglingIds.has(record.id)) return;
    const prev = record.is_favorite;
    setTogglingIds(s => { const n = new Set(s); n.add(record.id); return n; });
    setPhotoRecords(p => p.map(r => r.id === record.id ? { ...r, is_favorite: !prev } : r));
    try { await updatePhotoRecord(record.id, { is_favorite: !prev }); }
    catch { setPhotoRecords(p => p.map(r => r.id === record.id ? { ...r, is_favorite: prev } : r)); addToast("변경사항을 저장하지 못했습니다."); }
    finally { setTogglingIds(s => { const n = new Set(s); n.delete(record.id); return n; }); }
  }

  async function handleDeleteRecord(record: PhotoRecord) {
    if (!window.confirm("업로드된 사진을 저장소에서도 삭제하시겠습니까?")) return;
    const add = (id: string) => setDeletingRecordIds(p => { const s = new Set(p); s.add(id); return s; });
    const rem = (id: string) => setDeletingRecordIds(p => { const s = new Set(p); s.delete(id); return s; });
    add(record.id);
    try {
      await markPhotoDeletePending(record.id);
      setPhotoRecords(p => p.map(r => r.id === record.id ? { ...r, upload_status: "delete_pending" as const } : r));
    } catch { addToast("삭제 준비 중 오류가 발생했습니다."); rem(record.id); return; }
    try { await deletePhoto(record.storage_path); } catch (se) {
      try { await markPhotoCompleted(record.id); } catch { /* best effort */ }
      setPhotoRecords(p => p.map(r => r.id === record.id ? { ...r, upload_status: "completed" as const } : r));
      addToast(se instanceof Error ? se.message : "사진 삭제 중 오류가 발생했습니다."); rem(record.id); return;
    }
    try {
      await deletePhotoRecord(record.id);
      setPhotoRecords(p => p.filter(r => r.id !== record.id));
      if (editingRecord?.id === record.id) setEditingRecord(null);
    } catch {
      try { await markPhotoError(record.id); } catch { /* best effort */ }
      setPhotoRecords(p => p.map(r => r.id === record.id ? { ...r, upload_status: "error" as const } : r));
      addToast("Storage에서 삭제했지만 기록 정리에 실패했습니다. 삭제 재시도를 눌러 주세요.");
    }
    rem(record.id);
  }

  async function handleRetryDelete(record: PhotoRecord) {
    const add = (id: string) => setDeletingRecordIds(p => { const s = new Set(p); s.add(id); return s; });
    const rem = (id: string) => setDeletingRecordIds(p => { const s = new Set(p); s.delete(id); return s; });
    add(record.id);
    try { await deletePhoto(record.storage_path); } catch (e) {
      const msg = e instanceof Error ? e.message.toLowerCase() : "";
      if (!msg.includes("not found") && !msg.includes("no such") && !msg.includes("does not exist")) {
        addToast(e instanceof Error ? e.message : "삭제 중 오류가 발생했습니다."); rem(record.id); return;
      }
    }
    try {
      await deletePhotoRecord(record.id);
      setPhotoRecords(p => p.filter(r => r.id !== record.id));
      if (editingRecord?.id === record.id) setEditingRecord(null);
    } catch { addToast("기록 삭제에 실패했습니다. 다시 시도해 주세요."); }
    rem(record.id);
  }

  async function loadMoreHistory() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const newOffset = historyOffset + PHOTO_PAGE_SIZE;
    try {
      const { records, hasMore: more } = await getPhotoRecords({ offset: newOffset, search: debouncedSearch, spaceCategory: spaceFilter, photoType: typeFilter, featured: featuredFilter, favoriteOnly: favoriteFilter, sort: sortOption });
      setPhotoRecords(p => [...p, ...records]); setHasMore(more); setHistoryOffset(newOffset);
    } catch { addToast("사진 목록을 불러오지 못했습니다."); }
    finally { setLoadingMore(false); }
  }

  function resetFilters() {
    setSearchInput(""); setDebouncedSearch(""); setSpaceFilter("all"); setTypeFilter("all");
    setFeaturedFilter("all"); setFavoriteFilter(false); setSortOption("newest");
    setReloadToken(t => t + 1);
  }

  const hasActiveFilters = debouncedSearch !== "" || spaceFilter !== "all" || typeFilter !== "all" || featuredFilter !== "all" || favoriteFilter;

  const counts: UploadCounts = {
    total: files.length,
    pending: files.filter(f => f.status==="pending").length,
    uploading: files.filter(f => f.status==="uploading").length,
    success: files.filter(f => f.status==="success").length,
    error: files.filter(f => f.status==="error").length,
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-7xl">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <Images size={20} className="text-brand-accent shrink-0" />
          <h1 className="font-sans text-xl font-semibold text-brand-black">AI 사진 큐레이터</h1>
          <span className="text-xs font-sans text-green-700 bg-green-50 border border-green-200 px-2 py-0.5">Sprint 4 · 분류 & 검색</span>
        </div>
        <p className="font-sans text-sm text-brand-muted">THE LIT의 공간, 프로그램, 행사 사진을 업로드하고 관리할 수 있습니다.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-brand-border mb-6">
        <button onClick={() => setActiveTab("upload")} className={`px-5 py-3 text-sm font-sans font-medium border-b-2 transition-colors ${activeTab==="upload" ? "border-brand-black text-brand-black" : "border-transparent text-brand-muted hover:text-brand-black"}`}>사진 업로드</button>
        <button onClick={() => setActiveTab("history")} className={`px-5 py-3 text-sm font-sans font-medium border-b-2 transition-colors flex items-center gap-1.5 ${activeTab==="history" ? "border-brand-black text-brand-black" : "border-transparent text-brand-muted hover:text-brand-black"}`}>
          업로드된 사진
          {photoRecords.length > 0 && <span className="text-2xs bg-brand-black text-white px-1.5 py-0.5 font-sans">{photoRecords.length}{hasMore ? "+" : ""}</span>}
        </button>
      </div>

      {/* Upload tab */}
      {activeTab === "upload" && (
        <div>
          <PhotoDropzone isDragging={isDragging} hasFiles={files.length > 0} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onFileSelect={processFiles} />
          {files.length > 0 && (
            <div className="mt-6 space-y-4">
              <PhotoUploadSummary counts={counts} isUploadingBatch={isUploadingBatch} onClearAll={handleClearAll} onUpload={handleUpload} onReset={handleReset} />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {files.map(f => (
                  <PhotoPreviewCard key={f.id} selected={f} isDeleting={deletingIds.has(f.id)} isUploadingBatch={isUploadingBatch} onRemove={() => handleRemoveUploadedFile(f.id)} onRetry={() => handleRetry(f.id)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History tab */}
      {activeTab === "history" && (
        <div>
          <HistoryFilters
            searchInput={searchInput} onSearch={setSearchInput}
            spaceFilter={spaceFilter} onSpaceFilter={setSpaceFilter}
            typeFilter={typeFilter} onTypeFilter={setTypeFilter}
            featuredFilter={featuredFilter} onFeaturedFilter={setFeaturedFilter}
            favoriteFilter={favoriteFilter} onFavoriteFilter={setFavoriteFilter}
            sortOption={sortOption} onSort={setSortOption}
            hasActiveFilters={hasActiveFilters} onReset={resetFilters}
          />

          {historyLoading && <HistorySkeleton />}

          {!historyLoading && historyError && (
            <div className="text-center py-16">
              <p className="font-sans text-sm text-rose-600 mb-4">{historyError}</p>
              <button onClick={() => setReloadToken(t => t + 1)} className="px-5 py-2.5 bg-brand-black text-white text-sm font-sans tracking-wide hover:bg-brand-charcoal transition-colors">다시 불러오기</button>
            </div>
          )}

          {!historyLoading && !historyError && photoRecords.length === 0 && (
            <div className="text-center py-16">
              <Images size={32} className="text-brand-border mx-auto mb-4" />
              {hasActiveFilters ? (
                <>
                  <p className="font-sans text-sm font-medium text-brand-black mb-1">조건에 맞는 사진이 없습니다.</p>
                  <p className="font-sans text-sm text-brand-muted mb-4">검색어나 필터 조건을 변경해 주세요.</p>
                  <button onClick={resetFilters} className="px-5 py-2 text-sm font-sans text-rose-600 border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-colors">필터 초기화</button>
                </>
              ) : (
                <>
                  <p className="font-sans text-sm font-medium text-brand-black mb-1">아직 업로드된 사진이 없습니다.</p>
                  <p className="font-sans text-sm text-brand-muted">사진을 추가하면 이곳에서 다시 확인할 수 있습니다.</p>
                </>
              )}
            </div>
          )}

          {!historyLoading && !historyError && photoRecords.length > 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {photoRecords.map(r => (
                  <PhotoRecordCard key={r.id} record={r}
                    isDeleting={deletingRecordIds.has(r.id)}
                    isToggling={togglingIds.has(r.id)}
                    onEdit={() => setEditingRecord(r)}
                    onDelete={() => handleDeleteRecord(r)}
                    onRetryDelete={() => handleRetryDelete(r)}
                    onToggleFeatured={() => handleToggleFeatured(r)}
                    onToggleFavorite={() => handleToggleFavorite(r)}
                    onAnalyze={() => addToast("AI 분석 기능은 다음 Sprint에서 연결됩니다.", "info")}
                  />
                ))}
              </div>
              {hasMore && (
                <div className="text-center">
                  <button onClick={loadMoreHistory} disabled={loadingMore} className="px-6 py-2.5 bg-white border border-brand-border text-sm font-sans text-brand-black hover:border-brand-black transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto">
                    {loadingMore ? <><Loader2 size={14} className="animate-spin" />불러오는 중...</> : "더 불러오기"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Edit panel */}
      {editingRecord && (
        <PhotoEditPanel
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSave={handleSaveEdit}
          onDelete={handleDeleteRecord}
        />
      )}

      {/* Toast stack */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <Toast message={t.message} type={t.type} onClose={() => dismissToast(t.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}