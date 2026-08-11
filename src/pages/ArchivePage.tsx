import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Play, X } from "lucide-react";
import { useArchive, usePublicPhotos } from "../hooks/useData";
import { youtubeService, loadYouTubeAPI } from "../services/media";
import AnimatedSection from "../components/common/AnimatedSection";
import SeoHead from "../components/common/SeoHead";
import { SITE_URL, breadcrumbJsonLd } from "../lib/seo";

const FALLBACK = [
  {
    id: "1",
    slug: "kpop-shoot-2025",
    title: "K-POP 아티스트 촬영",
    category: "K-POP",
    date: "2025-12",
    cover_image_url: "",
    description: "더릿을 배경으로 한 K-POP 뮤직비디오",
  },
  {
    id: "2",
    slug: "drama-shoot-2025",
    title: "드라마 촬영 현장",
    category: "Drama",
    date: "2025-10",
    cover_image_url: "",
    description: "더릿을 배경으로 한 드라마 촬영",
  },
  {
    id: "3",
    slug: "magazine-shoot-2025",
    title: "패션 매거진 화보",
    category: "매거진",
    date: "2025-09",
    cover_image_url: "",
    description: "프리미엄 패션 매거진 촬영",
  },
  {
    id: "4",
    slug: "corporate-event-2025",
    title: "기업 신제품 런칭",
    category: "기업행사",
    date: "2025-08",
    cover_image_url: "",
    description: "브랜드 런칭 및 기업 행사",
  },
  {
    id: "5",
    slug: "fashion-show-2025",
    title: "패션쇼 2025 S/S",
    category: "패션쇼",
    date: "2025-07",
    cover_image_url: "",
    description: "더릿 홀에서 열린 패션쇼",
  },
  {
    id: "6",
    slug: "exhibition-2025",
    title: "아트 전시회",
    category: "전시회",
    date: "2025-06",
    cover_image_url: "",
    description: "현대미술 작가들의 전시",
  },
];

type ImageTile = {
  url: string;
  slug: string;
  title: string;
  category: string;
  subcategory?: string | null;
  date?: string | null;
  isCover: boolean;
  isVideo: boolean;
  videoUrl?: string | null;
};

