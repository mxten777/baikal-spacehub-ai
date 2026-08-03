import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import {
  useSpaces,
  usePublicPhotos,
  useArchive,
  useBlogPosts,
} from "../hooks/useData";
import { useQuery } from "@tanstack/react-query";
import { aboutService } from "../services/about";
import { isSupabaseConfigured } from "../lib/supabase";
import AnimatedSection from "../components/common/AnimatedSection";
import SeoHead from "../components/common/SeoHead";
import { SITE_URL, breadcrumbJsonLd } from "../lib/seo";
import heroFallback from "../assets/images/hero/211014_iksundada-더릿_15267-f.jpg";

// ─── Gallery tabs ────────────────────────────────────────────────────────────
const GALLERY_TABS = [
  { value: "all", label: "전체" },
  { value: "ceremony", label: "세레모니" },
  { value: "reception", label: "리셉션" },
  { value: "garden", label: "가든" },
  { value: "indoor", label: "인도어" },
  { value: "night", label: "나이트" },
  { value: "detail", label: "디테일" },
] as const;
type GalleryTab = (typeof GALLERY_TABS)[number]["value"];

// ─── FAQ ─────────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: "웨딩 상담은 어떻게 진행되나요?",
    a: "온라인 문의 후 담당자가 1영업일 내에 연락드립니다. 방문 상담, 화상 상담 모두 가능합니다.",
  },
  {
    q: "최대 수용 인원은 몇 명인가요?",
    a: "공간 구성에 따라 가든 + 홀 통합 최대 200명까지 운영 가능합니다. 세부 레이아웃은 상담 시 확인해 드립니다.",
  },
  {
    q: "식음료(F&B)는 직접 섭외해야 하나요?",
    a: "파트너 케이터링 업체 연결을 도와드리며, 자체 섭외도 가능합니다.",
  },
  {
    q: "주차는 가능한가요?",
    a: "전용 주차장이 마련되어 있으며 좌석수 기준으로 주차 가이드를 제공합니다.",
  },
  {
    q: "촬영 팀 섭외도 THE LIT에서 진행하나요?",
    a: "공식 파트너 포토그래퍼 및 영상팀을 소개해 드릴 수 있습니다. 직접 섭외한 팀을 데려오시는 것도 가능합니다.",
  },
  {
    q: "웨딩 날짜 예약은 어떻게 진행되나요?",
    a: "상담 후 희망 날짜 홀딩(임시 예약)이 가능하며, 계약금 입금 시 날짜가 확정됩니다.",
  },
];

// ─── Venue fallback ───────────────────────────────────────────────────────────
const VENUE_FALLBACK = [
  {
    id: "garden",
    slug: "garden",
    name: "가든",
    name_en: "Garden",
    category: "garden" as const,
    short_description:
      "자연 채광이 가득한 야외 정원. 세레모니와 리셉션을 함께 아우르는 더릿의 핵심 공간입니다.",
    capacity: 120,
    cover_image_url: null as string | null,
    is_available: true,
  },
  {
    id: "hall",
    slug: "storage",
    name: "홀",
    name_en: "Hall",
    category: "hall" as const,
    short_description:
      "높은 천장과 넓은 오픈 플로어. 다양한 레이아웃으로 변환 가능한 다목적 홀입니다.",
    capacity: 150,
    cover_image_url: null as string | null,
    is_available: true,
  },
  {
    id: "studio",
    slug: "studio",
    name: "스튜디오",
    name_en: "Studio",
    category: "studio" as const,
    short_description:
      "전문 조명과 드레스룸이 갖춰진 촬영 전용 스튜디오. 화보와 비디오 제작에 최적화되어 있습니다.",
    capacity: 30,
    cover_image_url: null as string | null,
    is_available: true,
  },
];

