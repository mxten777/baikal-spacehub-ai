import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useSpaces, usePublicPhotos } from "../hooks/useData";
import AnimatedSection from "../components/common/AnimatedSection";
import SectionHeader from "../components/common/SectionHeader";
import SeoHead from "../components/common/SeoHead";
import { SITE_URL, breadcrumbJsonLd } from "../lib/seo";

// ── Static image fallbacks by space slug ─────────────────────────────────────
const SPACE_IMAGE_FALLBACK: Record<string, string> = {
  cafe:   "/images/mbox/Cafe/Cafe-02.jpg",
  garden: "/images/mbox/Garden/Garden-01.jpg",
};

const CAFE_GARDEN_SPACE_SLUGS = ["cafe", "garden"] as const;

interface CafeGardenSpaceItem {
  id: string;
  slug: string;
  name: string;
  name_en: string;
  short_description: string;
  cover_image_url: string | null;
  capacity: number;
  size_sqm: number;
}

const SPACE_FALLBACK: CafeGardenSpaceItem[] = [
  {
    id: "cafe",
    slug: "cafe",
    name: "카페",
    name_en: "Cafe",
    short_description: "빛이 가장 따뜻하게 머무는 공간. 낭독회·소셜 나이트·팝업 마켓·브랜드 쇼룸.",
    cover_image_url: null,
    capacity: 50,
    size_sqm: 85,
  },
  {
    id: "garden",
    slug: "garden",
    name: "가든",
    name_en: "Garden",
    short_description: "어둠의 통로를 지나 처음 빛을 만나는 순간. 웨딩·가든 파티·야외 공연.",
    cover_image_url: null,
    capacity: 120,
    size_sqm: 200,
  },
];

