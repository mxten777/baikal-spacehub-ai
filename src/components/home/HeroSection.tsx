import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// AnimatePresence kept for content text transition below
import { useActiveHeroSlides, usePublicPhotos } from "../../hooks/useData";
import { HERO_FALLBACK_SLIDES } from "../../data/heroFallbackData";
import type { HeroSlide } from "../../types";

// ─── Button helper ────────────────────────────────────────────────────────────

function HeroButton({
  text,
  link,
  variant,
}: {
  text: string | null | undefined;
  link: string | null | undefined;
  variant: "primary" | "outline";
}) {
  if (!text || !link) return null;

  const isExternal = link.startsWith("http://") || link.startsWith("https://");
  const className = variant === "primary" ? "btn-primary" : "btn-outline-white";

  if (isExternal) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {text} <ArrowRight size={15} />
      </a>
    );
  }
  return (
    <Link to={link} className={className}>
      {text} {variant === "primary" && <ArrowRight size={15} />}
    </Link>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeroSection() {
  // placeholderData 제거 — 로딩 중에는 어두운 배경만 표시, 실제 데이터 도착 후 이미지 표시
  const { data: heroData, isLoading: heroLoading } = useActiveHeroSlides();

  // project_category='main' + stage='web' 업로드 사진 — desktop_image_url 없는 슬라이드 자동 치환
  const { data: mainPhotos } = usePublicPhotos("main");

  const displaySlides: HeroSlide[] = useMemo(() => {
    const base =
      heroData && heroData.length > 0 ? heroData : HERO_FALLBACK_SLIDES;
    if (!mainPhotos?.length) return base;
    return base.map((slide, i) => ({
      ...slide,
      desktop_image_url:
        slide.desktop_image_url || mainPhotos[i]?.public_url || null,
    }));
  }, [heroData, mainPhotos]);

  // Always up-to-date ref — interval callback uses this to avoid stale closure
  const displaySlidesRef = useRef(displaySlides);
  // Update ref after every render so interval always reads current slides
  useEffect(() => {
    displaySlidesRef.current = displaySlides;
  });

  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAuto = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % displaySlidesRef.current.length);
    }, 6000);
  };

  // Initial autoplay — runs once; interval reads ref which stays current

  useEffect(() => {
    startAuto();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // 로딩 중이면 어두운 배경 스켈레톤 표시 (Unsplash placeholder 방지)
  if (heroLoading) {
    return (
      <section className="relative h-screen min-h-[600px] overflow-hidden bg-brand-black" />
    );
  }

  // Safe current index — clamps if slides list shrinks (avoids out-of-bounds)
  const safeIdx = Math.min(current, displaySlides.length - 1);
  const slide = displaySlides[safeIdx];

  if (!slide) return null;

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden">
      {/* Background slides — all rendered for instant preload, crossfade via opacity */}
      {displaySlides.map((s, i) => (
        <motion.div
          key={s.id}
          className="absolute inset-0"
          initial={false}
          animate={{
            opacity: i === safeIdx ? 1 : 0,
            scale: i === safeIdx ? 1 : 1.04,
          }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          style={{ zIndex: i === safeIdx ? 1 : 0 }}
        >
          <picture>
            {s.mobile_image_url && (
              <source media="(max-width: 767px)" srcSet={s.mobile_image_url} />
            )}
            <img
              src={s.desktop_image_url || ""}
              alt=""
              className="w-full h-full object-cover"
              aria-hidden="true"
              fetchPriority={i === 0 ? "high" : "low"}
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-overlay-center" />
        </motion.div>
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full container-wide pb-20 lg:pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id + "-content"}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-white/45 mb-5">
              The Lit — 복합문화공간
            </p>
            <h1
              className="font-display font-light text-white whitespace-pre-line mb-7"
              style={{
                fontSize: "clamp(2rem, 4.5vw, 4.5rem)",
                letterSpacing: "-0.03em",
                lineHeight: "1.08",
              }}
            >
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p className="font-sans text-[15px] text-white/55 mb-12 tracking-[0.02em]">
                {slide.subtitle}
              </p>
            )}

            {/* Buttons — only shown when both text and link are set */}
            {(slide.primary_button_text || slide.secondary_button_text) && (
              <div className="flex flex-wrap items-center gap-4">
                <HeroButton
                  text={slide.primary_button_text}
                  link={slide.primary_button_link}
                  variant="primary"
                />
                <HeroButton
                  text={slide.secondary_button_text}
                  link={slide.secondary_button_link}
                  variant="outline"
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Slide indicators */}
        <div className="flex items-center gap-3 mt-12">
          {displaySlides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrent(i);
                startAuto();
              }}
              className={`transition-all duration-300 ${
                i === safeIdx
                  ? "w-8 h-0.5 bg-white"
                  : "w-4 h-0.5 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-8 lg:right-16 z-10 flex flex-col items-center gap-2">
        <span className="writing-vertical font-sans text-[9px] tracking-[0.25em] uppercase text-white/40">
          Scroll
        </span>
        <div className="w-px h-12 bg-white/20 relative overflow-hidden">
          <motion.div
            className="absolute top-0 w-full h-1/2 bg-white/60"
            animate={{ y: ["0%", "200%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    </section>
  );
}
