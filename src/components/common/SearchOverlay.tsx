import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import { useSearch } from "../../hooks/useData";
import type { SearchResults } from "../../hooks/useData";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const QUICK_LINKS = [
  { cat: "Spaces", label: "공간 대관", href: "/spaces" },
  { cat: "Programs", label: "전시", href: "/programs" },
  { cat: "Programs", label: "워크숍", href: "/programs" },
  { cat: "Programs", label: "공연", href: "/programs" },
  { cat: "Archive", label: "아카이브", href: "/archive" },
  { cat: "Blog", label: "블로그", href: "/blog" },
  { cat: "Media", label: "미디어", href: "/media" },
  { cat: "Contact", label: "문의하기", href: "/contact" },
];

interface ResultItem {
  id: string;
  title: string;
  sub: string;
  href: string;
}

interface CategorySection {
  key: string;
  label: string;
  listHref: string;
  items: ResultItem[];
}

function buildSections(results: SearchResults): CategorySection[] {
  const sections: CategorySection[] = [];

  if (results.spaces.length > 0) {
    sections.push({
      key: "spaces",
      label: "Spaces",
      listHref: "/spaces",
      items: results.spaces.map((s) => ({
        id: s.id,
        title: s.name,
        sub: s.description ?? s.short_description ?? "",
        href: `/spaces/${s.slug}`,
      })),
    });
  }

  if (results.programs.length > 0) {
    sections.push({
      key: "programs",
      label: "Programs",
      listHref: "/programs",
      items: results.programs.map((p) => ({
        id: p.id,
        title: p.title,
        sub: p.short_description ?? p.description ?? "",
        href: `/programs/${p.slug}`,
      })),
    });
  }

  if (results.blog.length > 0) {
    sections.push({
      key: "blog",
      label: "Blog",
      listHref: "/blog",
      items: results.blog.map((p) => ({
        id: p.id,
        title: p.title,
        sub: p.excerpt ?? "",
        href: `/blog/${p.slug}`,
      })),
    });
  }

  if (results.archive.length > 0) {
    sections.push({
      key: "archive",
      label: "Archive",
      listHref: "/archive",
      items: results.archive.map((a) => ({
        id: a.id,
        title: a.title,
        sub: a.description ?? "",
        href: `/archive/${a.slug}`,
      })),
    });
  }

  return sections;
}

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { results, isLoading, isActive } = useSearch(query);

  // Focus input when overlay opens
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("");
      const t = setTimeout(() => inputRef.current?.focus(), 130);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Keyboard: Escape → close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const queryTrimmed = query.trim();
  const isSearching = queryTrimmed.length >= 2;
  const sections = isActive ? buildSections(results) : [];
  const hasResults = sections.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="사이트 검색"
          className="fixed inset-0 z-[70] bg-brand-black/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          {/* Close button */}
          <motion.button
            className="absolute top-5 right-5 lg:top-7 lg:right-8 w-10 h-10 flex items-center justify-center text-white/35 hover:text-white transition-colors"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            aria-label="검색 닫기"
          >
            <X size={18} />
          </motion.button>

          <div className="container-wide pt-24 lg:pt-[10vh]">
            {/* Search input */}
            <motion.div
              className="flex items-center gap-4 border-b border-white/[0.12] pb-5"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.07,
                duration: 0.38,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              <Search
                size={20}
                className="text-white/20 shrink-0"
                strokeWidth={1.5}
              />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="프로그램, 공간, 블로그 검색..."
                className="flex-1 bg-transparent font-display text-2xl lg:text-[2.5rem] font-light text-white placeholder:text-white/18 outline-none tracking-[-0.01em]"
                autoComplete="off"
                aria-label="검색어 입력"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-white/25 hover:text-white/55 transition-colors shrink-0"
                  aria-label="검색어 지우기"
                >
                  <X size={16} />
                </button>
              )}
            </motion.div>

            {/* Body */}
            <motion.div
              className="mt-10 overflow-y-auto max-h-[calc(100vh-280px)] pb-16"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, duration: 0.35 }}
            >
              {!isSearching ? (
                /* Quick Links */
                <>
                  <p className="font-sans text-[8.5px] tracking-[0.26em] uppercase text-white/22 mb-6">
                    Quick Links
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_LINKS.map((ql) => (
                      <Link
                        key={ql.cat + ql.label}
                        to={ql.href}
                        onClick={onClose}
                        className="flex items-center gap-2 px-4 py-2.5 border border-white/[0.1] text-white/50 hover:border-white/30 hover:text-white transition-all duration-200 font-sans text-xs tracking-wide"
                      >
                        <span className="text-[8px] text-white/22 uppercase tracking-widest">
                          {ql.cat}
                        </span>
                        <span className="text-white/20">/</span>
                        {ql.label}
                      </Link>
                    ))}
                  </div>
                </>
              ) : isLoading || !isActive ? (
                /* Loading */
                <div className="flex items-center gap-3 text-white/30">
                  <Loader2 size={15} className="animate-spin shrink-0" />
                  <span className="font-sans text-sm tracking-wide">검색 중...</span>
                </div>
              ) : !hasResults ? (
                /* No results */
                <p className="font-sans text-sm text-white/30 tracking-wide">
                  <span className="text-white/55">"{queryTrimmed}"</span>
                  <span className="ml-2">— 검색 결과가 없습니다.</span>
                </p>
              ) : (
                /* Results */
                <div className="space-y-10">
                  {sections.map((section) => (
                    <div key={section.key}>
                      <div className="flex items-center justify-between mb-4">
                        <p className="font-sans text-[8.5px] tracking-[0.26em] uppercase text-white/22">
                          {section.label}
                        </p>
                        {section.items.length >= 3 && (
                          <Link
                            to={section.listHref}
                            onClick={onClose}
                            className="font-sans text-[9px] tracking-[0.15em] uppercase text-white/30 hover:text-white/70 transition-colors"
                          >
                            전체 보기 →
                          </Link>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {section.items.map((item) => (
                          <Link
                            key={item.id}
                            to={item.href}
                            onClick={onClose}
                            className="group flex flex-col gap-1 px-4 py-3.5 border border-white/[0.07] hover:border-white/20 hover:bg-white/[0.03] transition-all duration-200"
                          >
                            <span className="font-display text-sm font-light text-white/80 group-hover:text-white transition-colors leading-snug line-clamp-1">
                              {item.title}
                            </span>
                            {item.sub && (
                              <span className="font-sans text-[11px] text-white/30 leading-snug line-clamp-2">
                                {item.sub}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Keyboard hint */}
            <motion.p
              className="absolute bottom-8 left-0 right-0 text-center font-sans text-[9px] tracking-[0.2em] uppercase text-white/15"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              ESC 키로 닫기
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
