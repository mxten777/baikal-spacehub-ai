import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { usePrograms, usePublicPhotos } from "../hooks/useData";
import AnimatedSection from "../components/common/AnimatedSection";
import LoadingSpinner from "../components/common/LoadingSpinner";
import type { ProgramStatus } from "../types";
import SeoHead from "../components/common/SeoHead";
import { SITE_URL, breadcrumbJsonLd } from "../lib/seo";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "exhibition", label: "전시" },
  { value: "performance", label: "공연" },
  { value: "lecture", label: "강연" },
  { value: "workshop", label: "워크숍" },
  { value: "event", label: "이벤트" },
];

const STATUS_LABELS: Record<ProgramStatus, string> = {
  upcoming: "예정",
  ongoing: "진행 중",
  closed: "종료",
  cancelled: "취소",
};

const STATUS_COLORS: Record<ProgramStatus, string> = {
  upcoming: "bg-blue-100 text-blue-700",
  ongoing: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-500",
};

const FALLBACK_PROGRAMS = [
  {
    id: "1",
    slug: "exhibition-spring-2026",
    title: "봄 기억 — 사진전",
    category: "exhibition",
    status: "upcoming",
    start_date: "2026-03-15",
    end_date: "2026-04-15",
    venue: "스토리지",
    cover_image_url:
      "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=600&q=80",
    short_description: "일상 속 봄의 순간을 담은 사진 전시",
    is_free: false,
    price: 8000,
    tags: ["사진", "봄", "전시"],
  },
  {
    id: "2",
    slug: "jazz-night-march",
    title: "Jazz Night — 봄의 소리",
    category: "performance",
    status: "upcoming",
    start_date: "2026-03-22",
    end_date: "2026-03-22",
    venue: "카페",
    cover_image_url:
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&q=80",
    short_description: "봄밤을 수놓는 재즈 라이브 공연",
    is_free: false,
    price: 30000,
    tags: ["재즈", "라이브", "봄"],
  },
  {
    id: "3",
    slug: "workshop-ceramics",
    title: "도예 워크숍 — 흙과 손",
    category: "workshop",
    status: "upcoming",
    start_date: "2026-03-29",
    end_date: "2026-03-29",
    venue: "스튜디오",
    cover_image_url:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    short_description: "나만의 도자기를 만드는 1일 워크숍",
    is_free: false,
    price: 65000,
    tags: ["도예", "도자기", "워크숍"],
  },
  {
    id: "4",
    slug: "lecture-contemporary-art",
    title: "현대미술 강연 시리즈 II",
    category: "lecture",
    status: "upcoming",
    start_date: "2026-04-05",
    end_date: "2026-04-05",
    venue: "카페",
    cover_image_url:
      "https://images.unsplash.com/photo-1541675154750-0444c7d51e8e?w=600&q=80",
    short_description: "현대미술의 맥락을 읽는 시선",
    is_free: false,
    price: 20000,
    tags: ["강연", "미술", "교육"],
  },
  {
    id: "5",
    slug: "brand-event-spring",
    title: "Spring Brand Showcase",
    category: "event",
    status: "upcoming",
    start_date: "2026-04-10",
    end_date: "2026-04-12",
    venue: "스토리지",
    cover_image_url:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
    short_description: "봄 신상품 브랜드 쇼케이스",
    is_free: true,
    price: 0,
    tags: ["브랜드", "패션", "팝업"],
  },
  {
    id: "6",
    slug: "film-screening-april",
    title: "인디 필름 상영회",
    category: "performance",
    status: "upcoming",
    start_date: "2026-04-18",
    end_date: "2026-04-18",
    venue: "스토리지",
    cover_image_url:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80",
    short_description: "독립영화의 숨겨진 이야기를 발견하다",
    is_free: false,
    price: 12000,
    tags: ["영화", "인디", "상영"],
  },
];

