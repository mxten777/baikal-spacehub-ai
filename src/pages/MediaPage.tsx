import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Play } from 'lucide-react'
import { useMedia } from '../hooks/useData'
import AnimatedSection from '../components/common/AnimatedSection'
import LoadingSpinner from '../components/common/LoadingSpinner'

const PLATFORMS = [
  { value: 'all' as const, label: '전체' },
  { value: 'youtube' as const, label: 'YouTube' },
  { value: 'instagram' as const, label: 'Instagram' },
  { value: 'x' as const, label: 'X (Twitter)' },
]

const FALLBACK_MEDIA = [
  { id: '1', platform: 'youtube' as const, url: 'https://youtube.com/watch?v=ex1', title: '더릿 스페이스 투어 | The Lit Space Tour 2026', thumbnail_url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80', published_at: '2026-02-01', is_featured: false, sort_order: 0, created_at: '' },
  { id: '2', platform: 'instagram' as const, url: 'https://instagram.com/p/ex2', title: '봄 전시 오프닝 현장', thumbnail_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80', published_at: '2026-01-25', is_featured: false, sort_order: 1, created_at: '' },
  { id: '3', platform: 'youtube' as const, url: 'https://youtube.com/watch?v=ex3', title: '재즈 나이트 하이라이트 | Jazz Night Highlight', thumbnail_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80', published_at: '2026-01-15', is_featured: false, sort_order: 2, created_at: '' },
  { id: '4', platform: 'instagram' as const, url: 'https://instagram.com/p/ex4', title: '도예 워크숍 스냅샷', thumbnail_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', published_at: '2026-01-10', is_featured: false, sort_order: 3, created_at: '' },
  { id: '5', platform: 'x' as const, url: 'https://x.com/thelit/status/ex5', title: '더릿 뉴스레터 — 2026 봄 프로그램 라인업 공개', thumbnail_url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80', published_at: '2026-01-05', is_featured: false, sort_order: 4, created_at: '' },
  { id: '6', platform: 'youtube' as const, url: 'https://youtube.com/watch?v=ex6', title: '더릿 가든 — 겨울에서 봄으로', thumbnail_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80', published_at: '2025-12-20', is_featured: false, sort_order: 5, created_at: '' },
]

const PLATFORM_BADGE: Record<string, { label: string; cls: string }> = {
  youtube: { label: 'YouTube', cls: 'bg-red-600' },
  instagram: { label: 'Instagram', cls: 'bg-purple-600' },
  x: { label: 'X', cls: 'bg-black' },
}

export default function MediaPage() {
  const [activePlatform, setActivePlatform] = useState<'all' | 'youtube' | 'instagram' | 'x'>('all')
  const { data: media, isLoading } = useMedia(activePlatform === 'all' ? undefined : activePlatform, 24)
  const items = media && media.length > 0 ? media : FALLBACK_MEDIA
  const filtered = activePlatform === 'all' ? items : items.filter(m => m.platform === activePlatform)

  return (
    <>
      <Helmet>
        <title>Media — The Lit</title>
        <meta name="description" content="더릿의 YouTube, Instagram, X 채널에서 최신 미디어 콘텐츠를 만나보세요." />
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-16 bg-brand-white">
        <div className="container-wide">
          <AnimatedSection animation="fade-up">
            <p className="eyebrow mb-4">Media</p>
            <h1 className="font-display text-display font-light text-brand-black mb-6">
              미디어 허브
            </h1>
            <p className="font-sans text-base text-brand-muted max-w-xl">
              더릿의 다양한 채널에서 공간과 문화 이야기를 경험하세요.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Platform filter */}
      <div className="border-b border-brand-border">
        <div className="container-wide py-4 flex items-center gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.value}
              onClick={() => setActivePlatform(p.value)}
              className={`shrink-0 px-5 py-2 font-sans text-xs font-medium tracking-widest uppercase transition-all
                ${activePlatform === p.value ? 'bg-brand-black text-white' : 'bg-brand-cream text-brand-muted hover:text-brand-black'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <section className="section-padding bg-brand-white">
        <div className="container-wide">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item, i) => {
                const badge = PLATFORM_BADGE[item.platform]
                const isVideo = item.platform === 'youtube'
                return (
                  <AnimatedSection key={item.id} animation="fade-up" delay={i * 50}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative overflow-hidden block aspect-video bg-brand-warm"
                    >
                      <img
                        src={item.thumbnail_url ?? undefined}
                        alt={item.title ?? undefined}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300" />
                      {isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Play size={20} className="text-white ml-1" />
                          </div>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className={`font-sans text-[9px] font-medium px-2 py-1 text-white ${badge?.cls}`}>
                          {badge?.label}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <p className="font-sans text-sm font-medium text-white line-clamp-2">{item.title}</p>
                      </div>
                    </a>
                  </AnimatedSection>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
