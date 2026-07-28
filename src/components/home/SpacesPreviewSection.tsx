import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useSpaces } from "../../hooks/useData";
import AnimatedSection from "../common/AnimatedSection";
import SectionHeader from "../common/SectionHeader";
import LoadingSpinner from "../common/LoadingSpinner";

const FALLBACK_SPACES = [
  {
    id: "1",
    slug: "cafe",
    name: "카페",
    name_en: "Cafe",
    category: "cafe",
    short_description: "따뜻한 분위기의 문화 카페 공간",
    capacity: 50,
  },
  {
    id: "2",
    slug: "garden",
    name: "가든",
    name_en: "Garden",
    category: "garden",
    short_description: "자연과 어우러진 야외 정원 공간",
    capacity: 80,
  },
  {
    id: "3",
    slug: "studio",
    name: "스튜디오",
    name_en: "Studio",
    category: "studio",
    short_description: "전문 촬영 및 공연을 위한 스튜디오",
    capacity: 30,
  },
  {
    id: "4",
    slug: "storage",
    name: "스토리지",
    name_en: "Storage",
    category: "storage",
    short_description: "다목적 전시 및 행사 공간",
    capacity: 100,
  },
];

export default function SpacesPreviewSection() {
  const { data: spaces, isLoading } = useSpaces();
  const displaySpaces = (
    spaces && spaces.length > 0
      ? spaces
      : (FALLBACK_SPACES as unknown as NonNullable<typeof spaces>)
  ).slice(0, 4);

  return (
    <section className="section-padding bg-brand-white">
      <div className="container-wide">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 lg:mb-16">
          <SectionHeader
            eyebrow="Our Spaces"
            title="공간을 경험하다"
            subtitle="카페, 가든, 스튜디오, 스토리지 — 각각의 공간은 독자적인 분위기와 기능을 갖춘 프리미엄 문화 공간입니다."
          />
          <Link
            to="/spaces"
            className="btn-ghost text-brand-black shrink-0 self-end mb-1"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {displaySpaces.map((space, i) => (
              <AnimatedSection
                key={space.id}
                animation="fade-up"
                delay={i * 80}
              >
                <Link
                  to={`/spaces/${space.slug}`}
                  className="group block overflow-hidden bg-brand-cream"
                >
                  <div className="relative overflow-hidden aspect-[3/4]">
                    {space.cover_image_url ? (
                      <img
                        src={space.cover_image_url}
                        alt={space.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-brand-warm flex items-center justify-center">
                        <span className="font-display text-brand-muted/30 tracking-widest text-xs uppercase">
                          이미지 준비 중
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-brand-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="font-sans text-[9px] tracking-[0.22em] uppercase text-white/50 mb-1.5">
                        {space.name_en}
                      </p>
                      <h3
                        className="font-display text-[1.35rem] font-light text-white"
                        style={{ letterSpacing: "-0.01em" }}
                      >
                        {space.name}
                      </h3>
                    </div>
                  </div>
                  <div className="p-5 border-b border-brand-border">
                    <p className="font-sans text-[13px] text-brand-muted leading-relaxed mb-3">
                      {space.short_description}
                    </p>
                    <p className="font-sans text-[11px] tracking-[0.12em] uppercase text-brand-accent">
                      최대 {space.capacity}명
                    </p>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