export default function ProgramsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const { data: programs, isLoading } = usePrograms(
    activeCategory !== "all" ? { category: activeCategory } : undefined,
  );
  const displayPrograms =
    programs && programs.length > 0 ? programs : FALLBACK_PROGRAMS;
  const filtered =
    activeCategory === "all"
      ? displayPrograms
      : displayPrograms.filter((p) => p.category === activeCategory);

  // 자산관리 시스템의 web 사진을 풍백 이미지 풍으로
  const { data: archivePhotos } = usePublicPhotos("archive", { limit: 24 });
  const photoPool = useMemo(
    () => (archivePhotos ?? []).filter((p) => p.public_url),
    [archivePhotos],
  );
  const getCover = (
    url: string | null | undefined,
    idx: number,
  ): string | undefined => {
    if (url) return url;
    if (photoPool.length > 0)
      return photoPool[idx % photoPool.length]?.public_url ?? undefined;
    return undefined;
  };

  return (
    <>
      <SeoHead
        title="Programs — The Lit"
        description="전시, 공연, 강연, 워크숏 — 더릿에서 폼쳓지는 다양한 문화 프로그램을 확인하세요."
        canonical={`${SITE_URL}/programs`}
        keywords="전시, 공연, 강연, 워크숏, 더릿 프로그램, 문화 프로그램 서울"
        jsonLd={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Programs", url: `${SITE_URL}/programs` },
        ])}
      />

      {/* Page hero */}
      <section className="pt-32 pb-16 bg-brand-white">
        <div className="container-wide">
          <AnimatedSection animation="fade-up">
            <p className="eyebrow mb-4">Programs</p>
            <h1 className="font-display text-display font-light text-brand-black mb-6">
              프로그램
            </h1>
            <p className="font-sans text-base text-brand-muted max-w-xl">
              더릿에서 열리는 전시, 공연, 강연, 워크숍 등 다양한 문화 프로그램을
              만나보세요.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Category filter */}
      <div className="sticky top-16 lg:top-20 z-20 bg-brand-white border-b border-brand-border">
        <div className="container-wide py-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`shrink-0 px-5 py-2 font-sans text-xs font-medium tracking-widest uppercase transition-all duration-200
                ${
                  activeCategory === cat.value
                    ? "bg-brand-black text-white"
                    : "bg-brand-cream text-brand-muted hover:text-brand-black"
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Programs list */}
      <section className="section-padding bg-brand-white">
        <div className="container-wide">
          {filtered.length === 0 && isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((program, i) => (
                <AnimatedSection
                  key={program.id}
                  animation="fade-up"
                  delay={i * 60}
                >
                  <Link
                    to={`/programs/${program.slug}`}
                    className="group block border border-brand-border hover:border-brand-black transition-colors duration-300"
                  >
                    {/* Poster */}
                    <div className="relative overflow-hidden aspect-[3/4]">
                      <img
                        src={getCover(program.cover_image_url, i)}
                        alt={program.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span
                          className={`font-sans text-[9px] font-medium tracking-widest uppercase px-2 py-0.5 ${STATUS_COLORS[program.status as ProgramStatus]}`}
                        >
                          {STATUS_LABELS[program.status as ProgramStatus]}
                        </span>
                      </div>
                      {program.is_free ? (
                        <span className="absolute top-3 right-3 font-sans text-[9px] font-medium tracking-widest uppercase px-2 py-0.5 bg-brand-accent text-white">
                          FREE
                        </span>
                      ) : null}
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <p className="eyebrow mb-1">
                        {
                          CATEGORIES.find((c) => c.value === program.category)
                            ?.label
                        }
                      </p>
                      <h3 className="font-display text-lg font-light text-brand-black mb-2 group-hover:text-brand-accent transition-colors line-clamp-2">
                        {program.title}
                      </h3>
                      <p className="font-sans text-xs text-brand-muted mb-3 line-clamp-2">
                        {program.short_description}
                      </p>
                      <div className="space-y-1 border-t border-brand-border pt-3">
                        <div className="flex items-center gap-2 text-xs text-brand-muted">
                          <Calendar size={11} />
                          <span>
                            {program.start_date
                              ? format(
                                  new Date(program.start_date),
                                  "M.d (EEE)",
                                  { locale: ko },
                                )
                              : "-"}
                            {program.start_date &&
                              program.end_date &&
                              program.start_date !== program.end_date &&
                              ` — ${format(new Date(program.end_date), "M.d", { locale: ko })}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-brand-muted">
                          <MapPin size={11} />
                          <span>{program.venue}</span>
                        </div>
                      </div>
                    </div>
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
