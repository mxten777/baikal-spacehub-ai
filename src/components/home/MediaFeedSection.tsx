import { Link } from 'react-router-dom'
import { ArrowRight, Play } from 'lucide-react'
import { useFeaturedMedia } from '../../hooks/useData'
import AnimatedSection from '../common/AnimatedSection'
import SectionHeader from '../common/SectionHeader'

const FALLBACK_MEDIA = [
  {
    id: '1', platform: 'youtube', title: '더릿 스페이스 투어 | The Lit Space Tour',
    thumbnail_url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80',
    media_url: 'https://youtube.com/watch?v=example1', platform_id: 'example1',
  },
  {
    id: '2', platform: 'instagram', title: '봄 전시 오프닝',
    thumbnail_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80',
    media_url: 'https://instagram.com/p/example2', platform_id: 'example2',
  },
  {
    id: '3', platform: 'youtube', title: '재즈 나이트 하이라이트',
    thumbnail_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80',
    media_url: 'https://youtube.com/watch?v=example3', platform_id: 'example3',
  },
]

const PLATFORM_BADGE: Record<string, { label: string; color: string }> = {
  youtube: { label: 'YouTube', color: 'bg-red-600' },
  instagram: { label: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  x: { label: 'X', color: 'bg-black' },
}

export default function MediaFeedSection() {
  const { data: mediaItems } = useFeaturedMedia(6)
  const items = mediaItems && mediaItems.length > 0 ? mediaItems : FALLBACK_MEDIA

  return (
    <section className="section-padding bg-brand-white">
      <div className="container-wide">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <SectionHeader
            eyebrow="Media"
            title="더릿의 이야기"
            subtitle="YouTube, Instagram, X에서 더릿의 다양한 콘텐츠를 만나보세요"
          />
          <Link to="/media" className="btn-ghost text-brand-black shrink-0 self-end mb-1">
            All Media <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {items.slice(0, 3).map((item, i) => {
            const badge = PLATFORM_BADGE[item.platform] ?? PLATFORM_BADGE.youtube
            const isVideo = item.platform === 'youtube'

            return (
              <AnimatedSection key={item.id} animation="fade-up" delay={i * 100}>
                <a
                  href={item.media_url}
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

                  {/* Play button for video */}
                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Play size={20} className="text-white ml-1" />
                      </div>
                    </div>
                  )}

                  {/* Platform badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`font-sans text-[9px] font-medium tracking-widest uppercase text-white px-2 py-1 ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Title */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="font-sans text-sm font-medium text-white line-clamp-2 leading-snug">
                      {item.title}
                    </p>
                  </div>
                </a>
              </AnimatedSection>
            )
          })}
        </div>
      </div>
    </section>
  )
}
