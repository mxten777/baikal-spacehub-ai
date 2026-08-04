import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Maximize2 } from "lucide-react";
import { useSpaces, usePublicPhotos } from "../hooks/useData";
import AnimatedSection from "../components/common/AnimatedSection";
import type { SpaceCategory, Space } from "../types";
import SeoHead from "../components/common/SeoHead";
import { SITE_URL, breadcrumbJsonLd } from "../lib/seo";

const CATEGORY_LABELS: Record<SpaceCategory | "all", string> = {
  all: "전체",
  cafe: "카페",
  garden: "가든",
  studio: "스튜디오",
  storage: "스토리지",
  hall: "홀",
  other: "기타",
};

const FALLBACK_SPACES = [
  {
    id: "1",
    slug: "cafe",
    name: "카페",
    name_en: "Cafe",
    category: "cafe" as SpaceCategory,
    short_description:
      "빛이 가장 따뜻하게 머무는 공간. 낭독회·소셜 나이트·팝업 마켓·브랜드 쇼룸.",
    capacity: 50,
    size_sqm: 85,
    is_available: true,
    features: ["자연 채광", "커피 바", "빔 프로젝터", "음향 시스템"],
    cover_image_url: null,
  },
  {
    id: "2",
    slug: "garden",
    name: "가든",
    name_en: "Garden",
    category: "garden" as SpaceCategory,
    short_description:
      "어둠의 통로를 지나 처음 빛을 만나는 순간. 웨딩·가든 파티·야외 공연.",
    capacity: 120,
    size_sqm: 200,
    is_available: true,
    features: ["야외 테라스", "조명 시설", "음향 시스템", "주차 가능"],
    cover_image_url: null,
  },
  {
    id: "3",
    slug: "studio",
    name: "스튜디오",
    name_en: "Studio",
    category: "studio" as SpaceCategory,
    short_description:
      "사이클로라마 너머 자연광이 쏟아지는 흰 공간. 뮤직비디오·화보·CF·공연.",
    capacity: 30,
    size_sqm: 65,
    is_available: true,
    features: ["사이클로라마", "전문 조명", "분장실", "드레스룸"],
    cover_image_url: null,
  },
  {
    id: "4",
    slug: "storage",
    name: "스토리지",
    name_en: "Storage Hall",
    category: "storage" as SpaceCategory,
    short_description:
      "5.5m 천장의 완전히 열린 공간. 브랜드 이벤트·전시·컨퍼런스·갤라 디너.",
    capacity: 150,
    size_sqm: 280,
    is_available: true,
    features: ["오픈 플로어", "높은 천장", "전시 벽면", "케이터링 준비실"],
    cover_image_url: null,
  },
];