export default function ArchivePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSubcategory, setActiveSubcategory] = useState("all");
  const [ytModal, setYtModal] = useState<{
    id: string;
    coverUrl?: string;
  } | null>(null);
  const [ytPlaying, setYtPlaying] = useState(false);
  const playerRef = useRef<YT.Player | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ytModal) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setYtModal(null);
        setYtPlaying(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [ytModal]);

  useEffect(() => {
    if (!ytModal || !ytPlaying) return;
    let cancelled = false;
    loadYouTubeAPI().then(() => {
      if (cancelled || !playerContainerRef.current) return;
      const YTApi = window.YT!;
      const target = document.createElement("div");
      playerContainerRef.current.appendChild(target);
      const p = new YTApi.Player(target, {
        videoId: ytModal.id,
        width: "100%",
        height: "100%",
        playerVars: { autoplay: 1, rel: 0, playsinline: 1 },
        events: {
          onReady: (event) => {
            event.target
              .getIframe()
              .setAttribute("allow", "autoplay; encrypted-media; fullscreen");
          },
          onStateChange: (event) => {
            if (event.data === YTApi.PlayerState.ENDED) {
              setYtPlaying(false);
            }
          },
        },
      });
      playerRef.current = p;
    });
    return () => {
      cancelled = true;
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          /* ignore */
        }
        playerRef.current = null;
      }
    };
  }, [ytModal, ytPlaying]);

  const { data: archives } = useArchive();
  const { data: archivePhotos } = usePublicPhotos("archive");
  const items = archives && archives.length > 0 ? archives : FALLBACK;

  // 데이터에서 대분류 추출
  const categories = useMemo(() => {
    const cats = [...new Set(items.map((i) => i.category).filter(Boolean))];
    return (cats as string[]).sort();
  }, [items]);

  // 선택된 대분류의 중분류 추출
  const subcategories = useMemo(() => {
    if (activeCategory === "all") return [];
    const subs = [
      ...new Set(
        items
          .filter((i) => i.category === activeCategory)
          .map(
            (i) =>
              (i as unknown as { subcategory?: string | null }).subcategory,
          )
          .filter((s): s is string => !!s),
      ),
    ];
    return subs.sort();
  }, [items, activeCategory]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setActiveSubcategory("all");
  };

  const filtered = items.filter((item) => {
    if (activeCategory !== "all" && item.category !== activeCategory)
      return false;
    if (activeSubcategory !== "all") {
      const sub = (item as unknown as { subcategory?: string | null })
        .subcategory;
      if (sub !== activeSubcategory) return false;
    }
    return true;
  });

  const pool = archivePhotos ?? [];
  const tiles: ImageTile[] = filtered.flatMap((item, idx): ImageTile[] => {
    const meta = item as unknown as {
      media_type?: string;
      subcategory?: string | null;
      video_url?: string | null;
    };

    // 동영상: 타일 1개
    if (meta.media_type === "video") {
      return [
        {
          url: item.cover_image_url || "",
          slug: item.slug,
          title: item.title,
          category: item.category,
          subcategory: meta.subcategory,
          date: item.date,
          isCover: true,
          isVideo: true,
          videoUrl: meta.video_url,
        },
      ];
    }

    // 사진: 이미지 타일 펼치기
    const allUrls: string[] = [];
    const cover =
      item.cover_image_url ||
      (pool.length > 0 ? pool[idx % pool.length]?.public_url : undefined) ||
      "";
    if (cover) allUrls.push(cover);
    const galleryImages = (item as { images?: string[] }).images;
    if (galleryImages) {
      galleryImages.forEach((u: string) => {
        if (u && !allUrls.includes(u)) allUrls.push(u);
      });
    }
    return allUrls.length > 0
      ? allUrls.map((url, i) => ({
          url,
          slug: item.slug,
          title: item.title,
          category: item.category,
          subcategory: meta.subcategory,
          date: item.date,
          isCover: i === 0,
          isVideo: false,
          videoUrl: null,
        }))
      : [
          {
            url: "",
            slug: item.slug,
            title: item.title,
            category: item.category,
            subcategory: meta.subcategory,
            date: item.date,
            isCover: true,
            isVideo: false,
            videoUrl: null,
          },
        ];
  });

  return (
    <>
      <SeoHead
        title="Archive — THE LIT | 더릿을 채운 이야기들"
        description="더릿을 무대로 삼은 뮤직비디오·드라마·CF·브랜드 행사·웨딩의 모든 기록."
        canonical={`${SITE_URL}/archive`}
        keywords="더릿 촬영 이력, 뮤직비디오 촬영 장소, 드라마 촬영 장소, CF 촬영 서울, 브랜드 행사 이력"
        jsonLd={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Archive", url: `${SITE_URL}/archive` },
        ])}
      />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-brand-black">
        <div className="container-wide">
          <AnimatedSection animation="fade-up">
            <p className="eyebrow text-white/40 mb-4">Archive</p>
            <h1 className="font-display text-display font-light text-white mb-6">
              더릿을 채운 이야기들
            </h1>
            <p className="font-sans text-base text-white/60 max-w-xl">
              2019년부터 더릿을 무대로 삼은 모든 순간의 기록입니다.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Filter */}
      <div className="sticky top-16 lg:top-20 z-20 bg-brand-black/95 backdrop-blur border-b border-white/10">
        {/* 대분류 필터 */}
        <div className="container-wide py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleCategoryChange("all")}
            className={`shrink-0 px-5 py-2 font-sans text-xs font-medium tracking-widest uppercase transition-all duration-200
              ${
                activeCategory === "all"
                  ? "bg-white text-brand-black"
                  : "text-white/50 hover:text-white"
              }`}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`shrink-0 px-5 py-2 font-sans text-xs font-medium tracking-widest uppercase transition-all duration-200
                ${
                  activeCategory === cat
                    ? "bg-white text-brand-black"
                    : "text-white/50 hover:text-white"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
        {/* 중분류 필터 (선택된 대분류의 중분류가 있을 때만 표시) */}
        {subcategories.length > 0 && (
          <div className="container-wide pb-3 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-white/10">
            <button
              onClick={() => setActiveSubcategory("all")}
              className={`shrink-0 px-4 py-1.5 font-sans text-[10px] font-medium tracking-widest uppercase transition-all duration-200
                ${
                  activeSubcategory === "all"
                    ? "bg-white/20 text-white"
                    : "text-white/40 hover:text-white/70"
                }`}
            >
              전체
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSubcategory(sub)}
                className={`shrink-0 px-4 py-1.5 font-sans text-[10px] font-medium tracking-widest uppercase transition-all duration-200
                  ${
                    activeSubcategory === sub
                      ? "bg-white/20 text-white"
                      : "text-white/40 hover:text-white/70"
                  }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      <section className="section-padding bg-brand-white">
        <div className="container-wide">
          <div className="grid grid-cols-2 lg:grid-cols-3 auto-rows-[220px] gap-3 lg:gap-4">
            {tiles.map((tile, i) => {
              // 7타일 반복 패턴: 0번·4번은 tall(2행), 나머지는 normal(1행)
              const isTall = i % 7 === 0 || i % 7 === 4;
              const tileInner = (
                <>
                  {tile.url ? (
                    <img
                      src={tile.url}
                      alt={tile.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-end p-5 bg-brand-warm" />
                  )}
                  {tile.isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:bg-black/60 transition-colors">
                        <Play
                          size={22}
                          className="text-white ml-1"
                          fill="currentColor"
                        />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                  {tile.isCover && (
                    <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="font-sans text-[10px] tracking-widest uppercase text-white/60 mb-1">
                        {tile.date?.substring(0, 7)} · {tile.category}
                      </p>
                      <h3 className="font-display text-lg font-light text-white">
                        {tile.title}
                      </h3>
                    </div>
                  )}
                  {/* Always shown title overlay (mobile, cover only) */}
                  {tile.isCover && (
                    <div className="absolute bottom-0 left-0 right-0 p-5 lg:hidden">
                      <div className="bg-black/60 backdrop-blur-sm p-3">
                        <h3 className="font-display text-base font-light text-white">
                          {tile.title}
                        </h3>
                      </div>
                    </div>
                  )}
                </>
              );
              return (
                <AnimatedSection
                  key={`${tile.slug}-${i}`}
                  animation="fade-up"
                  delay={i * 40}
                  className={isTall ? "row-span-2" : ""}
                >
                  {tile.isVideo && tile.videoUrl ? (
                    <button
                      onClick={() => {
                        if (tile.videoUrl!.includes("/shorts/")) {
                          window.open(
                            tile.videoUrl!,
                            "_blank",
                            "noopener,noreferrer",
                          );
                          return;
                        }
                        const ytId = youtubeService.extractVideoId(
                          tile.videoUrl!,
                        );
                        if (ytId) {
                          setYtModal({ id: ytId, coverUrl: tile.url });
                          setYtPlaying(true);
                        } else {
                          window.open(
                            tile.videoUrl!,
                            "_blank",
                            "noopener,noreferrer",
                          );
                        }
                      }}
                      className="group block relative overflow-hidden h-full bg-brand-warm w-full text-left cursor-pointer"
                    >
                      {tileInner}
                    </button>
                  ) : (
                    <Link
                      to={`/archive/${tile.slug}`}
                      className="group block relative overflow-hidden h-full bg-brand-warm"
                    >
                      {tileInner}
                    </Link>
                  )}
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {ytModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-6"
          onClick={() => {
            setYtModal(null);
            setYtPlaying(false);
          }}
        >
          <div
            className="flex flex-col items-end w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setYtModal(null);
                setYtPlaying(false);
              }}
              className="mb-2 text-white/70 hover:text-white transition-colors"
              aria-label="닫기"
            >
              <X size={28} />
            </button>
            <div className="w-full aspect-video">
              {ytPlaying ? (
                <div ref={playerContainerRef} className="w-full h-full" />
              ) : (
                <button
                  onClick={() => setYtPlaying(true)}
                  className="w-full h-full relative flex items-center justify-center group bg-brand-black"
                >
                  {ytModal.coverUrl && (
                    <img
                      src={ytModal.coverUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                  )}
                  <div className="relative z-10 w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:bg-black/80 transition-colors">
                    <Play
                      size={22}
                      className="text-white ml-1"
                      fill="currentColor"
                    />
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
