import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useArchive, usePublicPhotos } from "../hooks/useData";
import AnimatedSection from "../components/common/AnimatedSection";
import LoadingSpinner from "../components/common/LoadingSpinner";

const CATEGORIES = [
  { value: "all", label: "전체" },
  { value: "exhibition", label: "전시" },
  { value: "performance", label: "공연" },
  { value: "lecture", label: "강연" },
  { value: "workshop", label: "워크숍" },
  { value: "event", label: "이벤트" },
];

const FALLBACK = [
  {
    id: "1",
    slug: "winter-exhibition-2025",
    title: "겨울 빛 — 설치 전시",
    category: "exhibition",
    date: "2025-12",
    cover_image_url:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80",
    description: "겨울의 고요와 빛의 대화",
  },
  {
    id: "2",
    slug: "autumn-concert-2025",
    title: "가을 콘서트 2025",
    category: "performance",
    date: "2025-10",
    cover_image_url:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80",
    description: "가을밤을 수놓는 라이브 음악",
  },
  {
    id: "3",
    slug: "brand-event-samsung",
    title: "삼성 브랜드 런칭",
    category: "event",
    date: "2025-09",
    cover_image_url:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
    description: "프리미엄 제품 런칭 이벤트",
  },
  {
    id: "4",
    slug: "photo-workshop-2025",
    title: "필름 사진 워크숍",
    category: "workshop",
    date: "2025-08",
    cover_image_url:
      "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&q=80",
    description: "아날로그 사진의 매력을 발견하다",
  },
  {
    id: "5",
    slug: "summer-art-fair",
    title: "여름 아트페어",
    category: "exhibition",
    date: "2025-07",
    cover_image_url:
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&q=80",
    description: "신진 작가들의 다양한 작품 전시",
  },
  {
    id: "6",
    slug: "talk-show-june",
    title: "문화 토크쇼 시즌 1",
    category: "lecture",
    date: "2025-06",
    cover_image_url:
      "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=600&q=80",
    description: "문화 전문가들과 나누는 깊은 대화",
  },
];

// 아카이브 항목의 모든 이미지를 개별 타일로 펼친 타입
type ImageTile = {
  url: string;
  slug: string;
  title: string;
  category: string;
  date?: string | null;
  isCover: boolean;
};

export default function ArchivePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const { data: archives, isLoading } = useArchive();
  const { data: archivePhotos } = usePublicPhotos("archive");
  const items = archives && archives.length > 0 ? archives : FALLBACK;
  const filtered =
    activeCategory === "all"
      ? items
      : items.filter((a) => a.category === activeCategory);

  // 각 archive item의 images[] + cover를 개별 타일로 펼침
  const pool = archivePhotos ?? [];
  const tiles: ImageTile[] = filtered.flatMap((item, idx) => {
    const allUrls: string[] = [];

    // cover image
    const cover = item.cover_image_url
      || (pool.length > 0 ? pool[idx % pool.length]?.public_url : undefined)
      || "";
    if (cover) allUrls.push(cover);

    // gallery images (중복 제거)
    const galleryImages = (item as { images?: string[] }).images;
    if (galleryImages) {
      galleryImages.forEach((u: string) => {
        if (u && !allUrls.includes(u)) allUrls.push(u);
      });
    }

    return allUrls.map((url, i) => ({
      url,
      slug: item.slug,
      title: item.title,
      category: item.category,
      date: item.date,
      isCover: i === 0,
    }));
  });

  return (
    <>
      <Helmet>
        <title>Archive — The Lit</title>
        <meta
          name="description"
          content="더릿에서 열렸던 전시, 공연, 강연, 워크숍 등 모든 문화 행사의 기록 아카이브"
        />
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-16 bg-brand-black">
        <div className="container-wide">
          <AnimatedSection animation="fade-up">
            <p className="eyebrow text-white/40 mb-4">Archive</p>
            <h1 className="font-display text-display font-light text-white mb-6">
              지나온 모든 순간
            </h1>
            <p className="font-sans text-base text-white/60 max-w-xl">
              더릿에서 펼쳐진 문화 행사들의 소중한 기록입니다.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Filter */}
      <div className="sticky top-16 lg:top-20 z-20 bg-brand-black/95 backdrop-blur border-b border-white/10">
        <div className="container-wide py-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`shrink-0 px-5 py-2 font-sans text-xs font-medium tracking-widest uppercase transition-all duration-200
                ${
                  activeCategory === cat.value
                    ? "bg-white text-brand-black"
                    : "text-white/50 hover:text-white"
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <section className="section-padding bg-brand-white">
        <div className="container-wide">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {tiles.map((tile, i) => (
                <AnimatedSection
                  key={`${tile.slug}-${i}`}
                  animation="fade-up"
                  delay={i * 40}
                >
                  <Link
                    to={`/archive/${tile.slug}`}
                    className="group block relative overflow-hidden aspect-[4/3] bg-brand-warm"
                  >
                    <img
                      src={tile.url}
                      alt={tile.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                    {tile.isCover && (
                      <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <p className="font-sans text-[10px] tracking-widest uppercase text-white/60 mb-1">
                          {tile.date?.substring(0, 7)} ·{" "}
                          {CATEGORIES.find((c) => c.value === tile.category)?.label}
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
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
