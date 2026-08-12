import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useSpaces, useArchive, usePublicPhotos } from "../hooks/useData";
import AnimatedSection from "../components/common/AnimatedSection";
import SectionHeader from "../components/common/SectionHeader";
import SeoHead from "../components/common/SeoHead";
import { SITE_URL, breadcrumbJsonLd } from "../lib/seo";

// ── Static image fallbacks by space slug ─────────────────────────────────────
const SPACE_IMAGE_FALLBACK: Record<string, string> = {
  studio:  "/images/mbox/Way/Way-01.jpg",
  storage: "/images/mbox/Storage1/Storage1-01.jpg",
  garden:  "/images/mbox/Garden/Garden-01.jpg",
  cafe:    "/images/mbox/Cafe/Cafe-02.jpg",
};

const VENUE_SPACE_SLUGS = ["studio", "storage", "garden"] as const;

// ── Minimal space shape used in this page ────────────────────────────────────
interface VenueSpaceItem {
  id: string;
  slug: string;
  name: string;
  name_en: string;
  short_description: string;
  cover_image_url: string | null;
}

const VENUE_SPACE_FALLBACK: VenueSpaceItem[] = [
  {
    id: "studio",
    slug: "studio",
    name: "스튜디오",
    name_en: "Studio",
    short_description:
      "사이클로라마 너머 자연광이 쏟아지는 흰 공간. 뮤직비디오·화보·CF·공연.",
    cover_image_url: null,
  },
  {
    id: "storage",
    slug: "storage",
    name: "스토리지",
    name_en: "Storage Hall",
    short_description:
      "5.5m 천장의 완전히 열린 공간. 브랜드 이벤트·전시·컨퍼런스·갤라 디너.",
    cover_image_url: null,
  },
  {
    id: "garden",
    slug: "garden",
    name: "가든",
    name_en: "Garden",
    short_description:
      "어둠의 통로를 지나 처음 빛을 만나는 순간. 웨딩·가든 파티·야외 공연.",
    cover_image_url: null,
  },
];

// ── Creative use-case categories (static copy) ───────────────────────────────
const CREATIVE_CATEGORIES = [
  {
    eyebrow: "K-Pop & Production",
    title: "촬영 & 콘텐츠",
    items: ["Music Video", "Broadcast", "Entertainment", "Commercial Shooting"],
  },
  {
    eyebrow: "Brand & Launch",
    title: "브랜드 행사",
    items: ["Brand Launch", "Showcase", "Campaign", "Private Brand Event"],
  },
  {
    eyebrow: "MICE & Corporate",
    title: "기업 행사",
    items: [
      "Corporate Event",
      "Conference",
      "Presentation",
      "Networking / Reception",
    ],
  },
] as const;

