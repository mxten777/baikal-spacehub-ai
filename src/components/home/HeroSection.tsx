import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
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
    }, 7000);
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
      {/* initial={false}: image already decoded before heroReady fires, so paint at full opacity immediately */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: 1 }}
      >
        {/* Background slides — all rendered for instant preload, crossfade via opacity */}
        {displaySlides.map((s, i) => {
          // heroReady guarantees first image is painted; serve src to all slides immediately for decode
          const shouldHaveSrc =
            heroReady || i === safeIdx || i < activatedCount;
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
              animate={{ opacity: i === safeIdx ? 1 : 0 }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
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
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(10,10,10,0.06) 0%, rgba(10,10,10,0.30) 50%, rgba(10,10,10,0.68) 100%)",
                }}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full container-wide">
        {/* Fixed brand message — stays constant across all slide transitions */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <p className="font-sans text-[10px] tracking-[0.32em] uppercase text-white/55 mb-6">
            Where Your Light Shines
          </p>
          <h1
            className="font-display font-light text-white mb-7"
            style={{
              fontSize: "clamp(2rem, 4.5vw, 4.5rem)",
              letterSpacing: "-0.02em",
              lineHeight: "1.1",
              wordBreak: "keep-all",
              maxWidth: "26rem",
            }}
          >
            당신의 가장 빛나는 순간을 담는 캔버스, 더릿
          </h1>
          <p
            className="font-sans text-[13px] md:text-[14px] text-white/60 leading-relaxed tracking-[0.01em]"
            style={{ maxWidth: "30rem" }}
          >
            하남 미사의 자연 속, 프라이빗 하우스 웨딩부터 글로벌 K-콘텐츠까지.{" "}
            최고의 기획자들이 선택한 프리미엄 베뉴, THE LIT.
          </p>
        </div>

        {/* Slide indicators */}
        <div className="flex items-center justify-center gap-3 hero-content-pad">
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
