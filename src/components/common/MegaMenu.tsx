import { Link } from "react-router-dom";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useSpaces, usePublicPhotos } from "../../hooks/useData";
import { useMemo } from "react";

interface MegaMenuProps {
  activeItem: string | null;
  onMegaEnter: () => void;
  onMegaLeave: () => void;
}

// ─── Static data ────────────────────────────────────────────────────────────

const SPACES = [
  {
    label: "Main Studio",
    ko: "메인 스튜디오",
    desc: "공연 · 강연 · 촬영",
    cap: "80명",
    href: "/spaces",
    img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=480&q=75",
  },
  {
    label: "Open Hall",
    ko: "오픈 홀",
    desc: "전시 · 대형 이벤트",
    cap: "150명",
    href: "/spaces",
    img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=480&q=75",
  },
  {
    label: "Cafe Space",
    ko: "카페 공간",
    desc: "소모임 · 팝업",
    cap: "30명",
    href: "/spaces",
    img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=480&q=75",
  },
  {
    label: "Garden Yard",
    ko: "가든 야드",
    desc: "야외 행사 · 파티",
    cap: "50명",
    href: "/spaces",
    img: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=480&q=75",
  },
];

const PROGRAMS = [
  {
    label: "전시",
    en: "Exhibition",
    href: "/programs",
    img: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=480&q=75",
  },
  {
    label: "공연",
    en: "Performance",
    href: "/programs",
    img: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=480&q=75",
  },
  {
    label: "워크숍",
    en: "Workshop",
    href: "/programs",
    img: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=480&q=75",
  },
  {
    label: "강연",
    en: "Lecture",
    href: "/programs",
    img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=480&q=75",
  },
];

const ARCHIVE_CATS = [
  { label: "지난 행사", en: "Past Events", href: "/archive" },
  { label: "브랜드 협업", en: "Brand Collab", href: "/archive" },
  { label: "촬영", en: "Photo & Film", href: "/archive" },
  { label: "전시", en: "Exhibition", href: "/archive" },
];

const MEDIA_CHANNELS = [
  {
    label: "YouTube",
    desc: "공간 투어 · 인터뷰 · 메이킹",
    href: "/media",
    external: false,
  },
  {
    label: "Instagram",
    desc: "@thelit_official",
    href: "https://instagram.com/thelit_official",
    external: true,
  },
  {
    label: "Naver Blog",
    desc: "프로그램 후기 · 공간 소개",
    href: "https://blog.naver.com/thelit_culture",
    external: true,
  },
  {
    label: "Latest",
    desc: "전체 최신 콘텐츠",
    href: "/media",
    external: false,
  },
];

// ─── Animation variants ──────────────────────────────────────────────────────

