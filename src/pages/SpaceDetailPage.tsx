import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useSpace } from "../hooks/useData";
import AnimatedSection from "../components/common/AnimatedSection";
import LoadingSpinner from "../components/common/LoadingSpinner";

const SPACE_IMAGES: Record<string, string[]> = {
  cafe: [
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80",
    "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&q=80",
  ],
  garden: [
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80",
    "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=600&q=80",
  ],
  studio: [
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80",
    "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600&q=80",
  ],
  storage: [
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&q=80",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80",
  ],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FALLBACK_MAP: Record<string, any> = {
  cafe: {
    id: "1",
    slug: "cafe",
    name: "카페",
    name_en: "Cafe",
    category: "cafe",
    capacity: 50,
    size_sqm: 85,
    description:
      "더릿 카페는 따뜻한 분위기 속에서 문화와 사람이 만나는 공간입니다. 커피 향이 가득한 이 공간에서 낭독회부터 소규모 토크쇼, 프라이빗 파티까지 다양한 이벤트를 열 수 있습니다. 통유리 창으로 들어오는 자연광과 정성스럽게 꾸며진 인테리어가 특별한 분위기를 만들어냅니다.",
    features: [
      "자연 채광",
      "커피 바",
      "빔 프로젝터",
      "음향 시스템",
      "화이트보드",
      "냉난방",
    ],
    recommended_use: [
      "소규모 모임",
      "낭독회",
      "프라이빗 파티",
      "토크쇼",
      "팝업스토어",
    ],
    is_available: true,
    rental_price_per_hour: 150000,
  },
  garden: {
    id: "2",
    slug: "garden",
    name: "가든",
    name_en: "Garden",
    category: "garden",
    capacity: 120,
    size_sqm: 200,
    description:
      "더릿 가든은 도심 속 특별한 야외 정원입니다. 계절마다 다른 식물과 조명으로 연출되는 이 공간은 웨딩 리셉션, 야외 파티, 브랜드 팝업 등에 적합합니다. 쾌적한 야외 환경과 함께 전문 음향 장비와 조명 시스템이 갖춰져 있어 다양한 행사를 완벽하게 진행할 수 있습니다.",
    features: [
      "야외 테라스",
      "조명 시스템",
      "음향 시스템",
      "주차 가능",
      "케이터링 서비스",
      "발전기 보유",
    ],
    recommended_use: [
      "웨딩 리셉션",
      "야외 파티",
      "브랜드 팝업",
      "야외 공연",
      "가든 파티",
    ],
    is_available: true,
    rental_price_per_hour: 300000,
  },
  studio: {
    id: "3",
    slug: "studio",
    name: "스튜디오",
    name_en: "Studio",
    category: "studio",
    capacity: 30,
    size_sqm: 65,
    description:
      "더릿 스튜디오는 광고, 영화, 화보 촬영을 위한 전문 스튜디오입니다. 무한대의 화이트 배경을 제공하는 사이클로라마와 전문 조명 장비가 갖춰져 있어 다양한 비주얼 작업에 최적입니다. 분장실과 드레스룸을 별도로 운영하여 프로페셔널한 촬영 환경을 제공합니다.",
    features: [
      "사이클로라마",
      "전문 조명",
      "분장실",
      "드레스룸",
      "모니터 시스템",
      "음향 부스",
    ],
    recommended_use: [
      "광고 촬영",
      "뮤직비디오",
      "화보 촬영",
      "소규모 공연",
      "라이브 스트리밍",
    ],
    is_available: true,
    rental_price_per_hour: 200000,
  },
  storage: {
    id: "4",
    slug: "storage",
    name: "스토리지",
    name_en: "Storage Hall",
    category: "storage",
    capacity: 150,
    size_sqm: 280,
    description:
      "더릿 스토리지는 대형 행사와 전시를 위한 넓은 다목적 홀입니다. 5.5m의 높은 천장과 오픈 플로어 플랜으로 공간을 자유롭게 구성할 수 있습니다. 전시 벽면과 전문 조명 레일이 설치되어 있어 전시, 컨퍼런스, 대형 브랜드 이벤트에 이상적입니다.",
    features: [
      "오픈 플로어",
      "5.5m 높은 천장",
      "전시 벽면",
      "케이터링 준비실",
      "물품 보관실",
      "장애인 접근 가능",
    ],
    recommended_use: [
      "대형 전시",
      "컨퍼런스",
      "브랜드 런칭",
      "갤라 디너",
      "페어 & 마켓",
    ],
    is_available: true,
    rental_price_per_hour: 400000,
  },
};

export default function SpaceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: space, isLoading } = useSpace(slug ?? "");
  const displaySpace = space ?? FALLBACK_MAP[slug ?? ""];

  if (isLoading) return <LoadingSpinner />;
  if (!displaySpace)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-2xl text-brand-muted mb-4">
            공간을 찾을 수 없습니다
          </p>
          <Link to="/spaces" className="btn-secondary">
            ← 공간 목록으로
          </Link>
        </div>
      </div>
    );

  const images =
    displaySpace.images ||
    SPACE_IMAGES[displaySpace.category] ||
    Object.values(SPACE_IMAGES)[0];

  return (
    <>
      <Helmet>
        <title>{displaySpace.name} — The Lit</title>
        <meta
          name="description"
          content={displaySpace.description?.substring(0, 160)}
        />
      </Helmet>

      {/* Hero image */}
      <div className="relative h-[70vh] min-h-[500px]">
        <img
          src={images[0] || displaySpace.cover_image_url}
          alt={displaySpace.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-overlay-center" />
        <div className="absolute bottom-0 left-0 right-0 container-wide pb-12">
          <p className="eyebrow text-white/60 mb-2">{displaySpace.name_en}</p>
          <h1 className="font-display text-[clamp(2.5rem,6vw,5rem)] font-light text-white">
            {displaySpace.name}
          </h1>
        </div>
        <Link
          to="/spaces"
          className="absolute top-24 left-4 sm:left-8 lg:left-16 flex items-center gap-2 text-white/70 hover:text-white text-sm font-sans transition-colors"
        >
          <ArrowLeft size={16} /> Spaces
        </Link>
      </div>

      {/* Content */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
            {/* Main */}
            <div className="lg:col-span-2">
              <AnimatedSection animation="fade-up">
                <p className="font-sans text-base text-brand-muted leading-relaxed mb-8">
                  {displaySpace.description}
                </p>
              </AnimatedSection>

              {/* Gallery */}
              {images.length > 1 && (
                <AnimatedSection animation="fade-up" delay={100}>
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {images.slice(1, 5).map((img: string, i: number) => (
                      <img
                        key={i}
                        src={img}
                        alt={`${displaySpace.name} ${i + 2}`}
                        className="aspect-[4/3] object-cover w-full"
                        loading="lazy"
                      />
                    ))}
                  </div>
                </AnimatedSection>
              )}

              {/* Recommended use */}
              {displaySpace.recommended_use?.length > 0 && (
                <AnimatedSection animation="fade-up" delay={150}>
                  <h3 className="font-display text-xl font-light text-brand-black mb-4">
                    추천 사용 용도
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {displaySpace.recommended_use.map((use: string) => (
                      <span key={use} className="tag-accent">
                        {use}
                      </span>
                    ))}
                  </div>
                </AnimatedSection>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <AnimatedSection animation="fade-up" delay={200}>
                <div className="sticky top-16 sm:top-24 space-y-6">
                  {/* Space info card */}
                  <div className="bg-brand-cream p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="eyebrow mb-1">수용 인원</p>
                        <p className="font-display text-2xl font-light">
                          {displaySpace.capacity}
                          <span className="text-base font-sans text-brand-muted ml-1">
                            명
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="eyebrow mb-1">면적</p>
                        <p className="font-display text-2xl font-light">
                          {displaySpace.size_sqm}
                          <span className="text-base font-sans text-brand-muted ml-1">
                            ㎡
                          </span>
                        </p>
                      </div>
                    </div>
                    {displaySpace.rental_price_per_hour && (
                      <div className="border-t border-brand-border pt-4 mb-4">
                        <p className="eyebrow mb-1">대관료</p>
                        <p className="font-display text-2xl font-light">
                          {displaySpace.rental_price_per_hour.toLocaleString()}
                          <span className="text-sm font-sans text-brand-muted ml-1">
                            원/시간
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  {displaySpace.features?.length > 0 && (
                    <div>
                      <h3 className="font-display text-lg font-light mb-3">
                        시설 & 장비
                      </h3>
                      <ul className="space-y-2">
                        {displaySpace.features.map((f: string) => (
                          <li
                            key={f}
                            className="flex items-center gap-2.5 text-sm text-brand-muted"
                          >
                            <CheckCircle2
                              size={14}
                              className="text-brand-accent shrink-0"
                            />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA */}
                  <Link
                    to={`/reservation?space=${displaySpace.id}`}
                    className="btn-primary w-full justify-center"
                  >
                    대관 문의 <ArrowRight size={16} />
                  </Link>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
