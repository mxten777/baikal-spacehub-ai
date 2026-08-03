import { useState } from "react";
import { Link } from "react-router-dom";
import { useArchive, usePublicPhotos } from "../hooks/useData";
import AnimatedSection from "../components/common/AnimatedSection";
import SeoHead from "../components/common/SeoHead";
import { SITE_URL, breadcrumbJsonLd } from "../lib/seo";

const CATEGORIES = [
  { value: "all", label: "전체" },
  { value: "전시", label: "전시" },
  { value: "공연", label: "공연" },
  { value: "강연", label: "강연" },
  { value: "워크숍", label: "워크숍" },
  { value: "이벤트", label: "이벤트" },
];

const FALLBACK = [
  {
    id: "1",
    slug: "winter-exhibition-2025",
    title: "겨울 빛 — 설치 전시",
    category: "전시",
    date: "2025-12",
    cover_image_url: "",
    description: "겨울의 고요와 빛의 대화",
  },
  {
    id: "2",
    slug: "autumn-concert-2025",
    title: "가을 콘서트 2025",
    category: "공연",
    date: "2025-10",
    cover_image_url: "",
    description: "가을밤을 수놓는 라이브 음악",
  },
  {
    id: "3",
    slug: "brand-event-samsung",
    title: "삼성 브랜드 런칭",
    category: "이벤트",
    date: "2025-09",
    cover_image_url: "",
    description: "프리미엄 제품 런칭 이벤트",
  },
  {
    id: "4",
    slug: "photo-workshop-2025",
    title: "필름 사진 워크숍",
    category: "워크숍",
    date: "2025-08",
    cover_image_url: "",
    description: "아날로그 사진의 매력을 발견하다",
  },
  {
    id: "5",
    slug: "summer-art-fair",
    title: "여름 아트페어",
    category: "전시",
    date: "2025-07",
    cover_image_url: "",
    description: "신진 작가들의 다양한 작품 전시",
  },
  {
    id: "6",
    slug: "talk-show-june",
    title: "문화 토크쇼 시즌 1",
    category: "강연",
    date: "2025-06",
    cover_image_url: "",
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
  const { data: archives } = useArchive();
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
    const cover =
      item.cover_image_url ||
      (pool.length > 0 ? pool[idx % pool.length]?.public_url : undefined) ||
      "";
    if (cover) allUrls.push(cover);

    // gallery images (중복 제거)
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
          date: item.date,
          isCover: i === 0,
        }))
      : [{ url: "", slug: item.slug, title: item.title, category: item.category, date: item.date, isCover: true }];
  });

  return (
    <>
      <SeoHead
        title="History — THE LIT | 더릿을 채운 이야기들"
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
            <p className="eyebrow text-white/40 mb-4">History</p>
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
            <div className="grid grid-cols-2 lg:grid-cols-3 auto-rows-[220px] gap-3 lg:gap-4">
              {tiles.map((tile, i) => {
                // 7타일 반복 패턴: 0번·4번은 tall(2행), 나머지는 normal(1행)
                const isTall = i % 7 === 0 || i % 7 === 4;
                return (
                  <AnimatedSection
                    key={`${tile.slug}-${i}`}
                    animation="fade-up"
                    delay={i * 40}
                    className={isTall ? "row-span-2" : ""}
                  >
                    <Link
                      to={`/archive/${tile.slug}`}
                      className="group block relative overflow-hidden h-full bg-brand-warm"
                    >
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                      {tile.isCover && (
                        <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <p className="font-sans text-[10px] tracking-widest uppercase text-white/60 mb-1">
                            {tile.date?.substring(0, 7)} ·{" "}
                            {
                              CATEGORIES.find((c) => c.value === tile.category)
                                ?.label
                            }
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
                );
              })}
            </div>
        </div>
      </section>
    </>
  );
}