const stagger: Variants = {
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.06 } },
  hide: {},
};
const child: Variants = {
  hide: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

// ─── Shared CTA link ─────────────────────────────────────────────────────────

function CtaLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      to={href}
      className="inline-flex items-center gap-1.5 font-sans text-[9.5px] font-semibold tracking-[0.2em] uppercase text-brand-black border-b border-brand-black pb-px hover:text-brand-accent hover:border-brand-accent transition-colors duration-200"
    >
      {label} <ArrowUpRight size={11} />
    </Link>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

// Category image fallbacks (same as SpacesPreviewSection)
const SPACE_IMAGES_FALLBACK: Record<string, string> = {
  cafe: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=480&q=75',
  garden: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=480&q=75',
  studio: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=480&q=75',
  storage: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=480&q=75',
  hall: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=480&q=75',
  other: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=480&q=75',
}

export default function MegaMenu({
  activeItem,
  onMegaEnter,
  onMegaLeave,
}: MegaMenuProps) {
  const { data: spacesData } = useSpaces()
  const { data: spacePhotos } = usePublicPhotos("space")

  // 업로드된 실사진을 코바 이미지로 우선 사용
  const spacePhotoMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const p of spacePhotos ?? []) {
      if (p.space_category && p.public_url && !map[p.space_category]) {
        map[p.space_category] = p.public_url
      }
    }
    return map
  }, [spacePhotos])

  // DB 데이터를 메뉴 카드 형식으로 변환, 없으면 정적 SPACES 사용
  const menuSpaces = (spacesData && spacesData.length > 0)
    ? spacesData.slice(0, 4).map((s) => ({
        label: s.name_en || s.name,
        ko: s.name,
        desc: s.description?.slice(0, 30) ?? '',
        cap: s.capacity ? `${s.capacity}명` : '',
        href: `/spaces/${s.slug}`,
        fallbackImg: s.cover_image_url || SPACE_IMAGES_FALLBACK[s.category] || SPACE_IMAGES_FALLBACK.other,
        uploadedImg: spacePhotoMap[s.category] as string | undefined,
      }))
    : SPACES.map(s => ({ ...s, fallbackImg: s.img, uploadedImg: undefined as string | undefined }))
  return (
    <AnimatePresence>
      {activeItem && (
        <>
          {/* Dim backdrop */}
          <motion.div
            className="fixed inset-0 top-[72px] z-40 bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Panel */}
          <motion.div
            role="region"
            aria-label={`${activeItem} 메뉴`}
            className="fixed left-0 right-0 top-[72px] z-40 bg-white border-b border-black/[0.07] shadow-[0_12px_48px_rgba(0,0,0,0.1)]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
            onMouseEnter={onMegaEnter}
            onMouseLeave={onMegaLeave}
          >
            <div className="container-wide py-10 lg:py-12">
              {/* ── Spaces ── */}
              {activeItem === "Spaces" && (
                <motion.div
                  variants={stagger}
                  initial="hide"
                  animate="show"
                  className="grid grid-cols-5 gap-6 lg:gap-8"
                >
                  {menuSpaces.map((s) => (
                    <motion.div key={s.label} variants={child}>
                      <Link to={s.href} className="group block">
                        <div className="aspect-[4/3] overflow-hidden bg-brand-warm mb-3 relative">
                          {/* 폴백: 즉시 표시 */}
                          <img
                            src={s.fallbackImg}
                            alt={s.ko}
                            aria-hidden="true"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                          {/* 업로드 사진: 로드 완료 후 fade in */}
                          {s.uploadedImg && (
                            <img
                              src={s.uploadedImg}
                              alt={s.ko}
                              className="absolute inset-0 w-full h-full object-cover opacity-0 transition-[opacity,transform] duration-700 group-hover:scale-105"
                              onLoad={(e) => (e.currentTarget as HTMLImageElement).classList.remove('opacity-0')}
                              loading="lazy"
                            />
                          )}
                        </div>
                        <p className="font-sans text-[8.5px] tracking-[0.18em] uppercase text-brand-subtle mb-0.5">
                          {s.desc}
                        </p>
                        <p className="font-display text-[1.05rem] font-light text-brand-black group-hover:text-brand-accent transition-colors duration-200 leading-tight">
                          {s.label}
                        </p>
                        <p className="font-sans text-[10px] text-brand-subtle mt-1">
                          최대 {s.cap}
                        </p>
                      </Link>
                    </motion.div>
                  ))}
                  <motion.div
                    variants={child}
                    className="flex flex-col justify-between pl-5 border-l border-brand-line"
                  >
                    <div>
                      <p className="font-sans text-[8.5px] tracking-[0.22em] uppercase text-brand-subtle mb-3">
                        공간 대관
                      </p>
                      <p className="font-sans text-[13px] text-brand-muted leading-relaxed">
                        전시, 공연, 강연, 촬영, 브랜드 행사를 위한 프리미엄
                        공간.
                      </p>
                    </div>
                    <CtaLink href="/spaces" label="All Spaces" />
                  </motion.div>
                </motion.div>
              )}

              {/* ── Programs ── */}
              {activeItem === "Programs" && (
                <motion.div
                  variants={stagger}
                  initial="hide"
                  animate="show"
                  className="grid grid-cols-5 gap-6 lg:gap-8"
                >
                  {PROGRAMS.map((p) => (
                    <motion.div key={p.label} variants={child}>
                      <Link to={p.href} className="group block">
                        <div className="aspect-[4/3] overflow-hidden bg-brand-warm mb-3">
                          <img
                            src={p.img}
                            alt={p.label}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                        <p className="font-sans text-[8.5px] tracking-[0.18em] uppercase text-brand-subtle mb-0.5">
                          {p.en}
                        </p>
                        <p className="font-display text-[1.05rem] font-light text-brand-black group-hover:text-brand-accent transition-colors duration-200 leading-tight">
                          {p.label}
                        </p>
                      </Link>
                    </motion.div>
                  ))}
                  <motion.div
                    variants={child}
                    className="flex flex-col justify-between pl-5 border-l border-brand-line"
                  >
                    <div>
                      <p className="font-sans text-[8.5px] tracking-[0.22em] uppercase text-brand-subtle mb-3">
                        프로그램
                      </p>
                      <p className="font-sans text-[13px] text-brand-muted leading-relaxed">
                        전시부터 강연까지, 더릿의 다양한 문화 프로그램.
                      </p>
                    </div>
                    <CtaLink href="/programs" label="All Programs" />
                  </motion.div>
                </motion.div>
              )}

              {/* ── Archive ── */}
              {activeItem === "Archive" && (
                <motion.div
                  variants={stagger}
                  initial="hide"
                  animate="show"
                  className="flex gap-20"
                >
                  <div className="flex-1 grid grid-cols-2 gap-x-16">
                    {ARCHIVE_CATS.map((a) => (
                      <motion.div key={a.label} variants={child}>
                        <Link
                          to={a.href}
                          className="group flex items-center justify-between py-4 border-b border-brand-line hover:border-brand-border transition-colors duration-200"
                        >
                          <div>
                            <p className="font-display text-lg font-light text-brand-black group-hover:text-brand-accent transition-colors duration-200 leading-tight">
                              {a.label}
                            </p>
                            <p className="font-sans text-[9px] tracking-widest uppercase text-brand-subtle mt-0.5">
                              {a.en}
                            </p>
                          </div>
                          <ArrowUpRight
                            size={13}
                            className="text-brand-line group-hover:text-brand-black transition-colors duration-200"
                          />
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div
                    variants={child}
                    className="w-60 shrink-0 flex flex-col justify-between"
                  >
                    <div>
                      <p className="font-sans text-[8.5px] tracking-[0.22em] uppercase text-brand-subtle mb-3">
                        아카이브
                      </p>
                      <p className="font-sans text-[13px] text-brand-muted leading-relaxed">
                        더릿에서 열린 모든 행사와 프로그램의 기록.
                      </p>
                    </div>
                    <CtaLink href="/archive" label="Browse Archive" />
                  </motion.div>
                </motion.div>
              )}

              {/* ── Media ── */}
              {activeItem === "Media" && (
                <motion.div
                  variants={stagger}
                  initial="hide"
                  animate="show"
                  className="flex gap-20"
                >
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    {MEDIA_CHANNELS.map((m) => {
                      const inner = (
                        <>
                          <div className="flex-1 min-w-0">
                            <p className="font-sans text-sm font-medium text-brand-black group-hover:text-brand-accent transition-colors duration-200 mb-1">
                              {m.label}
                            </p>
                            <p className="font-sans text-[12px] text-brand-subtle">
                              {m.desc}
                            </p>
                          </div>
                          <ArrowUpRight
                            size={13}
                            className="shrink-0 mt-0.5 ml-2 text-brand-line group-hover:text-brand-black transition-colors duration-200"
                          />
                        </>
                      );
                      return (
                        <motion.div key={m.label} variants={child}>
                          {m.external ? (
                            <a
                              href={m.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-start p-4 border border-brand-line hover:border-brand-border transition-colors duration-200"
                            >
                              {inner}
                            </a>
                          ) : (
                            <Link
                              to={m.href}
                              className="group flex items-start p-4 border border-brand-line hover:border-brand-border transition-colors duration-200"
                            >
                              {inner}
                            </Link>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                  <motion.div
                    variants={child}
                    className="w-60 shrink-0 flex flex-col justify-between"
                  >
                    <div>
                      <p className="font-sans text-[8.5px] tracking-[0.22em] uppercase text-brand-subtle mb-3">
                        미디어
                      </p>
                      <p className="font-sans text-[13px] text-brand-muted leading-relaxed">
                        YouTube, Instagram, 블로그를 통해 더릿의 콘텐츠를
                        만나보세요.
                      </p>
                    </div>
                    <CtaLink href="/media" label="All Media" />
                  </motion.div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
