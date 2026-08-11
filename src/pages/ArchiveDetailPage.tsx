import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { archiveService } from "../services/archive";
import AnimatedSection from "../components/common/AnimatedSection";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import SeoHead from "../components/common/SeoHead";
import { SITE_URL, DEFAULT_OG_IMAGE, breadcrumbJsonLd } from "../lib/seo";
import { youtubeService, loadYouTubeAPI } from "../services/media";

const CATEGORY_LABELS: Record<string, string> = {
  exhibition: "전시",
  performance: "공연",
  lecture: "강연",
  workshop: "워크숍",
  event: "이벤트",
};

export default function ArchiveDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [ytModal, setYtModal] = useState<{ id: string; isShorts: boolean; coverUrl?: string } | null>(null);
  const [ytPlaying, setYtPlaying] = useState(false);
  const playerRef = useRef<YT.Player | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ytModal) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setYtModal(null); setYtPlaying(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [ytModal]);

  useEffect(() => {
    if (!ytModal || !ytPlaying) return;
    let cancelled = false;
    loadYouTubeAPI().then(() => {
      if (cancelled || !playerContainerRef.current) return;
      const YTApi = window.YT!;
      const target = document.createElement('div');
      playerContainerRef.current.appendChild(target);
      const p = new YTApi.Player(target, {
        videoId: ytModal.id,
        width: '100%',
        height: '100%',
        playerVars: { autoplay: 1, rel: 0, playsinline: 1 },
        events: {
          onReady: (event) => {
            event.target.getIframe().setAttribute('allow', 'autoplay; encrypted-media; fullscreen');
          },
          onStateChange: (event) => {
            if (event.data === YTApi.PlayerState.ENDED) {
              setYtPlaying(false);
            }
          },
        },
      });
      playerRef.current = p;
    });
    return () => {
      cancelled = true;
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch { /* ignore */ }
        playerRef.current = null;
      }
    };
  }, [ytModal, ytPlaying]);

  const { data: item, isLoading } = useQuery({
    queryKey: ["archive", slug],
    queryFn: () => archiveService.getBySlug(slug!),
    enabled: !!slug,
  });

  const allImages: string[] = [];
  if (item?.cover_image_url) allImages.push(item.cover_image_url);
  if (item?.images) {
    item.images.forEach((url) => {
      if (url && !allImages.includes(url)) allImages.push(url);
    });
  }

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () =>
    setLightboxIndex((i) =>
      i === null ? null : (i - 1 + allImages.length) % allImages.length,
    );
  const nextImage = () =>
    setLightboxIndex((i) => (i === null ? null : (i + 1) % allImages.length));

  if (isLoading) {
    return (
      <div className="pt-32 flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="pt-32 text-center min-h-screen">
        <p className="text-brand-black/50">아카이브 항목을 찾을 수 없습니다.</p>
        <Link to="/archive" className="mt-4 inline-block text-sm underline">
          목록으로
        </Link>
      </div>
    );
  }

  return (
    <>
      <SeoHead
        title={`${item.title} — The Lit Archive`}
        description={item.description ?? "더릿 아카이브"}
        canonical={`${SITE_URL}/archive/${item.slug}`}
        image={item.cover_image_url || DEFAULT_OG_IMAGE}
        jsonLd={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Archive", url: `${SITE_URL}/archive` },
          { name: item.title, url: `${SITE_URL}/archive/${item.slug}` },
        ])}
      />

      {/* Hero */}
      {item.cover_image_url && (
        <div className="relative w-full aspect-[16/7] overflow-hidden bg-brand-black">
          <img
            src={item.cover_image_url}
            alt={item.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 container-wide pb-12 pt-32">
            <p className="font-sans text-[10px] tracking-widest uppercase text-white/50 mb-2">
              {item.date?.substring(0, 7)} ·{" "}
              {CATEGORY_LABELS[item.category] ?? item.category}
              {item.subcategory ? ` · ${item.subcategory}` : ""}
            </p>
            <h1 className="font-display text-4xl lg:text-5xl font-light text-white">
              {item.title}
            </h1>
          </div>
        </div>
      )}

      {/* No cover fallback header */}
      {!item.cover_image_url && (
        <section className="pt-32 pb-12 bg-brand-black">
          <div className="container-wide">
            <p className="font-sans text-[10px] tracking-widest uppercase text-white/50 mb-2">
              {item.date?.substring(0, 7)} ·{" "}
              {CATEGORY_LABELS[item.category] ?? item.category}
              {item.subcategory ? ` · ${item.subcategory}` : ""}
            </p>
            <h1 className="font-display text-4xl lg:text-5xl font-light text-white">
              {item.title}
            </h1>
          </div>
        </section>
      )}

      {/* Back + description */}
      <section className="section-padding bg-brand-white">
        <div className="container-wide max-w-3xl">
          <AnimatedSection animation="fade-up">
            <Link
              to="/archive"
              className="inline-flex items-center gap-1 text-xs tracking-widest uppercase text-brand-black/40 hover:text-brand-black mb-8 transition-colors"
            >
              <ChevronLeft size={14} /> 아카이브 목록
            </Link>
            {item.description && (
              <p className="font-sans text-base text-brand-black/70 leading-relaxed mb-8">
                {item.description}
              </p>
            )}
          </AnimatedSection>
        </div>
      </section>

      {/* 동영상 보기 버튼 */}
      {item.media_type === "video" && item.video_url && (
        <section className="pb-16 bg-brand-white">
          <div className="container-wide max-w-3xl">
            <AnimatedSection animation="fade-up">
              {youtubeService.extractVideoId(item.video_url) ? (
                <button
                  onClick={() => {
                    setYtModal({ id: youtubeService.extractVideoId(item.video_url!)!, isShorts: item.video_url!.includes('/shorts/'), coverUrl: item.cover_image_url ?? undefined });
                    setYtPlaying(true);
                  }}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-brand-black text-white font-sans text-sm tracking-widest uppercase hover:bg-brand-charcoal transition-colors cursor-pointer"
                >
                  <Play size={16} fill="currentColor" />
                  영상 보기
                </button>
              ) : (
                <>
                  <a
                    href={item.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-brand-black text-white font-sans text-sm tracking-widest uppercase hover:bg-brand-charcoal transition-colors"
                  >
                    <Play size={16} fill="currentColor" />
                    영상 보기
                  </a>
                  <p className="mt-3 text-xs text-brand-muted font-sans">
                    외부 플랫폼에서 재생됩니다.
                  </p>
                </>
              )}
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Gallery grid */}
      {allImages.length > 1 && (
        <section className="pb-24 bg-brand-white">
          <div className="container-wide">
            <AnimatedSection animation="fade-up">
              <p className="font-sans text-xs tracking-widest uppercase text-brand-black/30 mb-6">
                Gallery · {allImages.length}
              </p>
            </AnimatedSection>
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
              {allImages.map((url, idx) => (
                <AnimatedSection key={idx} animation="fade-up" delay={idx * 40}>
                  <button
                    onClick={() => openLightbox(idx)}
                    className="block w-full overflow-hidden group"
                  >
                    <img
                      src={url}
                      alt={`${item.title} ${idx + 1}`}
                      className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </button>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X size={28} />
          </button>

          {/* Counter */}
          <p className="absolute top-5 left-1/2 -translate-x-1/2 text-white/40 text-xs tracking-widest">
            {lightboxIndex + 1} / {allImages.length}
          </p>

          {/* Prev */}
          {allImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 text-white/60 hover:text-white transition-colors"
            >
              <ChevronLeft size={36} />
            </button>
          )}

          {/* Image */}
          <img
            src={allImages[lightboxIndex]}
            alt=""
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          {allImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 text-white/60 hover:text-white transition-colors"
            >
              <ChevronRight size={36} />
            </button>
          )}
        </div>
      )}

      {ytModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-6"
          onClick={() => { setYtModal(null); setYtPlaying(false); }}
        >
          {ytModal.isShorts ? (
            <div
              className="flex flex-col items-end"
              style={{ width: 'min(44vh, 86vw)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => { setYtModal(null); setYtPlaying(false); }}
                className="mb-2 text-white/70 hover:text-white transition-colors"
                aria-label="닫기"
              >
                <X size={28} />
              </button>
              <div className="w-full aspect-[9/16]">
                {ytPlaying ? (
                  <div ref={playerContainerRef} className="w-full h-full" />
                ) : (
                  <button
                    onClick={() => setYtPlaying(true)}
                    className="w-full h-full relative flex items-center justify-center group bg-brand-black"
                  >
                    {ytModal.coverUrl && (
                      <img src={ytModal.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                    )}
                    <div className="relative z-10 w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:bg-black/80 transition-colors">
                      <Play size={22} className="text-white ml-1" fill="currentColor" />
                    </div>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div
              className="flex flex-col items-end w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => { setYtModal(null); setYtPlaying(false); }}
                className="mb-2 text-white/70 hover:text-white transition-colors"
                aria-label="닫기"
              >
                <X size={28} />
              </button>
              <div className="w-full aspect-video">
                {ytPlaying ? (
                  <div ref={playerContainerRef} className="w-full h-full" />
                ) : (
                  <button
                    onClick={() => setYtPlaying(true)}
                    className="w-full h-full relative flex items-center justify-center group bg-brand-black"
                  >
                    {ytModal.coverUrl && (
                      <img src={ytModal.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                    )}
                    <div className="relative z-10 w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:bg-black/80 transition-colors">
                      <Play size={22} className="text-white ml-1" fill="currentColor" />
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
