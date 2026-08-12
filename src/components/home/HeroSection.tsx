import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useActiveHeroSlides, usePublicPhotos } from "../../hooks/useData";
import { HERO_FALLBACK_SLIDES } from "../../data/heroFallbackData";
import type { HeroSlide } from "../../types";

// ─── Image optimization helpers ───────────────────────────────────────────────

/**
 * Returns a WebP source URL for local /images/ paths only.
 * Supabase Storage render endpoint is excluded — not available on free plan (ORB blocked).
 */
function getWebPSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("/images/"))
    return url.replace(/\.(jpe?g|png)$/i, ".webp");
  return null;
}

/** Returns /images/hero/NAME-mobile.webp for local hero images, null otherwise. */
function getMobileWebPSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/^(\/images\/hero\/hero-\d+)\.(jpe?g|png|webp)$/i);
  return m ? `${m[1]}-mobile.webp` : null;
}

/** Appends ?v=<updatedAt> (or &v=...) to bust browser cache on image replacement. */
function withVersion(
  url: string | null | undefined,
  updatedAt: string | null | undefined,
): string | null | undefined {
  if (!url || !updatedAt) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${updatedAt}`;
}

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
  const { data: heroData } = useActiveHeroSlides();

  // Local photos fill in slides that have no desktop_image_url
  const { data: mainPhotos } = usePublicPhotos("main");

  // Use fallback immediately while Supabase loads; swap to real data on arrival
  const mergedSlides = useMemo<HeroSlide[]>(() => {
    const base = heroData?.length ? heroData : HERO_FALLBACK_SLIDES;
    if (!mainPhotos?.length) return base;
    return base.map((slide, i) => ({
      ...slide,
      desktop_image_url:
        slide.desktop_image_url ?? mainPhotos[i]?.public_url ?? null,
    }));
  }, [heroData, mainPhotos]);

  // Hero is revealed only after the first real image is decoded and ready to paint
  const [heroReady, setHeroReady] = useState(false);
  // Derived: empty until heroReady, then always tracks mergedSlides (includes Supabase updates)
  const displaySlides = useMemo(
    () => (heroReady ? mergedSlides : []),
    [heroReady, mergedSlides],
  );

  const [current, setCurrent] = useState(0);
  const [activatedCount, setActivatedCount] = useState(2);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Always up-to-date ref — interval callback uses this to avoid stale closure
  const displaySlidesRef = useRef(displaySlides);
  useEffect(() => {
    displaySlidesRef.current = displaySlides;
  });

  // Preload first hero image before revealing the section; avoids any visible swap
  useEffect(() => {
    if (!mergedSlides.length || heroReady) return;

    const firstSlide = mergedSlides[0];
    const rawUrl = firstSlide.desktop_image_url;

    const activate = () => {
      setHeroReady(true);
    };

    if (!rawUrl) {
      // No image URL — show brand background with content text only
      activate();
      return;
    }

    // Preload the URL that <picture> will actually render to avoid a double download:
    // — mobile browsers (<= 767px): prefer mobile WebP if available, else desktop WebP
    // — desktop browsers: prefer desktop WebP (matches <source type="image/webp"> in <picture>)
    const isMobile = window.innerWidth <= 767;
    const preferredRaw = isMobile
      ? (getMobileWebPSrc(rawUrl) ?? getWebPSrc(rawUrl) ?? rawUrl)
      : (getWebPSrc(rawUrl) ?? rawUrl);
    const preloadUrl = (withVersion(preferredRaw, firstSlide.updated_at) ??
      preferredRaw) as string;
    let cancelled = false;
    const img = new window.Image();
    img.src = preloadUrl;
    img
      .decode()
      .then(() => {
        if (!cancelled) {
          activate();
        }
      })
      .catch(() => {
        if (!cancelled) activate();
      });
    return () => {
      cancelled = true;
    };
  }, [mergedSlides, heroReady]);

  const startAuto = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      // Activate next-next slide on each transition so it's ready when needed
      setActivatedCount((c) =>
        Math.min(c + 1, displaySlidesRef.current.length),
      );
      setCurrent((prev) => (prev + 1) % displaySlidesRef.current.length);
    }, 6000);
  };

  // Begin autoplay once hero is ready — interval reads ref which stays current
  useEffect(() => {
    if (!heroReady) return;
    startAuto();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [heroReady]);

  // Pre-decode all remaining slide images right after first slide is shown.
  // Ensures no blank frame during crossfade caused by deferred async decoding.
  useEffect(() => {
    if (!heroReady || displaySlides.length <= 1) return;
    const isMobile = window.innerWidth <= 767;
    displaySlides.slice(1).forEach((s) => {
      const rawUrl = s.desktop_image_url;
      if (!rawUrl) return;
      const preferred = isMobile
        ? (getMobileWebPSrc(rawUrl) ?? getWebPSrc(rawUrl) ?? rawUrl)
        : (getWebPSrc(rawUrl) ?? rawUrl);
      const img = new window.Image();
      img.src = (withVersion(preferred, s.updated_at) ?? preferred) as string;
      img.decode().catch(() => {});
    });
  }, [heroReady, displaySlides]);

  // Safe current index — clamps if slides list shrinks (avoids out-of-bounds)
  const safeIdx = Math.min(current, displaySlides.length - 1);
  const slide = safeIdx >= 0 ? displaySlides[safeIdx] : null;

  // Brand background: stable dark canvas while hero data and first image are not yet ready
  if (!heroReady || !slide) {
    return (
      <section
        className="relative h-screen-safe min-h-[600px] overflow-hidden bg-brand-black"
        aria-label="THE LIT"
      />
    );
  }

  return (
    <section className="relative h-screen-safe min-h-[600px] overflow-hidden bg-brand-black">
      {/* 250ms fade-in on first reveal — background transitions from brand-black naturally */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {/* Background slides — all rendered for instant preload, crossfade via opacity */}
        {displaySlides.map((s, i) => {
          // heroReady guarantees first image is painted; serve src to all slides immediately for decode
          const shouldHaveSrc = heroReady || i === safeIdx || i < activatedCount;
          const desktopWebP = shouldHaveSrc
            ? withVersion(getWebPSrc(s.desktop_image_url), s.updated_at)
            : null;
          const mobileWebP = shouldHaveSrc
            ? withVersion(getWebPSrc(s.mobile_image_url), s.updated_at)
            : null;
          // Auto-generated mobile WebP for local /images/hero/ files
          const mobileHeroWebP = shouldHaveSrc
            ? withVersion(getMobileWebPSrc(s.desktop_image_url), s.updated_at)
            : null;
          const deskUrl = shouldHaveSrc
            ? withVersion(s.desktop_image_url, s.updated_at)
            : null;
          const mobUrl = shouldHaveSrc
            ? withVersion(s.mobile_image_url, s.updated_at)
            : null;
          return (
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
                {/* CMS-provided mobile image — highest priority on mobile */}
                {mobileWebP && (
                  <source
                    media="(max-width: 767px)"
                    srcSet={mobileWebP}
                    type="image/webp"
                  />
                )}
                {mobUrl && (
                  <source media="(max-width: 767px)" srcSet={mobUrl} />
                )}
                {/* Auto-generated 960px mobile WebP for local hero images */}
                {mobileHeroWebP && (
                  <source
                    media="(max-width: 767px)"
                    srcSet={mobileHeroWebP}
                    type="image/webp"
                  />
                )}
                {/* Desktop: WebP first, then original via <img> fallback */}
                {desktopWebP && (
                  <source srcSet={desktopWebP} type="image/webp" />
                )}
                <img
                  src={deskUrl ?? undefined}
                  alt=""
                  aria-hidden="true"
                  className="w-full h-full object-cover"
                  fetchPriority={i === 0 ? "high" : "low"}
                  loading={i === 0 ? "eager" : undefined}
                  decoding={i === 0 ? "sync" : "async"}
                />
              </picture>
              <div
                className="absolute inset-0 bg-gradient-overlay-center"
                style={
                  i === 1
                    ? {
                        backgroundImage:
                          "linear-gradient(to bottom, rgba(10,10,10,0) 0%, rgba(10,10,10,0.05) 45%, rgba(10,10,10,0.48) 100%)",
                      }
                    : undefined
                }
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full container-wide hero-content-pad">
        <AnimatePresence mode="wait">
          <motion.div
            key={safeIdx + "-content"}
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
                overflowWrap: "break-word",
                wordBreak: "keep-all",
              }}
            >
              {slide.title.replace(/\\n/g, "\n")}
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