export default function SpacesPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { data: spaces } = useSpaces(
    activeCategory !== "all" ? { category: activeCategory } : undefined,
  );
  const displaySpaces = spaces && spaces.length > 0 ? spaces : FALLBACK_SPACES;

  // 자산관리 시스템의 web 단계 사진을 공간 카테고리별로 매핑
  const { data: spacePhotos } = usePublicPhotos("space");
  const spacePhotoMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of spacePhotos ?? []) {
      if (p.space_category && p.public_url && !map[p.space_category]) {
        map[p.space_category] = p.public_url;
      }
    }
    return map;
  }, [spacePhotos]);

  const categories = ["all", "cafe", "garden", "studio", "storage"] as const;

  return (
    <>
      <SeoHead
        title="Spaces — THE LIT | 경험으로 만나는 다섯 개의 공간"
        description="카페·정원·스튜디오·홀·루프탑. THE LIT의 다섯 공간은 각기 다른 경험을 선사합니다. 촬영·웨딩·브랜드 행사·소규모 모임에 최적."
        canonical={`${SITE_URL}/spaces`}
        keywords="공간 대여, 카페 대여, 스튜디오 대여, 가든 대여, 더릿 공간, 행사 공간 서울"
        jsonLd={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Spaces", url: `${SITE_URL}/spaces` },
        ])}
      />

      {/* Page Hero */}
      <section className="pt-32 pb-16 bg-brand-black">
        <div className="container-wide">
          <AnimatedSection animation="fade-up">
            <p className="eyebrow text-white/40 mb-4">Our Spaces</p>
            <h1 className="font-display text-display font-light text-white mb-6">
              공간을 대관하다
            </h1>
            <p className="font-sans text-base text-white/60 max-w-xl">
              더릿의 각 공간은 독자적인 분위기와 기능을 갖춘 프리미엄 문화
              공간입니다. 카페, 가든, 스튜디오, 스토리지 — 당신의 이야기에 맞는
              공간을 선택하세요.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Category filters */}
      <div className="sticky top-16 lg:top-20 z-20 bg-brand-white border-b border-brand-border">
        <div className="container-wide py-3.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-5 py-2 font-sans text-xs font-medium tracking-widest uppercase transition-all duration-300
                ${
                  activeCategory === cat
                    ? "bg-brand-black text-white"
                    : "text-brand-subtle hover:text-brand-black"
                }`}
            >
              {CATEGORY_LABELS[cat as SpaceCategory | "all"]}
            </button>
          ))}
        </div>
      </div>

      {/* Spaces grid */}
      <section className="section-padding bg-brand-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {displaySpaces.map((space, i) => (
                <AnimatedSection
                  key={space.id}
                  animation="fade-up"
                  delay={i * 80}
                >
                  <Link to={`/spaces/${space.slug}`} className="group block">
                    <div className="relative overflow-hidden aspect-[16/9]">
                      {/* 실사진: 업로드된 경우 표시 */}
                      {space.cover_image_url ? (
                        <img
                          src={space.cover_image_url}
                          alt={space.name}
                          aria-hidden="true"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-brand-warm flex items-center justify-center">
                          <span className="font-display text-brand-muted/30 tracking-widest text-sm uppercase">
                            이미지 준비 중
                          </span>
                        </div>
                      )}
                      {/* 업로드 사진: 로드 완료 후 fade in */}
                      {spacePhotoMap[space.category] && (
                        <img
                          src={spacePhotoMap[space.category]}
                          alt={space.name}
                          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-[opacity,transform] duration-700 group-hover:scale-105"
                          onLoad={(e) =>
                            (
                              e.currentTarget as HTMLImageElement
                            ).classList.remove("opacity-0")
                          }
                          loading="lazy"
                        />
                      )}
                      {!space.is_available && (
                        <div className="absolute top-4 right-4 z-10 bg-black/80 text-white text-xs px-3 py-1 font-sans tracking-wider">
                          예약 불가
                        </div>
                      )}
                    </div>
                    {/* 추가 이미지 썸네일 */}
                    {((space as Space).images?.length ?? 0) > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {(space as Space)
                          .images!.slice(0, 4)
                          .map((imgUrl: string, i: number) => (
                            <div
                              key={i}
                              className="flex-1 overflow-hidden"
                              style={{ height: "52px" }}
                            >
                              <img
                                src={imgUrl}
                                alt=""
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                              />
                            </div>
                          ))}
                      </div>
                    )}
                    <div className="pt-7 pb-2">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-brand-subtle mb-1.5">
                            {space.name_en}
                          </p>
                          <h2
                            className="font-display text-[1.75rem] font-light text-brand-black"
                            style={{ letterSpacing: "-0.02em" }}
                          >
                            {space.name}
                          </h2>
                        </div>
                        <div className="flex items-center gap-4 text-[12px] text-brand-subtle mt-1">
                          <span className="flex items-center gap-1.5">
                            <Users size={12} /> {space.capacity}명
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Maximize2 size={12} /> {space.size_sqm}㎡
                          </span>
                        </div>
                      </div>
                      <p className="font-sans text-[14px] text-brand-muted mb-5 leading-relaxed">
                        {space.short_description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {(space.features ?? []).slice(0, 4).map((f) => (
                          <span key={f} className="tag-outline">
                            {f}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 font-sans text-[11px] tracking-[0.16em] uppercase text-brand-black group-hover:text-brand-accent transition-colors duration-300">
                        공간 상세 보기{" "}
                        <ArrowRight
                          size={13}
                          className="group-hover:translate-x-1 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>

        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-cream text-center">
        <div className="container-narrow">
          <h2 className="font-display text-headline font-light text-brand-black mb-4">
            원하는 공간이 없으신가요?
          </h2>
          <p className="font-sans text-sm text-brand-muted mb-8">
            맞춤형 공간 구성과 특별 요청 사항은 문의 주세요.
          </p>
          <Link to="/reservation" className="btn-primary">
            대관 문의 <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