// ── Everyday Moments images (static local assets) ─────────────────────────────
const MOMENTS_IMAGES = [
  { src: "/images/mbox/Garden/Garden-02.jpg", alt: "정원의 빛" },
  { src: "/images/mbox/Cafe/Cafe-03.jpg",     alt: "카페 공간" },
  { src: "/images/mbox/Garden/Garden-03.jpg", alt: "정원 산책" },
  { src: "/images/mbox/Cafe/Cafe-04.jpg",     alt: "자연광 카페" },
  { src: "/images/mbox/Way/Way-02.jpg",       alt: "빛이 이어지는 통로" },
  { src: "/images/mbox/Etc/Etc-01.jpg",       alt: "THE LIT 일상" },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function CafeGardenPage() {
  const { data: spacesData } = useSpaces();
  const { data: spacePhotos } = usePublicPhotos("space");

  // ── Café & Garden space items ─────────────────────────────────────────────
  const cafeGardenSpaces = useMemo((): CafeGardenSpaceItem[] => {
    const all = spacesData ?? [];
    const relevant = all.filter((s) =>
      (CAFE_GARDEN_SPACE_SLUGS as readonly string[]).includes(s.slug),
    );
    if (relevant.length >= 1) {
      return relevant.map((s) => ({
        id: s.id,
        slug: s.slug,
        name: s.name,
        name_en: s.name_en ?? s.name,
        short_description: s.short_description ?? "",
        cover_image_url: s.cover_image_url ?? null,
        capacity: s.capacity ?? 0,
        size_sqm: s.size_sqm ?? 0,
      }));
    }
    return SPACE_FALLBACK;
  }, [spacesData]);

  // ── Space photo map (from asset management system) ────────────────────────
  const spacePhotoMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of spacePhotos ?? []) {
      if (p.space_category && p.public_url && !map[p.space_category]) {
        map[p.space_category] = p.public_url;
      }
    }
    return map;
  }, [spacePhotos]);

  const getSpaceImg = (slug: string, coverUrl: string | null): string => {
    return coverUrl || spacePhotoMap[slug] || SPACE_IMAGE_FALLBACK[slug] || "";
  };

  return (
    <>
      <SeoHead
        title="Café & Garden — THE LIT | 햇살이 머무는 정원에서의 여유"
        description="THE LIT의 정원과 카페에서 자연광과 공간을 일상으로 경험하세요. 하남 미사의 드넓은 정원과 빛이 스며드는 감각적인 카페 공간."
        canonical={`${SITE_URL}/cafe-garden`}
        keywords="더릿 카페, 더릿 정원, 하남 카페, 하남 정원, 더릿 방문, 자연 카페, 가든 카페, THE LIT cafe, THE LIT garden"
        jsonLd={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Café & Garden", url: `${SITE_URL}/cafe-garden` },
        ])}
      />

      {/* ── SECTION 1 · Hero ──────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-end pb-20 lg:pb-32 overflow-hidden bg-brand-black">
        <img
          src="/images/mbox/Garden/Garden-01.jpg"
          alt="THE LIT — Café & Garden"
          className="absolute inset-0 w-full h-full object-cover opacity-55"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5" />

        <div className="relative container-wide">
          <AnimatedSection animation="fade-up">
            <p className="font-sans text-[10px] font-medium tracking-[0.28em] uppercase text-white/45 mb-7">
              CAFÉ &amp; GARDEN
            </p>
            <h1
              className="font-display font-light text-white mb-5"
              style={{
                fontSize: "clamp(2.8rem, 6vw, 6rem)",
                lineHeight: 1.04,
                letterSpacing: "-0.03em",
              }}
            >
              햇살이 머무는<br />
              정원에서의 여유
            </h1>
            <p
              className="font-display font-light text-white/45 mb-9"
              style={{
                fontSize: "clamp(1rem, 1.8vw, 1.4rem)",
                letterSpacing: "-0.01em",
              }}
            >
              Sunlit Garden &amp; Café
            </p>
            <p className="font-sans text-[13px] text-white/55 max-w-[480px] leading-[1.85] mb-10">
              실내외의 경계를 허문 감각적인 공간에 따스한 자연광이 스며듭니다.
              <br />
              하남 미사의 드넓은 정원을 거닐고, THE LIT만의 공간과 자연을 경험해 보세요.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 border border-white text-white font-sans text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-white hover:text-brand-black transition-all duration-300"
            >
              Visit THE LIT <ArrowRight size={12} />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* ── SECTION 2 · Garden Experience ────────────────────────────────── */}
      <section className="section-padding bg-brand-white overflow-hidden">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            {/* Text */}
            <AnimatedSection animation="fade-up">
              <SectionHeader
                eyebrow="Garden Experience"
                title="A Garden Filled with Light"
                subtitle="자연광이 가득한 드넓은 정원. 어둠의 통로를 지나 빛과 만나는 순간부터 THE LIT의 경험이 시작됩니다."
              />
              <div className="mt-10 space-y-6">
                {[
                  { label: "자연광", desc: "계절마다 달라지는 자연광이 공간을 채웁니다." },
                  { label: "드넓은 정원", desc: "하남 미사의 넓은 야외 정원에서 산책과 휴식을 누리세요." },
                  { label: "실내와 실외의 연결", desc: "내부 공간과 정원이 자연스럽게 이어지는 감각적인 동선." },
                ].map((item) => (
                  <div key={item.label} className="flex gap-5">
                    <span className="mt-1 w-4 h-px bg-brand-muted/40 shrink-0 self-start translate-y-[7px]" />
                    <div>
                      <p className="font-sans text-[11px] font-medium tracking-[0.16em] uppercase text-brand-black mb-1">
                        {item.label}
                      </p>
                      <p className="font-sans text-[13px] text-brand-muted leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            {/* Images */}
            <AnimatedSection animation="slide-right" className="grid grid-cols-2 gap-2">
              <div className="overflow-hidden aspect-[3/4]">
                <img
                  src="/images/mbox/Garden/Garden-02.jpg"
                  alt="THE LIT 정원"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="overflow-hidden aspect-[3/4] mt-8">
                <img
                  src="/images/mbox/Garden/Garden-03.jpg"
                  alt="THE LIT 정원 산책"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── SECTION 3 · Café Experience ───────────────────────────────────── */}
      <section className="section-padding bg-brand-cream overflow-hidden">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            {/* Images — left on this section */}
            <AnimatedSection animation="slide-left" className="order-2 lg:order-1">
              <div className="relative">
                <div className="overflow-hidden aspect-[4/3]">
                  <img
                    src="/images/mbox/Cafe/Cafe-01.jpg"
                    alt="THE LIT 카페"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div
                  className="absolute -bottom-5 -right-5 overflow-hidden"
                  style={{ width: "48%", aspectRatio: "1 / 1" }}
                >
                  <img
                    src="/images/mbox/Cafe/Cafe-05.jpg"
                    alt="THE LIT 카페 내부"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            </AnimatedSection>

            {/* Text */}
            <AnimatedSection animation="fade-up" className="order-1 lg:order-2 lg:pl-8">
              <SectionHeader
                eyebrow="Café Experience"
                title="Café in the Garden"
                subtitle="THE LIT의 카페는 단순한 음료 공간이 아닙니다. 정원과 이어지는 따뜻한 공간에서 빛과 함께하는 일상을 경험하세요."
              />
              <p className="mt-7 font-sans text-[13px] text-brand-muted leading-[1.85]">
                자연광이 창을 통해 스며드는 카페에서 잠시 머물며,
                THE LIT이 선사하는 고요하고 감각적인 분위기를 느껴보세요.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── SECTION 4 · Spaces to Experience ────────────────────────────── */}
      <section className="section-padding bg-brand-white">
        <div className="container-wide">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 lg:mb-16">
            <SectionHeader
              eyebrow="Spaces"
              title="Explore THE LIT"
              subtitle="카페와 정원, 각 공간은 독자적인 분위기로 THE LIT만의 경험을 완성합니다."
            />
            <Link
              to="/spaces"
              className="shrink-0 inline-flex items-center gap-2 font-sans text-[11px] font-medium tracking-[0.18em] uppercase text-brand-black hover:text-brand-accent transition-colors duration-200"
            >
              All Spaces <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {cafeGardenSpaces.map((space, i) => (
              <AnimatedSection key={space.id} animation="fade-up" delay={i * 80}>
                <Link to={`/spaces/${space.slug}`} className="group block">
                  <div className="relative overflow-hidden aspect-[16/10]">
                    {getSpaceImg(space.slug, space.cover_image_url) ? (
                      <img
                        src={getSpaceImg(space.slug, space.cover_image_url)}
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                    <p className="absolute bottom-5 left-6 font-display text-xl font-light text-white tracking-wide">
                      {space.name_en}
                    </p>
                  </div>
                  <div className="pt-5 pb-2">
                    <p className="font-sans text-[13px] text-brand-muted leading-relaxed mb-4">
                      {space.short_description}
                    </p>
                    <div className="flex items-center gap-2 font-sans text-[11px] tracking-[0.16em] uppercase text-brand-black group-hover:text-brand-accent transition-colors duration-300">
                      공간 상세 보기{" "}
                      <ArrowRight
                        size={12}
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

      {/* ── SECTION 5 · Everyday Moments ─────────────────────────────────── */}
      <section className="section-padding bg-brand-cream">
        <div className="container-wide">
          <AnimatedSection animation="fade-up" className="mb-12 lg:mb-16">
            <SectionHeader
              eyebrow="Everyday Moments"
              title="빛과 정원이 있는 하루"
              subtitle="THE LIT에서 경험하는 자연, 빛, 그리고 공간의 순간들."
            />
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 lg:gap-3">
            {MOMENTS_IMAGES.map((img, i) => (
              <AnimatedSection key={img.src} animation="fade-up" delay={i * 60}>
                <div className="overflow-hidden aspect-square">
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6 · Visit CTA ─────────────────────────────────────────── */}
      <section className="bg-brand-black py-28 lg:py-40">
        <div className="container-wide">
          <AnimatedSection animation="fade-up" className="max-w-2xl">
            <p className="font-sans text-[10px] font-medium tracking-[0.28em] uppercase text-white/35 mb-7">
              Visit
            </p>
            <h2
              className="font-display font-light text-white mb-7"
              style={{
                fontSize: "clamp(2.2rem, 4.5vw, 4rem)",
                letterSpacing: "-0.03em",
                lineHeight: 1.06,
              }}
            >
              Experience THE LIT
            </h2>
            <p className="font-sans text-[13px] text-white/50 leading-[1.85] mb-10 max-w-sm">
              정원과 카페, 빛이 머무는 공간에서 THE LIT의 하루를 경험해 보세요.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2.5 px-10 py-4 bg-white text-brand-black font-sans text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-brand-cream transition-colors duration-300"
            >
              Visit THE LIT <ArrowRight size={12} />
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
