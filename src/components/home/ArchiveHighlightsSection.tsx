import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useArchive } from '../../hooks/useData'
import AnimatedSection from '../common/AnimatedSection'
import SectionHeader from '../common/SectionHeader'

const FALLBACK_ARCHIVE = [
  {
    id: '1', slug: 'winter-exhibition-2025', title: '겨울 빛 — 설치 전시',
    held_date: '2025-12-01', cover_image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80',
    category: 'exhibition',
  },
  {
    id: '2', slug: 'autumn-concert-2025', title: '가을 콘서트 2025',
    held_date: '2025-10-15', cover_image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80',
    category: 'performance',
  },
  {
    id: '3', slug: 'brand-event-samsung', title: '삼성 브랜드 런칭',
    held_date: '2025-09-20', cover_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
    category: 'event',
  },
  {
    id: '4', slug: 'photo-workshop-2025', title: '필름 사진 워크숍',
    held_date: '2025-08-10', cover_image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=600&q=80',
    category: 'workshop',
  },
]

export default function ArchiveHighlightsSection() {
  const { data: archives } = useArchive({ limit: 4, featured: true })
  const items = archives && archives.length > 0 ? archives : FALLBACK_ARCHIVE

  return (
    <section className="section-padding bg-brand-cream">
      <div className="container-wide">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <SectionHeader
            eyebrow="Archive"
            title="지나온 순간들"
            subtitle="더릿에서 펼쳐진 소중한 문화 행사들의 기록"
          />
          <Link to="/archive" className="btn-ghost text-brand-black shrink-0 self-end mb-1">
            Full Archive <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
          {items.map((item, i) => (
            <AnimatedSection
              key={item.id}
              animation="fade-up"
              delay={i * 80}
              className={i === 0 ? 'col-span-2 row-span-2' : ''}
            >
              <Link
                to={`/archive/${item.slug}`}
                className={`group relative overflow-hidden block ${
                  i === 0 ? 'aspect-[4/3]' : 'aspect-square'
                }`}
              >
                <img
                  src={item.cover_image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
                  <h3 className="font-display font-light text-white" style={{ fontSize: i === 0 ? '1.25rem' : '0.95rem', letterSpacing: '-0.01em' }}>{item.title}</h3>
                  <p className="font-sans text-[10px] tracking-[0.1em] text-white/50 mt-1.5">{item.held_date?.substring(0, 7)}</p>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
