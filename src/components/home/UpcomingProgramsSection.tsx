import { Link } from "react-router-dom";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useUpcomingPrograms } from "../../hooks/useData";
import AnimatedSection from "../common/AnimatedSection";
import SectionHeader from "../common/SectionHeader";
import LoadingSpinner from "../common/LoadingSpinner";
import type { ProgramCategory } from "../../types";

const CATEGORY_LABELS: Record<ProgramCategory, string> = {
  exhibition: "전시",
  performance: "공연",
  lecture: "강연",
  workshop: "워크숍",
  event: "이벤트",
};

const FALLBACK_PROGRAMS = [
  {
    id: "1",
    slug: "exhibition-spring-2026",
    title: "봄 기억 — 사진전",
    category: "exhibition" as ProgramCategory,
    status: "upcoming",
    start_date: "2026-03-15",
    end_date: "2026-04-15",
    venue: "스토리지",
    cover_image_url:
      "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=600&q=80",
    short_description: "일상 속 봄의 순간을 담은 사진 전시",
  },
  {
    id: "2",
    slug: "jazz-night-march",
    title: "Jazz Night — 봄의 소리",
    category: "performance" as ProgramCategory,
    status: "upcoming",
    start_date: "2026-03-22",
    end_date: "2026-03-22",
    venue: "카페",
    cover_image_url:
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&q=80",
    short_description: "봄밤을 수놓는 재즈 라이브 공연",
  },
  {
    id: "3",
    slug: "workshop-ceramics",
    title: "도예 워크숍 — 흙과 손",
    category: "workshop" as ProgramCategory,
    status: "upcoming",
    start_date: "2026-03-29",
    end_date: "2026-03-29",
    venue: "스튜디오",
    cover_image_url:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    short_description: "나만의 도자기를 만드는 1일 워크숍",
  },
];

export default function UpcomingProgramsSection() {
  const { data: programs, isLoading } = useUpcomingPrograms(6);
  const displayPrograms = (
    programs && programs.length > 0 ? programs : FALLBACK_PROGRAMS
  ).slice(0, 3);

  return (
    <section className="section-padding bg-brand-black">
      <div className="container-wide">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16 lg:mb-20">
          <SectionHeader
            eyebrow="Upcoming"
            title="다가오는 프로그램"
            subtitle="전시, 공연, 강연, 워크숍 — 더릿에서 펼쳐지는 문화 이야기"
            light
          />
          <Link
            to="/programs"
            className="btn-ghost-light shrink-0 self-end mb-1"
          >
            All Programs <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10">
            {displayPrograms.map((program, i) => (
              <AnimatedSection
                key={program.id}
                animation="fade-up"
                delay={i * 100}
              >
                <Link
                  to={`/programs/${program.slug}`}
                  className="group flex flex-col bg-brand-charcoal hover:bg-brand-smoke transition-colors duration-500 h-full"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <img
                      src={program.cover_image_url ?? ""}
                      alt={program.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/60 via-transparent to-transparent" />
                    {/* Category badge */}
                    <div className="absolute top-5 left-5">
                      <span className="tag-white">
                        {CATEGORY_LABELS[program.category as ProgramCategory]}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-7">
                    <h3 className="font-display text-[1.35rem] font-light text-white leading-snug mb-3 group-hover:text-brand-accent transition-colors duration-300">
                      {program.title}
                    </h3>
                    <p className="font-sans text-[13px] text-white/45 leading-relaxed mb-6 line-clamp-2">
                      {program.short_description}
                    </p>

                    {/* Meta */}
                    <div className="flex flex-col gap-2 mt-auto">
                      <div className="flex items-center gap-2.5 text-[11px] text-white/35 tracking-wide">
                        <Calendar size={11} className="shrink-0" />
                        <span>
                          {program.start_date
                            ? format(
                                new Date(program.start_date),
                                "M.d (EEE)",
                                { locale: ko },
                              )
                            : ""}
                          {program.start_date &&
                            program.end_date &&
                            program.start_date !== program.end_date && (
                              <>
                                {" "}
                                —{" "}
                                {format(new Date(program.end_date), "M.d", {
                                  locale: ko,
                                })}
                              </>
                            )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[11px] text-white/35 tracking-wide">
                        <MapPin size={11} className="shrink-0" />
                        <span>{program.venue}</span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center gap-2 mt-6 pt-5 border-t border-white/10">
                      <span className="font-sans text-[10px] tracking-[0.18em] uppercase text-white/30 group-hover:text-brand-accent transition-colors duration-300">
                        자세히 보기
                      </span>
                      <ArrowRight
                        size={12}
                        className="text-white/30 group-hover:text-brand-accent group-hover:translate-x-1 transition-all duration-300"
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
  );
}
