import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Users, Maximize2 } from "lucide-react";
import { useSpaces, usePublicPhotos } from "../hooks/useData";
import AnimatedSection from "../components/common/AnimatedSection";
import LoadingSpinner from "../components/common/LoadingSpinner";
import type { SpaceCategory, Space } from "../types";

const CATEGORY_LABELS: Record<SpaceCategory | "all", string> = {
  all: "전체",
  cafe: "카페",
  garden: "가든",
  studio: "스튜디오",
  storage: "스토리지",
  hall: "홀",
  other: "기타",
};

const SPACE_IMAGES: Record<string, string> = {
  cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900&q=80",
  garden:
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&q=80",
  studio:
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=900&q=80",
  storage:
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=900&q=80",
  hall: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&q=80",
  other:
    "https://images.unsplash.com/photo-1541516160071-4bb0c5af65ba?w=900&q=80",
};

const FALLBACK_SPACES = [
  {
    id: "1",
    slug: "cafe",
    name: "카페",
    name_en: "Cafe",
    category: "cafe" as SpaceCategory,
    short_description:
      "따뜻한 분위기의 문화 카페 공간. 소규모 모임, 낭독회, 소셜 이벤트에 적합합니다.",
    capacity: 50,
    size_sqm: 85,
    is_available: true,
    features: ["자연 채광", "커피 바", "빔 프로젝터", "음향 시스템"],
    cover_image_url: SPACE_IMAGES.cafe,
  },
  {
    id: "2",
    slug: "garden",
    name: "가든",
    name_en: "Garden",
    category: "garden" as SpaceCategory,
    short_description:
      "자연과 어우러진 야외 정원 공간. 웨딩, 파티, 야외 공연에 최적입니다.",
    capacity: 120,
    size_sqm: 200,
    is_available: true,
    features: ["야외 테라스", "조명 시설", "음향 시스템", "주차 가능"],
    cover_image_url: SPACE_IMAGES.garden,
  },
  {
    id: "3",
    slug: "studio",
    name: "스튜디오",
    name_en: "Studio",
    category: "studio" as SpaceCategory,
    short_description:
      "전문 촬영 및 공연을 위한 화이트 스튜디오. 광고, 화보, 소규모 공연에 적합.",
    capacity: 30,
    size_sqm: 65,
    is_available: true,
    features: ["사이클로라마", "전문 조명", "분장실", "드레스룸"],
    cover_image_url: SPACE_IMAGES.studio,
  },
  {
    id: "4",
    slug: "storage",
    name: "스토리지",
    name_en: "Storage Hall",
    category: "storage" as SpaceCategory,
    short_description:
      "대형 행사와 전시를 위한 다목적 홀. 오픈 플로어 플랜으로 자유로운 공간 활용 가능.",
    capacity: 150,
    size_sqm: 280,
    is_available: true,
    features: ["오픈 플로어", "높은 천장", "전시 벽면", "케이터링 준비실"],
    cover_image_url: SPACE_IMAGES.storage,
  },
];

export default function SpacesPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { data: spaces, isLoading } = useSpaces(
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
      <Helmet>
        <title>Spaces — The Lit</title>
        <meta
          name="description"
          content="더릿의 다양한 공간을 살펴보세요. 카페, 가든, 스튜디오, 스토리지 — 모든 문화 활동을 위한 프리미엄 공간 대관."
        />
      </Helmet>

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
              className={`shrink-0 px-5 py-2.5 font-sans text-[10.5px] font-medium tracking-[0.16em] uppercase transition-all duration-300
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
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {displaySpaces.map((space, i) => (
                <AnimatedSection
                  key={space.id}
                  animation="fade-up"
                  delay={i * 80}
                >
                  <Link to={`/spaces/${space.slug}`} className="group block">
                    <div className="relative overflow-hidden aspect-[16/9]">
                      {/* 폴백: 즉시 표시 */}
                      <img
                        src={
                          space.cover_image_url ||
                          SPACE_IMAGES[space.category] ||
                          SPACE_IMAGES.studio
                        }
                        alt={space.name}
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
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
          )}
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
            대관 문의하기 <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
