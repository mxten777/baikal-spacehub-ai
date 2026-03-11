import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Play, ExternalLink } from 'lucide-react'
import { useMedia } from '../hooks/useData'
import { useExternalContents } from '../hooks/useData'
import AnimatedSection from '../components/common/AnimatedSection'
import LoadingSpinner from '../components/common/LoadingSpinner'
import type { ContentPlatform } from '../types'

const PLATFORMS: Array<{ value: 'all' | ContentPlatform; label: string }> = [
  { value: 'all', label: '전체' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'rss', label: 'Blog RSS' },
]

const PLATFORM_BADGE: Record<string, { label: string; cls: string }> = {
  youtube: { label: 'YouTube', cls: 'bg-red-600' },
  instagram: { label: 'Instagram', cls: 'bg-purple-600' },
  x: { label: 'X', cls: 'bg-black' },
  rss: { label: 'Blog', cls: 'bg-orange-500' },
}

export default function MediaPage() {
  const [activePlatform, setActivePlatform] = useState<'all' | ContentPlatform>('all')

  // external_contents가 주요 데이터 소스 (수집된 콘텐츠)
  const { data: externalItems = [], isLoading: externalLoading } = useExternalContents({
    platform: activePlatform === 'all' ? undefined : activePlatform,
    limit: 24,
  })

  // 기존 media_items도 병렬 조회 (하위 호환)
  const { data: legacyMedia = [], isLoading: legacyLoading } = useMedia(
    activePlatform === 'all' || activePlatform === 'rss' ? undefined : activePlatform,
    12
  )

  const isLoading = externalLoading || legacyLoading

  // external_contents 우선, 없으면 legacy media_items로 fallback
  const items =
    externalItems.length > 0
      ? externalItems
      : legacyMedia.map((m) => ({
          id: m.id,
          platform: m.platform as ContentPlatform,
          external_url: m.url,
          title: m.title ?? null,
          summary: m.description ?? null,
          thumbnail_url: m.thumbnail_url ?? null,
          published_at: m.published_at ?? null,
          visibility_status: 'published' as const,
          is_featured: m.is_featured,
          category: null,
          external_id: m.platform_id ?? m.id,
          fetched_at: m.created_at,
          created_at: m.created_at,
          updated_at: m.updated_at ?? m.created_at,
        }))

  return (
    <>
      <Helmet>
        <title>Media — The Lit</title>
        <meta name="description" content="더릿의 YouTube, Instagram, X, 블로그 RSS에서 실시간으로 업데이트됩니다." />
        <meta property="og:title" content="Media — The Lit" />
        <meta property="og:description" content="더릿의 미디어 피드에서 최신 영상과 다양한 콘텐츠를 만나보세요." />
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-16 bg-brand-white">
        <div className="container-wide">
          <AnimatedSection animation="fade-up">
            <p className="eyebrow mb-4">Media</p>
            <h1 className="font-display text-display font-light text-brand-black mb-6">
              미디어 피드
            </h1>
            <p className="font-sans text-base text-brand-muted max-w-xl">
              더릿이 활동하는 공간에서 문화와 예술을 위한 콘텐츠를 소개합니다.
              YouTube, Instagram, X, 블로그 RSS의 각 채널에서 실시간으로 업데이트됩니다.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Platform filter */}
      <div className="border-b border-brand-border">
        <div className="container-wide py-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {PLATFORMS.map((p) => (
            <button
              key={p.value}
              onClick={() => setActivePlatform(p.value)}
              className={`shrink-0 px-5 py-2 font-sans text-xs font-medium tracking-widest uppercase transition-all
                ${activePlatform === p.value
                  ? 'bg-brand-black text-white'
                  : 'bg-brand-cream text-brand-muted hover:text-brand-black'}`}
            >
              {p.label}
            </button>
          ))}
          {items.length > 0 && (
            <span className="ml-auto shrink-0 font-sans text-xs text-gray-400">
              {items.length}개
            </span>
          )}
        </div>
      </div>

      {/* Grid */}
      <section className="section-padding bg-brand-white">
        <div className="container-wide">
          {isLoading ? (
            <LoadingSpinner />
          ) : items.length === 0 ? (
            <div className="text-center py-24 text-brand-muted">
              <p className="font-sans text-sm">
                현재 표시할 콘텐츠가 없습니다.
              </p>
              <p className="font-sans text-xs mt-2 text-gray-300">
                관리자 페이지에서 소스를 추가하고 수집을 실행하세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((item, i) => {
                const badge = PLATFORM_BADGE[item.platform]
                const isVideo = item.platform === 'youtube'
                const isText = item.platform === 'x' || item.platform === 'rss'

                return (
                  <AnimatedSection key={item.id} animation="fade-up" delay={i * 40}>
                    <a
                      href={item.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative overflow-hidden block bg-brand-warm hover:shadow-md transition-shadow"
                    >
                      {/* Thumbnail or text card */}
                      {!isText && item.thumbnail_url ? (
                        <div className="relative aspect-video overflow-hidden">
                          <img
                            src={item.thumbnail_url}
                            alt={item.title ?? undefined}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
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
                            <p className="font-sans text-sm font-medium text-white line-clamp-2">
                              {item.title}
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* Text-only card (X, RSS without image) */
                        <div className="p-5 min-h-[120px] flex flex-col justify-between">
                          <div>
                            <span className={`font-sans text-[9px] font-medium px-2 py-1 text-white ${badge?.cls} inline-block mb-3`}>
                              {badge?.label}
                            </span>
                            <p className="font-sans text-sm font-medium text-brand-black line-clamp-3">
                              {item.title ?? item.summary}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            {item.published_at && (
                              <span className="text-xs text-gray-400">
                                {new Date(item.published_at).toLocaleDateString('ko-KR')}
                              </span>
                            )}
                            <ExternalLink size={12} className="text-gray-300 group-hover:text-brand-black transition-colors" />
                          </div>
                        </div>
                      )}
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