// ─── 3-Track Wedding Experience ──────────────────────────────────────────────
interface WeddingTrack {
  number: string;
  track: string;
  keywords: string[];
  title: string;
  desc: string;
  recommended: string[];
  venue: string;
  cta_text?: string;
  cta_href?: string;
  is_visible?: boolean;
  sort_order?: number;
}

const WEDDING_TRACKS: WeddingTrack[] = [
  {
    number: "01",
    track: "House Wedding",
    keywords: ["Warm", "Intimate", "Private", "Home"],
    title: "집 앞마당에서",
    desc: "카페 본관과 잔디정원이 하나의 집처럼 연결됩니다. 가까운 사람들과 오래 기억할 수 있는 따뜻하고 프라이빗한 웨딩.",
    recommended: ["소규모 웨딩", "가족 중심 예식", "하우스 파티형", "브런치 웨딩"],
    venue: "카페 본관 + 잔디정원",
  },
  {
    number: "02",
    track: "Garden Wedding",
    keywords: ["Nature", "Unplugged", "Pine Garden", "Ceremony"],
    title: "100년 소나무 아래",
    desc: "100년 소나무와 천연 잔디가 두 사람의 가장 자연스러운 순간을 감싸는 야외 웨딩.",
    recommended: ["야외 예식", "자연 중심 웨딩", "계절감 있는 웨딩", "소규모 리셉션"],
    venue: "100년 소나무 + 천연 잔디정원",
  },
  {
    number: "03",
    track: "Studio Wedding",
    keywords: ["Industrial", "Editorial", "Modern", "Concept"],
    title: "빛과 여백의 공간에서",
    desc: "시멘트 블록과 빛, 여백만으로도 하나의 화보처럼 완성되는 도시적이고 감각적인 웨딩.",
    recommended: ["콘셉트 웨딩", "애프터파티", "웨딩 촬영", "실내 예식"],
    venue: "Storage 1 / Storage 2",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function WeddingPage() {
  const [galleryTab, setGalleryTab] = useState<GalleryTab>("all");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: aboutContent } = useQuery({
    queryKey: ["about-content"],
    queryFn: () => aboutService.get(),
    staleTime: 10 * 60 * 1000,
    enabled: isSupabaseConfigured,
  });

  const weddingTracks = useMemo(() => {
    // DB not loaded → fallback
    if (!aboutContent) return WEDDING_TRACKS;
    const configured = aboutContent.wedding_experiences ?? [];
    // No tracks configured (migration not applied) → fallback
    if (configured.length === 0) return WEDDING_TRACKS;
    // DB has tracks: respect operator settings (empty = all intentionally hidden)
    return configured.filter((w) => w.is_visible).sort((a, b) => a.sort_order - b.sort_order);
  }, [aboutContent]);
  const { data: weddingPhotos } = usePublicPhotos("wedding", { limit: 24 });
  const { data: onlineWeddingPhotos } = usePublicPhotos("online_wedding", {
    limit: 12,
  });
  const { data: spaces } = useSpaces();
  const { data: archiveItemsEn } = useArchive({ search: "wedding", limit: 6 });
  const { data: archiveItemsKo } = useArchive({ search: "웨딩", limit: 6 });
  const { data: blogResultEn } = useBlogPosts({ search: "wedding", limit: 3 });
  const { data: blogResultKo } = useBlogPosts({ search: "웨딩", limit: 3 });

  // ── Hero image ────────────────────────────────────────────────────────────
  const heroImage = useMemo(() => {
    const featured = weddingPhotos?.find((p) => p.public_url && p.is_featured);
    return featured?.public_url ?? weddingPhotos?.[0]?.public_url ?? heroFallback;
  }, [weddingPhotos]);

  // ── Venue spaces ─────────────────────────────────────────────────────────
  const venueSpaces = useMemo(() => {
    const filtered = (spaces ?? []).filter((s) =>
      ["garden", "hall", "studio", "storage"].includes(s.category),
    );
    return filtered.length > 0 ? filtered.slice(0, 3) : VENUE_FALLBACK;
  }, [spaces]);

  // ── Gallery photos ────────────────────────────────────────────────────────
  const allGalleryPhotos = useMemo(() => {
    const pool = [...(weddingPhotos ?? []), ...(onlineWeddingPhotos ?? [])];
    return pool.filter((p) => p.public_url);
  }, [weddingPhotos, onlineWeddingPhotos]);

  const filteredGallery = useMemo(() => {
    if (galleryTab === "all") return allGalleryPhotos;
    return allGalleryPhotos.filter(
      (p) =>
        p.tags?.includes(galleryTab) ||
        p.ai_tags?.includes(galleryTab),
    );
  }, [allGalleryPhotos, galleryTab]);

  // ── Real weddings from archive ─────────────────────────────────────────
  const archiveItems = useMemo(() => {
    const combined = [...(archiveItemsEn ?? []), ...(archiveItemsKo ?? [])];
    const seen = new Set<string>();
    return combined.filter((a) => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
  }, [archiveItemsEn, archiveItemsKo]);
  const realWeddings = useMemo(
    () => (archiveItems ?? []).filter((a) => a.cover_image_url || a.description),
    [archiveItems],
  );

  // ── Blog posts ────────────────────────────────────────────────────────────
  const journalPosts = useMemo(() => {
    const combined = [
      ...(blogResultEn?.data ?? []),
      ...(blogResultKo?.data ?? []),
    ];
    const seen = new Set<string>();
    return combined.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [blogResultEn, blogResultKo]);

  return (
    <>
      <SeoHead
        title="더릿 웨딩 — 하우스웨딩·가든웨딩·스튜디오웨딩 | THE LIT"
        description="100년 소나무 정원의 야외웨딩부터 감각적인 스튜디오웨딩까지. 하남미사 프라이빗 웨딩 베뉴 THE LIT에서 두 사람만의 예식을 기획하세요."
        canonical={`${SITE_URL}/wedding`}
        keywords="더릿 웨딩, 하우스웨딩, 가든웨딩, 스튜디오웨딩, 하남미사 웨딩, 소규모 웨딩, 프라이빗 웨딩, 야외 웨딩, THE LIT 웨딩"
        jsonLd={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Wedding", url: `${SITE_URL}/wedding` },
        ])}
      />

      {/* ── 1. Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative h-screen-safe min-h-[600px] flex items-end">
        {/* Background image */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={heroImage}
            alt="THE LIT Wedding"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-brand-black/20 to-transparent" />
        </div>

        {/* Copy */}
        <div className="relative z-10 container-wide pb-20 sm:pb-28">
          <AnimatedSection animation="fade-up">
            <p className="eyebrow-light mb-5">THE LIT WEDDING</p>
            <h1 className="font-display text-hero font-light text-white mb-6 max-w-2xl">
              빛 속에서,<br className="hidden sm:block" /> 우리의 이야기를
            </h1>
            <p className="font-sans text-sm text-white/70 max-w-sm mb-10 leading-relaxed">
              정원, 소나무, 스튜디오.<br />
              두 사람만의 장면을 만드는 웨딩.
            </p>
            <Link
              to="/contact?type=wedding"
              className="inline-flex items-center gap-2 bg-white text-brand-black font-sans text-xs font-medium tracking-widest uppercase px-7 py-4 hover:bg-brand-cream transition-colors duration-300"
            >
              웨딩 상담 신청
              <ArrowRight size={14} />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* ── 2. Wedding Story ─────────────────────────────────────────────────── */}
      <section className="section-padding bg-brand-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <AnimatedSection animation="fade-up">
              <p className="eyebrow mb-6">Wedding Story</p>
              <h2 className="font-display text-display font-light text-brand-black mb-8 leading-tight">
                틀에 박힌 웨딩이 아니라,<br />두 사람만의 장면을
              </h2>
            </AnimatedSection>
            <AnimatedSection animation="fade-up" delay={120}>
              <div className="space-y-6 font-sans text-sm text-brand-muted leading-relaxed">
                <p>
                  THE LIT는 단순한 웨딩홀이 아닙니다. 문화가 술 쉬는 복합공간이 웨딩의 무대가 될 때, 그 하루는 하나의 작품이 됩니다.
                </p>
                <p>
                  House Wedding, Garden Wedding, Studio Wedding. 하나의 공간 안에서 세 가지 다른 이야기가 펼쳐집니다. 소나무 정원의 야외 예식, 스튜디오의 화보 같은 장면, 따뜻한 홈 파티 분위기까지.
                </p>
                <p>
                  불필요한 것은 덧고, 두 사람의 이야기에만 집중합니다. THE LIT의 웨딩은 절제와 감각이 만나는 지점에 있습니다.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── 3. 3-Track Wedding Experience ──────────────────────────────────── */}
      {weddingTracks.length > 0 && <section className="section-padding bg-brand-black">
        <div className="container-wide">

          <AnimatedSection animation="fade-up" className="mb-4">
            <p className="eyebrow text-white/35 mb-4">THE LIT WEDDING</p>
            <h2
              className="font-display font-light text-white"
              style={{
                fontSize: "clamp(2rem, 4vw, 3.75rem)",
                letterSpacing: "-0.03em",
                lineHeight: "1.08",
              }}
            >
              Your Story,
              <br />
              <em style={{ fontStyle: "normal", color: "#C8A97E" }}>
                In Your Own Light.
              </em>
            </h2>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={80} className="mb-16 lg:mb-20">
            <p className="font-sans text-sm text-white/40 leading-relaxed max-w-sm">
              정원, 소나무, 스튜디오.
              <br />
              하나의 공간 안에서 서로 다른 분위기의 웨딩을 완성합니다.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/[0.08]">
            {weddingTracks.map((wt, i) => (
              <AnimatedSection
                key={wt.track}
                animation="fade-up"
                delay={100 + i * 80}
              >
                <div className="bg-brand-black p-8 lg:p-10 h-full flex flex-col">

                  {/* Number + Track name */}
                  <p className="font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-white/30 mb-5">
                    {wt.number} · {wt.track}
                  </p>

                  {/* Keywords */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {wt.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="font-sans text-[9px] font-medium tracking-widest uppercase text-white/30 border border-white/10 px-2.5 py-1"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h3
                    className="font-display text-2xl font-light text-white mb-4"
                    style={{ letterSpacing: "-0.01em" }}
                  >
                    {wt.title}
                  </h3>

                  {/* Description */}
                  <p className="font-sans text-sm text-white/50 leading-relaxed mb-6 flex-1">
                    {wt.desc}
                  </p>

                  {/* Recommended for */}
                  <div className="mb-7">
                    <p className="font-sans text-[9px] font-medium tracking-[0.2em] uppercase text-white/20 mb-3">
                      Recommended for
                    </p>
                    <ul className="space-y-1.5">
                      {wt.recommended.map((r) => (
                        <li
                          key={r}
                          className="font-sans text-xs text-white/50 flex items-center gap-2.5"
                        >
                          <span
                            className="w-3 h-px bg-brand-accent/40 shrink-0"
                            aria-hidden="true"
                          />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Venue label */}
                  <p className="font-sans text-[9px] font-medium tracking-[0.18em] uppercase text-brand-accent/50 mb-6">
                    {wt.venue}
                  </p>

                  {/* CTA */}
                  <Link
                    to={wt.cta_href ?? "/contact?type=wedding"}
                    className="btn-ghost-light self-start"
                  >
                    {wt.cta_text ?? `Explore ${wt.track}`} <ArrowRight size={12} />
                  </Link>

                </div>
              </AnimatedSection>
            ))}
          </div>

        </div>
      </section>}

      {/* ── 4. Venue ─────────────────────────────────────────────────────────── */}
      <section className="section-padding bg-brand-warm">
        <div className="container-wide">
          <AnimatedSection animation="fade-up">
            <p className="eyebrow mb-4">Venue</p>
            <h2 className="font-display text-headline font-light text-brand-black mb-16">
              세 가지 공간, 하나의 웨딩
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-brand-border">
            {venueSpaces.map((space, i) => (
              <AnimatedSection
                key={space.id}
                animation="fade-up"
                delay={i * 80}
                className="bg-brand-white"
              >
                <Link
                  to={`/spaces/${space.slug}`}
                  className="group block p-8 lg:p-10 h-full hover:bg-brand-cream transition-colors duration-300"
                >
                  {/* Photo */}
                  <div className="aspect-[4/3] overflow-hidden mb-8 bg-brand-warm">
                    {space.cover_image_url ? (
                      <img
                        src={space.cover_image_url}
                        alt={space.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-display text-brand-muted/20 text-2xl tracking-widest">
                          {space.name_en ?? space.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="eyebrow mb-2">{space.name_en ?? space.category}</p>
                  <h3 className="font-display text-title font-light text-brand-black mb-3 group-hover:text-brand-accent transition-colors duration-300">
                    {space.name}
                  </h3>
                  <p className="font-sans text-xs text-brand-muted leading-relaxed mb-5">
                    {space.short_description}
                  </p>
                  {space.capacity && (
                    <p className="font-sans text-[10px] tracking-widest uppercase text-brand-subtle">
                      최대 {space.capacity}명
                    </p>
                  )}
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Wedding Gallery ───────────────────────────────────────────────── */}
      <section className="section-padding bg-brand-white">
        <div className="container-wide">
          <AnimatedSection animation="fade-up">
            <p className="eyebrow mb-4">Gallery</p>
            <h2 className="font-display text-headline font-light text-brand-black mb-10">
              웨딩 갤러리
            </h2>
          </AnimatedSection>

          {/* Tabs */}
          <AnimatedSection animation="fade-up" delay={60}>
            <div className="flex flex-wrap gap-2 mb-10">
              {GALLERY_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setGalleryTab(tab.value)}
                  className={`font-sans text-[10px] font-medium tracking-widest uppercase px-4 py-2 border transition-colors duration-200 ${
                    galleryTab === tab.value
                      ? "bg-brand-black text-brand-white border-brand-black"
                      : "bg-transparent text-brand-muted border-brand-border hover:border-brand-black hover:text-brand-black"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </AnimatedSection>

          {/* Grid */}
          {filteredGallery.length > 0 ? (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-2 space-y-2">
              {filteredGallery.slice(0, 20).map((photo, i) => (
                <AnimatedSection
                  key={photo.id}
                  animation="fade-in"
                  delay={i * 30}
                  className="break-inside-avoid"
                >
                  <div className="overflow-hidden">
                    <img
                      src={photo.public_url!}
                      alt={photo.title ?? photo.original_name}
                      className="w-full object-cover hover:opacity-95 transition-opacity duration-300"
                      loading="lazy"
                    />
                  </div>
                </AnimatedSection>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <p className="font-sans text-xs text-brand-muted tracking-widest">
                갤러리 사진은 순차적으로 업로드됩니다.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── 5. Real Weddings ─────────────────────────────────────────────────── */}
      {realWeddings.length > 0 && (
        <section className="section-padding bg-brand-ivory">
          <div className="container-wide">
            <AnimatedSection animation="fade-up">
              <p className="eyebrow mb-4">Real Weddings</p>
              <h2 className="font-display text-headline font-light text-brand-black mb-16">
                실제 웨딩 스토리
              </h2>
            </AnimatedSection>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {realWeddings.map((item, i) => (
                <AnimatedSection
                  key={item.id}
                  animation="fade-up"
                  delay={i * 80}
                >
                  <Link
                    to={`/archive/${item.slug}`}
                    className="group block"
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-brand-warm mb-5">
                      {item.cover_image_url ? (
                        <img
                          src={item.cover_image_url}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-display text-brand-muted/20 text-xl tracking-widest">
                            THE LIT
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="eyebrow mb-2">{item.date?.slice(0, 7) ?? ""}</p>
                    <h3 className="font-display text-lg font-light text-brand-black mb-2 group-hover:text-brand-accent transition-colors duration-300 line-clamp-2">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="font-sans text-xs text-brand-muted line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 6. Wedding Journal ───────────────────────────────────────────────── */}
      {journalPosts.length > 0 && (
        <section className="section-padding bg-brand-white">
          <div className="container-wide">
            <AnimatedSection animation="fade-up">
              <p className="eyebrow mb-4">Journal</p>
              <h2 className="font-display text-headline font-light text-brand-black mb-16">
                웨딩 저널
              </h2>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {journalPosts.map((post, i) => (
                <AnimatedSection
                  key={post.id}
                  animation="fade-up"
                  delay={i * 80}
                >
                  <Link to={`/blog/${post.slug}`} className="group block">
                    <div className="aspect-video overflow-hidden bg-brand-warm mb-5">
                      {post.cover_image_url ? (
                        <img
                          src={post.cover_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full" />
                      )}
                    </div>
                    <h3 className="font-display text-lg font-light text-brand-black mb-2 group-hover:text-brand-accent transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="font-sans text-xs text-brand-muted line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 7. FAQ ───────────────────────────────────────────────────────────── */}
      <section className="section-padding bg-brand-warm">
        <div className="container-wide">
          <AnimatedSection animation="fade-up">
            <p className="eyebrow mb-4">FAQ</p>
            <h2 className="font-display text-headline font-light text-brand-black mb-16">
              자주 묻는 질문
            </h2>
          </AnimatedSection>

          <div className="max-w-2xl">
            {FAQ_ITEMS.map((item, i) => (
              <AnimatedSection key={i} animation="fade-up" delay={i * 50}>
                <div className="border-t border-brand-border">
                  <button
                    className="w-full flex items-start justify-between gap-4 py-6 text-left"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                  >
                    <span className="font-sans text-sm font-medium text-brand-black leading-snug">
                      {item.q}
                    </span>
                    <span className="shrink-0 mt-0.5 text-brand-muted">
                      {openFaq === i ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </span>
                  </button>
                  {openFaq === i && (
                    <p className="font-sans text-sm text-brand-muted leading-relaxed pb-6">
                      {item.a}
                    </p>
                  )}
                </div>
              </AnimatedSection>
            ))}
            <div className="border-t border-brand-border" />
          </div>
        </div>
      </section>

      {/* ── 8. Consultation CTA ──────────────────────────────────────────────── */}
      <section className="relative py-32 sm:py-40 bg-brand-black overflow-hidden">
        {/* Subtle background texture */}
        {allGalleryPhotos[1]?.public_url && (
          <div className="absolute inset-0">
            <img
              src={allGalleryPhotos[1].public_url}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover opacity-20"
            />
          </div>
        )}
        <div className="relative z-10 container-wide text-center">
          <AnimatedSection animation="fade-up">
            <p className="eyebrow-light mb-6">Wedding Consultation</p>
            <h2 className="font-display text-display font-light text-white mb-6">
              Plan Your Wedding
            </h2>
            <p className="font-sans text-sm text-white/60 max-w-md mx-auto mb-12 leading-relaxed">
              날짜, 인원, 스타일 어떤 질문이든 환영합니다.<br />
              담당자가 직접 함께 기획해 드립니다.
            </p>
            <Link
              to="/contact?type=wedding"
              className="inline-flex items-center gap-2 border border-white text-white font-sans text-xs font-medium tracking-widest uppercase px-8 py-4 hover:bg-white hover:text-brand-black transition-colors duration-300"
            >
              웨딩 상담 신청
              <ArrowRight size={14} />
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
