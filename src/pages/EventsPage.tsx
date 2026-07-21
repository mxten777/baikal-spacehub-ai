import { useMemo } from "react";
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

const FALLBACK_EVENTS = [
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
];

export default function EventsPage() {
  const { data: programs, isLoading } = usePrograms({ category: "event" });
  const displayEvents =
    programs && programs.length > 0 ? programs : FALLBACK_EVENTS;

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
        title="Events — The Lit"
        description="더릿에서 열리는 브랜드 행사, 팅업, 특별 이벤트 일정을 확인하세요."
        canonical={`${SITE_URL}/events`}
        keywords="이벤트, 브랜드 행사, 팡업, 더릿 이벤트, 특별 이벤트 서울"
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', url: SITE_URL },
          { name: 'Events', url: `${SITE_URL}/events` },
        ])}
      />

      {/* Page hero */}
      <section className="pt-32 pb-16 bg-brand-white">
        <div className="container-wide">
          <AnimatedSection animation="fade-up">
            <p className="eyebrow mb-4">Events</p>
            <h1 className="font-display text-display font-light text-brand-black mb-6">
              이벤트
            </h1>
            <p className="font-sans text-base text-brand-muted max-w-xl">
              더릿에서 열리는 특별한 이벤트와 팝업 행사를 만나보세요.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Events list */}
      <section className="section-padding bg-brand-white">
        <div className="container-wide">
          {isLoading ? (
            <LoadingSpinner />
          ) : displayEvents.length === 0 ? (
            <AnimatedSection animation="fade-up">
              <p className="font-sans text-brand-muted text-center py-20">
                현재 진행 예정인 이벤트가 없습니다.
              </p>
            </AnimatedSection>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayEvents.map((event, i) => (
                <AnimatedSection
                  key={event.id}
                  animation="fade-up"
                  delay={i * 60}
                >
                  <Link
                    to={`/programs/${event.slug}`}
                    className="group block border border-brand-border hover:border-brand-black transition-colors duration-300"
                  >
                    {/* Poster */}
                    <div className="relative overflow-hidden aspect-[3/4]">
                      <img
                        src={getCover(event.cover_image_url, i)}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span
                          className={`font-sans text-[9px] font-medium tracking-widest uppercase px-2 py-0.5 ${STATUS_COLORS[event.status as ProgramStatus]}`}
                        >
                          {STATUS_LABELS[event.status as ProgramStatus]}
                        </span>
                      </div>
                      {event.is_free ? (
                        <span className="absolute top-3 right-3 font-sans text-[9px] font-medium tracking-widest uppercase px-2 py-0.5 bg-brand-accent text-white">
                          FREE
                        </span>
                      ) : null}
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <p className="eyebrow mb-1">이벤트</p>
                      <h3 className="font-display text-lg font-light text-brand-black mb-2 group-hover:text-brand-accent transition-colors line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="font-sans text-xs text-brand-muted mb-3 line-clamp-2">
                        {event.short_description}
                      </p>
                      <div className="space-y-1 border-t border-brand-border pt-3">
                        <div className="flex items-center gap-2 text-xs text-brand-muted">
                          <Calendar size={11} />
                          <span>
                            {event.start_date
                              ? format(
                                  new Date(event.start_date),
                                  "M.d (EEE)",
                                  { locale: ko },
                                )
                              : "-"}
                            {event.start_date &&
                              event.end_date &&
                              event.start_date !== event.end_date &&
                              ` — ${format(new Date(event.end_date), "M.d", { locale: ko })}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-brand-muted">
                          <MapPin size={11} />
                          <span>{event.venue}</span>
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
