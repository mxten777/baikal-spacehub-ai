import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Star,
  ImageOff,
  FolderKanban,
  X,
  Mail,
  Phone,
  Clock,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import {
  getAdminPhotosByCategory,
  updatePhotoRecord,
} from "../../services/photoRepository";
import type {
  PhotoRecord,
  ProjectStage,
  Inquiry,
  InquiryStatus,
} from "../../types";
import { useInquiries } from "../../hooks/useData";
import { inquiriesService } from "../../services/inquiries";
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

const STATUS_LABELS: Record<string, string> = {
  pending: "대기 중",
  reviewing: "검토 중",
  replied: "답변 완료",
  closed: "종료",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  reviewing: "bg-blue-100 text-blue-700",
  replied: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-500",
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

// ─── Wedding Inquiry Modal ────────────────────────────────────────────────────

function WeddingInquiryModal({
  inquiry,
  onClose,
  onStatusChange,
}: {
  inquiry: Inquiry;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => Promise<void>;
}) {
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await onStatusChange(inquiry.id, newStatus);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="font-display text-lg font-light">
              {inquiry.subject}
            </h2>
            <span
              className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-sans tracking-widest uppercase ${STATUS_COLORS[inquiry.status] ?? "bg-gray-100"}`}
            >
              {STATUS_LABELS[inquiry.status] ?? inquiry.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-brand-black"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="bg-gray-50 p-4 space-y-2">
            <p className="font-sans text-sm font-medium text-gray-700">
              {inquiry.name}
            </p>
            {inquiry.email && (
              <div className="flex items-center gap-2 text-sm font-sans text-gray-600">
                <Mail size={14} className="text-gray-400" />
                <a
                  href={`mailto:${inquiry.email}`}
                  className="hover:text-brand-black"
                >
                  {inquiry.email}
                </a>
              </div>
            )}
            {inquiry.phone && (
              <div className="flex items-center gap-2 text-sm font-sans text-gray-600">
                <Phone size={14} className="text-gray-400" />
                {inquiry.phone}
              </div>
            )}
            <div className="flex items-center gap-2 text-xs font-sans text-gray-400">
              <Clock size={12} />
              {new Date(inquiry.created_at).toLocaleString("ko-KR")}
            </div>
          </div>
          <div>
            <p className="text-xs font-sans text-gray-500 tracking-wider uppercase mb-2">
              메시지
            </p>
            <p className="text-sm font-sans text-gray-700 whitespace-pre-wrap leading-relaxed">
              {inquiry.message}
            </p>
          </div>
          <div>
            <p className="text-xs font-sans text-gray-500 tracking-wider uppercase mb-2">
              상태 변경
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => handleStatusChange(val)}
                  disabled={updatingStatus || inquiry.status === val}
                  className={`px-4 py-1.5 text-xs font-sans tracking-wider uppercase transition-colors disabled:opacity-40 ${
                    inquiry.status === val
                      ? "bg-brand-black text-white"
                      : "border border-gray-200 text-gray-600 hover:border-brand-black hover:text-brand-black"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminWeddingPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"photos" | "inquiries" | "content">("content");
  const [stage, setStage] = useState<ProjectStage | "all">("all");
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoRecord | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  // ── Photos ──────────────────────────────────────────────────────────────────
  const {
    data: photos = [],
    isLoading: photosLoading,
    error: photosError,
  } = useQuery({
    queryKey: ["admin-wedding-photos"],
    queryFn: () => getAdminPhotosByCategory("wedding"),
    enabled: isSupabaseConfigured,
    staleTime: 60 * 1000,
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ id, is_featured }: { id: string; is_featured: boolean }) =>
      updatePhotoRecord(id, { is_featured }),
    onSuccess: (updated) => {
      queryClient.setQueryData<PhotoRecord[]>(
        ["admin-wedding-photos"],
        (old) => old?.map((p) => (p.id === updated.id ? updated : p)) ?? [],
      );
      if (selectedPhoto?.id === updated.id) setSelectedPhoto(updated);
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
    stage === "all" ? photos : photos.filter((p) => p.project_stage === stage);
  const webReady = photos.filter((p) => p.project_stage === "web").length;
  const featuredCount = photos.filter((p) => p.is_featured).length;

  // ── Inquiries ────────────────────────────────────────────────────────────────
  const {
    data: inquiries = [],
    isLoading: inquiriesLoading,
    isError: inquiriesError,
  } = useInquiries({ type: "wedding" });

  const handleStatusChange = async (id: string, status: string) => {
    await inquiriesService.updateStatus(id, status as InquiryStatus);
    queryClient.invalidateQueries({ queryKey: ["inquiries"] });
    if (selectedInquiry?.id === id) {
      setSelectedInquiry((prev) =>
        prev ? { ...prev, status: status as InquiryStatus } : prev,
      );
    }
  };

  return (
    <div className="flex gap-0 h-full">
      {/* Main content */}
      <div className="flex-1 min-w-0 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <h1 className="font-display text-2xl font-light text-brand-black">
            웨딩 관리
          </h1>
          <Link
            to="/admin/photo-projects"
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-sans border border-brand-border hover:border-brand-black transition-colors text-brand-black"
          >
            <FolderKanban size={14} />
            포토 프로젝트
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-brand-border mb-6">
          <button
            onClick={() => setActiveTab("photos")}
            className={`px-5 py-2.5 text-sm font-sans tracking-wide transition-colors border-b-2 -mb-px ${
              activeTab === "photos"
                ? "border-brand-black text-brand-black"
                : "border-transparent text-brand-muted hover:text-brand-black"
            }`}
          >
            웨딩 사진
            <span className="ml-1.5 text-xs opacity-50">({photos.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`px-5 py-2.5 text-sm font-sans tracking-wide transition-colors border-b-2 -mb-px ${
              activeTab === "inquiries"
                ? "border-brand-black text-brand-black"
                : "border-transparent text-brand-muted hover:text-brand-black"
            }`}
          >
            웨딩 문의
            <span className="ml-1.5 text-xs opacity-50">
              ({inquiries.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab("content")}
            className={`px-5 py-2.5 text-sm font-sans tracking-wide transition-colors border-b-2 -mb-px ${
              activeTab === "content"
                ? "border-brand-black text-brand-black"
                : "border-transparent text-brand-muted hover:text-brand-black"
            }`}
          >
            콘텐츠 관리
          </button>
        </div>

        {/* ── Photos tab ──────────────────────────────────────────────────────── */}
        {activeTab === "photos" && (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <StatCard label="전체 사진" value={photos.length} />
              <StatCard label="Web (공개)" value={webReady} highlight />
              <StatCard label="대표 사진" value={featuredCount} />
            </div>

            <div className="flex flex-wrap gap-1.5 mb-5">
              {STAGE_TABS.map((tab) => {
                const count =
                  tab.value === "all"
                    ? photos.length
                    : photos.filter((p) => p.project_stage === tab.value)
                        .length;
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

            {photosLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                {Array.from({ length: 12 }, (_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gray-100 animate-pulse"
                  />
                ))}
              </div>
            ) : photosError ? (
              <AdminQueryError message={(photosError as Error).message} />
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
          </>
        )}

        {/* ── Inquiries tab ────────────────────────────────────────────────────── */}
        {activeTab === "inquiries" && (
          <>
            {inquiriesLoading ? (
              <div className="bg-white border border-gray-200 overflow-hidden">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="px-6 py-4 border-b border-gray-100">
                    <div className="h-3 bg-gray-100 animate-pulse rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : inquiriesError ? (
              <AdminQueryError message="웨딩 문의를 불러오지 못했습니다." />
            ) : inquiries.length === 0 ? (
              <div className="flex items-center justify-center py-24 text-brand-muted">
                <p className="text-sm font-sans">접수된 웨딩 문의가 없습니다</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase">
                        접수일
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase">
                        이름
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase hidden md:table-cell">
                        연락처
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase">
                        내용 요약
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase hidden md:table-cell">
                        상태
                      </th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {inquiries.map((inq) => (
                      <tr
                        key={inq.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedInquiry(inq)}
                      >
                        <td className="px-6 py-4">
                          <span className="text-xs font-sans text-gray-600">
                            {new Date(inq.created_at).toLocaleDateString(
                              "ko-KR",
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-sans text-sm font-medium text-brand-black">
                            {inq.name}
                          </p>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <p className="text-xs font-sans text-gray-600">
                            {inq.phone ?? inq.email ?? "—"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-sans text-sm text-gray-700 line-clamp-1">
                            {inq.message}
                          </p>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-sans tracking-widest uppercase ${STATUS_COLORS[inq.status] ?? "bg-gray-100"}`}
                          >
                            {STATUS_LABELS[inq.status] ?? inq.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <ChevronDown
                            size={14}
                            className="text-gray-400 -rotate-90"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── Content tab ──────────────────────────────────────────────────────── */}
        {activeTab === "content" && (
          <div className="space-y-3">
            <p className="font-sans text-xs text-brand-muted mb-5">
              웨딩 페이지 각 섹션의 관리 위치를 안내합니다.
            </p>

            <div className="bg-white border border-brand-border divide-y divide-brand-border">
              {/* 3-Track Wedding Experience — Brand CMS */}
              <div className="flex items-start justify-between px-5 py-4 gap-4">
                <div className="min-w-0">
                  <p className="font-sans text-sm font-medium text-brand-black">
                    3-Track Wedding Experience
                  </p>
                  <p className="font-sans text-xs text-brand-muted mt-0.5">
                    House Wedding · Garden Wedding · Studio Wedding 트랙 문구, 키워드, CTA 버튼
                  </p>
                </div>
                <Link
                  to="/admin/brand?tab=wedding"
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 text-xs font-sans bg-brand-black text-white hover:bg-brand-muted transition-colors whitespace-nowrap"
                >
                  Brand CMS <ArrowRight size={12} />
                </Link>
              </div>

              {/* Wedding gallery photos */}
              <div className="flex items-start justify-between px-5 py-4 gap-4">
                <div className="min-w-0">
                  <p className="font-sans text-sm font-medium text-brand-black">
                    웨딩 갤러리 · 대표 사진
                  </p>
                  <p className="font-sans text-xs text-brand-muted mt-0.5">
                    갤러리 사진 업로드 및 대표 사진 지정
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("photos")}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 text-xs font-sans border border-brand-border hover:border-brand-black transition-colors text-brand-black whitespace-nowrap"
                >
                  사진 관리 <ArrowRight size={12} />
                </button>
              </div>

              {/* Real Weddings from archive */}
              <div className="flex items-start justify-between px-5 py-4 gap-4">
                <div className="min-w-0">
                  <p className="font-sans text-sm font-medium text-brand-black">
                    실제 웨딩 사례 (Real Weddings)
                  </p>
                  <p className="font-sans text-xs text-brand-muted mt-0.5">
                    Archive에서 "wedding" 검색 결과가 자동 표시됩니다.
                  </p>
                </div>
                <Link
                  to="/admin/archive"
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 text-xs font-sans border border-brand-border hover:border-brand-black transition-colors text-brand-black whitespace-nowrap"
                >
                  Archive 관리 <ArrowRight size={12} />
                </Link>
              </div>

              {/* Journal posts */}
              <div className="flex items-start justify-between px-5 py-4 gap-4">
                <div className="min-w-0">
                  <p className="font-sans text-sm font-medium text-brand-black">
                    웨딩 저널 (Journal)
                  </p>
                  <p className="font-sans text-xs text-brand-muted mt-0.5">
                    Stories에서 "wedding" 태그 게시물이 자동 표시됩니다.
                  </p>
                </div>
                <Link
                  to="/admin/blog"
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 text-xs font-sans border border-brand-border hover:border-brand-black transition-colors text-brand-black whitespace-nowrap"
                >
                  Stories 관리 <ArrowRight size={12} />
                </Link>
              </div>

              {/* Inquiries */}
              <div className="flex items-start justify-between px-5 py-4 gap-4">
                <div className="min-w-0">
                  <p className="font-sans text-sm font-medium text-brand-black">
                    웨딩 상담 문의
                  </p>
                  <p className="font-sans text-xs text-brand-muted mt-0.5">
                    웨딩 상담 신청 내역 및 처리 상태 관리
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("inquiries")}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 text-xs font-sans border border-brand-border hover:border-brand-black transition-colors text-brand-black whitespace-nowrap"
                >
                  문의 관리 <ArrowRight size={12} />
                </button>
              </div>
            </div>

            {/* Hardcoded sections notice */}
            <div className="p-4 bg-gray-50 border border-gray-200">
              <p className="font-sans text-[11px] font-medium text-gray-500 tracking-widest uppercase mb-2">
                현재 코드에 고정된 항목 (직접 수정 필요)
              </p>
              <ul className="space-y-1 font-sans text-xs text-gray-500">
                <li>• Wedding Story 소개 문구 — 페이지 2번 섹션 제목 및 본문 3단락</li>
                <li>• Hero 카피 — 메인 타이틀, 서브 문구</li>
                <li>• FAQ — 6개 질문/답변 항목</li>
              </ul>
              <p className="font-sans text-[11px] text-gray-400 mt-2">
                코드 위치:{" "}
                <code className="bg-gray-100 px-1 py-0.5 rounded-sm">
                  src/pages/WeddingPage.tsx
                </code>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Photo detail panel */}
      {activeTab === "photos" && selectedPhoto && (
        <div className="w-[320px] shrink-0 border-l border-brand-border bg-white h-full overflow-y-auto">
          <PhotoDetailPanel
            photo={selectedPhoto}
            projectId={selectedPhoto.project_id ?? ""}
            onClose={() => setSelectedPhoto(null)}
            onSaved={handleSaved}
          />
        </div>
      )}

      {/* Inquiry detail modal */}
      {selectedInquiry && (
        <WeddingInquiryModal
          inquiry={selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