// ── Archive fallback (generic, no invented brand names) ──────────────────────
const ARCHIVE_FALLBACK = [
  {
    id: "f1",
    slug: "kpop-shoot-2025",
    title: "K-POP 아티스트 촬영",
    category: "K-POP",
    cover_image_url: null as string | null,
  },
  {
    id: "f2",
    slug: "drama-shoot-2025",
    title: "드라마 촬영 현장",
    category: "Drama",
    cover_image_url: null as string | null,
  },
  {
    id: "f3",
    slug: "brand-event-2025",
    title: "글로벌 브랜드 런칭 행사",
    category: "Brand Event",
    cover_image_url: null as string | null,
  },
  {
    id: "f4",
    slug: "corporate-event-2025",
    title: "기업 신제품 런칭",
    category: "기업행사",
    cover_image_url: null as string | null,
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function VenuePage() {
  const { data: spacesData } = useSpaces();
  const { data: archiveData } = useArchive({ limit: 4 });
  const { data: archivePhotos } = usePublicPhotos("archive", { limit: 8 });

  // ── Venue-relevant spaces ─────────────────────────────────────────────────
  const venueSpaces = useMemo((): VenueSpaceItem[] => {
    const all = spacesData ?? [];
    const relevant = all.filter((s) =>
      (VENUE_SPACE_SLUGS as readonly string[]).includes(s.slug),
    );
    if (relevant.length >= 2) {
      return relevant.map((s) => ({
        id: s.id,
        slug: s.slug,
        name: s.name,
        name_en: s.name_en ?? s.name,
        short_description: s.short_description ?? "",
        cover_image_url: s.cover_image_url ?? null,
      }));
    }
    return VENUE_SPACE_FALLBACK;
  }, [spacesData]);

  // ── Archive items ─────────────────────────────────────────────────────────
  const photoPool = useMemo(
    () => (archivePhotos ?? []).filter((p) => p.public_url),
    [archivePhotos],
  );

  const archiveItems =
    archiveData && archiveData.length > 0
      ? archiveData.slice(0, 4).map((item) => ({
          id: item.id,
          slug: item.slug,
          title: item.title,
          category: item.category,
          cover_image_url: item.cover_image_url ?? null,
        }))
      : ARCHIVE_FALLBACK;

  const getCoverImg = (url: string | null, idx: number): string => {
    if (url) return url;
    return photoPool[idx % photoPool.length]?.public_url ?? "";
  };

  return (
    <>
      <SeoHead
        title="K-Culture & Event Venue — THE LIT"
        description="K-Pop 뮤직비디오, 방송, 글로벌 브랜드 런칭, MICE 기업행사까지. THE LIT은 창의적인 기획자들의 비전이 현실이 되는 2,000여 평의 Premium Creative Venue입니다."
        canonical={`${SITE_URL}/venue`}
        keywords="K-Pop 촬영, 뮤직비디오 촬영, 브랜드 행사 공간, 기업행사 공간, MICE 서울, 방송 촬영 공간, 더릿 이벤트 공간"
        jsonLd={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "K-Culture & Event Venue", url: `${SITE_URL}/venue` },
        ])}
      />

      {/* ── SECTION 1 · Hero ──────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-end pb-20 lg:pb-32 overflow-hidden bg-brand-black">
        {/* Background */}
        <img
          src="/images/hero/Storage1-03.jpg"
          alt="THE LIT — K-Culture & Event Venue"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

        <div className="relative container-wide">
          <AnimatedSection animation="fade-up">
            <p
              className="font-sans text-[10px] font-medium tracking-[0.28em] uppercase text-white/45 mb-7"
            >
              K-CULTURE &amp; EVENT VENUE
            </p>
            <h1
              className="font-display font-light text-white mb-5"
              style={{
                fontSize: "clamp(2.8rem, 6vw, 6rem)",
                lineHeight: 1.04,
                letterSpacing: "-0.03em",
              }}
            >
              글로벌 트렌드가<br />
              시작되는 무대
            </h1>
            <p
              className="font-display font-light text-white/45 mb-9"
              style={{
                fontSize: "clamp(1.05rem, 1.8vw, 1.5rem)",
                letterSpacing: "-0.01em",
              }}
            >
              The Stage for Creators
            </p>
            <p className="font-sans text-[13px] text-white/55 max-w-[480px] leading-[1.8] mb-10">
              K-Pop 뮤직비디오 및 예능부터 글로벌 브랜드 런칭쇼,
              하이엔드 MICE 기업 행사까지.
              <br />
              THE LIT은 창의적인 기획자들의 비전이 현실이 되는
              2,000여 평의 유연하고 감각적인 공간을 제안합니다.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 border border-white text-white font-sans text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-white hover:text-brand-black transition-all duration-300"
            >
              Venue Inquiry <ArrowRight size={12} />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* ── SECTION 2 · Creative Possibilities ───────────────────────────── */}
      <section className="section-padding bg-brand-white">
        <div className="container-wide">
          <AnimatedSection animation="fade-up" className="mb-14 lg:mb-20">
            <SectionHeader
              eyebrow="Creative Possibilities"
              title="THE LIT에서 가능한 것들"
            />
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-brand-border border-t border-brand-border">
            {CREATIVE_CATEGORIES.map((cat, i) => (
              <AnimatedSection
                key={cat.eyebrow}
                animation="fade-up"
                delay={i * 90}
                className="py-10 md:py-14 md:px-10 first:md:pl-0 last:md:pr-0"
              >
                <p className="eyebrow mb-4">{cat.eyebrow}</p>
                <h3
                  className="font-display font-light text-brand-black mb-8"
                  style={{
                    fontSize: "clamp(1.5rem, 2.2vw, 2rem)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {cat.title}
                </h3>
                <ul className="space-y-3">
                  {cat.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 font-sans text-[13px] text-brand-muted tracking-wide"
                    >
                      <span className="w-4 h-px bg-brand-muted/40 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3 · Space as a Canvas ────────────────────────────────── */}
      <section className="section-padding bg-brand-cream">
        <div className="container-wide">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 lg:mb-16">
            <SectionHeader
              eyebrow="Space as a Canvas"
              title="A Space Without Limits"
              subtitle="기획자의 아이디어에 따라 공간의 역할이 달라집니다."
            />
            <Link
              to="/spaces"
              className="shrink-0 inline-flex items-center gap-2 font-sans text-[11px] font-medium tracking-[0.18em] uppercase text-brand-black hover:text-brand-accent transition-colors duration-200"
            >
              All Spaces <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {venueSpaces.map((space, i) => (
              <AnimatedSection
                key={space.id}
                animation="fade-up"
                delay={i * 80}
              >
                <Link to={`/spaces/${space.slug}`} className="group block">
                  {/* Image */}
                  <div className="relative overflow-hidden aspect-[3/4]">
                    {space.cover_image_url || SPACE_IMAGE_FALLBACK[space.slug] ? (
                      <img
                        src={
                          space.cover_image_url ||
                          SPACE_IMAGE_FALLBACK[space.slug]
                        }
                        alt={space.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-brand-warm flex items-center justify-center">
                        <span className="font-display text-brand-muted/20 tracking-widest text-xs uppercase">
                          {space.name_en}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <p className="absolute bottom-5 left-5 font-display text-lg font-light text-white tracking-wide">
                      {space.name_en}
                    </p>
                  </div>

                  {/* Caption */}
                  <div className="pt-4">
                    <p className="font-sans text-[13px] text-brand-muted leading-relaxed line-clamp-2">
                      {space.short_description}
                    </p>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4 · Created at THE LIT ───────────────────────────────── */}
      <section className="section-padding bg-brand-white">
        <div className="container-wide">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 lg:mb-16">
            <SectionHeader
              eyebrow="Portfolio"
              title="Created at THE LIT"
              subtitle="THE LIT에서 실현된 프로젝트들."
            />
            <Link
              to="/archive"
              className="shrink-0 inline-flex items-center gap-2 font-sans text-[11px] font-medium tracking-[0.18em] uppercase text-brand-black hover:text-brand-accent transition-colors duration-200"
            >
              View Portfolio <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {archiveItems.map((item, i) => (
              <AnimatedSection
                key={item.id}
                animation="fade-up"
                delay={i * 60}
              >
                <Link to={`/archive/${item.slug}`} className="group block">
                  <div className="relative overflow-hidden aspect-[3/4]">
                    {getCoverImg(item.cover_image_url, i) ? (
                      <img
                        src={getCoverImg(item.cover_image_url, i)}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="w-full h-full bg-brand-warm flex items-center justify-center">
                        <span className="font-display text-brand-muted/20 tracking-widest text-[10px] uppercase text-center px-2">
                          {item.category}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="pt-3.5">
                    <p className="eyebrow mb-1">{item.category}</p>
                    <h3 className="font-display text-[15px] font-light text-brand-black group-hover:text-brand-accent transition-colors duration-200 line-clamp-2">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5 · Contact CTA ───────────────────────────────────────── */}
      <section className="bg-brand-black py-28 lg:py-40">
        <div className="container-wide">
          <AnimatedSection animation="fade-up" className="max-w-2xl">
            <p className="font-sans text-[10px] font-medium tracking-[0.28em] uppercase text-white/35 mb-7">
              Contact
            </p>
            <h2
              className="font-display font-light text-white mb-7"
              style={{
                fontSize: "clamp(2.2rem, 4.5vw, 4rem)",
                letterSpacing: "-0.03em",
                lineHeight: 1.06,
              }}
            >
              Bring Your Vision<br />
              to THE LIT
            </h2>
            <p className="font-sans text-[13px] text-white/50 leading-[1.85] mb-10 max-w-sm">
              촬영, 브랜드 이벤트, 기업행사 등 프로젝트에 맞는
              공간 활용을 상담해 보세요.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2.5 px-10 py-4 bg-white text-brand-black font-sans text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-brand-cream transition-colors duration-300"
            >
              Venue Inquiry <ArrowRight size={12} />
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
