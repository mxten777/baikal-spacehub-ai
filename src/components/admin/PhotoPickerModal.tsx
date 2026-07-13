import { useState } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { usePublicPhotos } from "../../hooks/useData";
import type { ProjectCategory } from "../../types";

// ─── 카테고리 탭 ───────────────────────────────────────────────────────────────

const CATEGORY_TABS: { value: ProjectCategory | null; label: string }[] = [
  { value: null, label: "전체" },
  { value: "main", label: "Main" },
  { value: "wedding", label: "Wedding" },
  { value: "space", label: "Space" },
  { value: "food_beverage", label: "F&B" },
  { value: "archive", label: "Archive" },
  { value: "about", label: "About" },
];

// ─── Props ─────────────────────────────────────────────────────────────────────

interface PhotoPickerModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with the selected photo's public_url */
  onSelect: (url: string) => void;
  /** Pre-select a category tab on open */
  defaultCategory?: ProjectCategory | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PhotoPickerModal({
  open,
  onClose,
  onSelect,
  defaultCategory = null,
}: PhotoPickerModalProps) {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | null>(
    defaultCategory,
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { data: photos, isLoading } = usePublicPhotos(activeCategory, {
    limit: 60,
  });

  if (!open) return null;

  const handleSelect = (url: string) => {
    onSelect(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2
              className="font-display text-lg font-light text-brand-black"
              style={{ letterSpacing: "-0.02em" }}
            >
              라이브러리에서 선택
            </h2>
            <p className="font-sans text-[11px] text-gray-400 mt-0.5">
              Web 단계의 사진만 표시됩니다. Asset Explorer에서 단계를
              변경하세요.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-brand-black transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category tabs */}
        <div className="px-5 py-2.5 border-b border-gray-100 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={String(tab.value)}
              onClick={() => setActiveCategory(tab.value)}
              className={`shrink-0 px-4 py-1.5 font-sans text-[10.5px] font-medium tracking-[0.14em] uppercase transition-all duration-200 ${
                activeCategory === tab.value
                  ? "bg-brand-black text-white"
                  : "text-gray-500 hover:text-brand-black"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Photo grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 size={24} className="animate-spin text-gray-300" />
            </div>
          ) : !photos || photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-400">
              <p className="font-sans text-sm">
                이 카테고리에 Web 단계 사진이 없습니다.
              </p>
              <p className="font-sans text-xs">
                Asset Explorer에서 사진을 Web 단계로 이동하세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() =>
                    photo.public_url && handleSelect(photo.public_url)
                  }
                  onMouseEnter={() => setHoveredId(photo.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  disabled={!photo.public_url}
                  className="relative aspect-square overflow-hidden bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-black disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {photo.public_url && (
                    <img
                      src={photo.public_url}
                      alt={photo.original_name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                  {/* Hover overlay */}
                  {hoveredId === photo.id && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <CheckCircle2 size={28} className="text-white" />
                    </div>
                  )}
                  {/* Featured badge */}
                  {photo.is_featured && (
                    <div className="absolute top-1 left-1 bg-brand-black/80 text-white text-[8px] px-1.5 py-0.5 font-sans tracking-wider">
                      F
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between shrink-0">
          <span className="font-sans text-xs text-gray-400">
            {photos ? `${photos.length}장` : "—"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-sans text-gray-600 hover:text-brand-black"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
