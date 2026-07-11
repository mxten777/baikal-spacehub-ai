import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import {
  useFeaturedExternalContents,
  useFeaturedMedia,
} from "../../hooks/useData";
import AnimatedSection from "../common/AnimatedSection";
import SectionHeader from "../common/SectionHeader";

const PLATFORM_BADGE: Record<string, { label: string; color: string }> = {
  youtube: { label: "YouTube", color: "bg-red-600" },
  instagram: {
    label: "Instagram",
    color: "bg-gradient-to-r from-purple-500 to-pink-500",
  },
  x: { label: "X", color: "bg-black" },
  rss: { label: "Blog", color: "bg-orange-500" },
};

export default function MediaFeedSection() {
  const { data: featured } = useFeaturedExternalContents(6);
  const { data: legacyMedia } = useFeaturedMedia(6);

  // external_contents의 featured 항목 우선, 없으면 legacy media_items
  const items =
    featured && featured.length > 0
      ? featured.map((item) => ({
          id: item.id,
          platform: item.platform,
          title: item.title,
          thumbnail_url: item.thumbnail_url,
          url: item.external_url,
        }))
      : (legacyMedia ?? []).map((m) => ({
          id: m.id,
          platform: m.platform,
          title: m.title,
          thumbnail_url: m.thumbnail_url,
          url: m.url,
        }));

  if (items.length === 0) return null;

  return (
    <section className="section-padding bg-brand-white">
      <div className="container-wide">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <SectionHeader
            eyebrow="Media"
            title="더릿의 이야기"
            subtitle="YouTube, Instagram, X에서 더릿의 다양한 콘텐츠를 만나보세요"
          />
          <Link
            to="/media"
            className="btn-ghost text-brand-black shrink-0 self-end mb-1"
          >
            All Media <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {items.slice(0, 3).map((item, i) => {
            const badge =
              PLATFORM_BADGE[item.platform] ?? PLATFORM_BADGE.youtube;
            const isVideo = item.platform === "youtube";

            return (
              <AnimatedSection
                key={item.id}
                animation="fade-up"
                delay={i * 100}
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block relative overflow-hidden aspect-video bg-brand-warm"
                >
                  <img
                    src={item.thumbnail_url ?? undefined}
                    alt={item.title ?? undefined}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300" />

                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Play size={20} className="text-white ml-1" />
                      </div>
                    </div>
                  )}

                  <div className="absolute top-3 left-3">
                    <span
                      className={`font-sans text-[9px] font-medium tracking-widest uppercase text-white px-2 py-1 ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="font-sans text-sm font-medium text-white line-clamp-2 leading-snug">
                      {item.title}
                    </p>
                  </div>
                </a>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
