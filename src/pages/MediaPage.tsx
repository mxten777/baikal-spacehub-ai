import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Play, ExternalLink } from 'lucide-react'
import { useMedia } from '../hooks/useData'
import { useExternalContents } from '../hooks/useData'
import AnimatedSection from '../components/common/AnimatedSection'
import LoadingSpinner from '../components/common/LoadingSpinner'
import type { ContentPlatform } from '../types'

const PLATFORMS: Array<{ value: 'all' | ContentPlatform; label: string }> = [
  { value: 'all', label: '?꾩껜' },
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

  // external_contents媛 二??곗씠???뚯뒪 (?섏쭛??肄섑뀗痢?
  const { data: externalItems = [], isLoading: externalLoading } = useExternalContents({
    platform: activePlatform === 'all' ? undefined : activePlatform,
    limit: 24,
  })

  // 湲곗〈 media_items??蹂묐젹 議고쉶 (?섏쐞 ?명솚)
  const { data: legacyMedia = [], isLoading: legacyLoading } = useMedia(
    activePlatform === 'all' || activePlatform === 'rss' ? undefined : activePlatform,
    12
  )

  const isLoading = externalLoading || legacyLoading

  // external_contents ?곗꽑, ?놁쑝硫?legacy media_items濡?fallback
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
        <title>Media ??The Lit</title>
        <meta name="description" content="?붾┸??YouTube, Instagram, X, 釉붾줈洹?肄섑뀗痢좊? ?쒓납?먯꽌 紐⑥븘蹂댁꽭??" />
        <meta property="og:title" content="Media ??The Lit" />
        <meta property="og:description" content="?붾┸??誘몃뵒???덈툕?먯꽌 ?ㅼ뼇??梨꾨꼸??理쒖떊 肄섑뀗痢좊? 留뚮굹蹂댁꽭??" />
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-16 bg-brand-white">
        <div className="container-wide">
          <AnimatedSection animation="fade-up">
            <p className="eyebrow mb-4">Media</p>
            <h1 className="font-display text-display font-light text-brand-black mb-6">
              誘몃뵒???덈툕
            </h1>
            <p className="font-sans text-base text-brand-muted max-w-xl">
              ?붾┸???ㅼ뼇??梨꾨꼸?먯꽌 怨듦컙怨?臾명솕 ?댁빞湲곕? 寃쏀뿕?섏꽭??
              YouTube, Instagram, X, 釉붾줈洹?肄섑뀗痢좉? ??怨녹뿉???ㅼ떆媛??낅뜲?댄듃?⑸땲??
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Platform filter */}
      <div className="border-b border-brand-border">
        <div className="container-wide py-4 flex items-center gap-2 overflow-x-auto">
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
              {items.length}媛?
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
                ?꾩옱 ?쒖떆??肄섑뀗痢좉? ?놁뒿?덈떎.
              </p>
              <p className="font-sans text-xs mt-2 text-gray-300">
                愿由ъ옄 ?섏씠吏?먯꽌 ?뚯뒪瑜?異붽??섍퀬 ?섏쭛???ㅽ뻾?섏꽭??
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

