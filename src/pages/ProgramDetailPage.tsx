import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, ArrowRight, Calendar, MapPin, Users, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useProgram } from '../hooks/useData'
import AnimatedSection from '../components/common/AnimatedSection'
import LoadingSpinner from '../components/common/LoadingSpinner'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FALLBACK: Record<string, any> = {
  'exhibition-spring-2026': {
    id: '1', slug: 'exhibition-spring-2026', title: '봄 기억 — 사진전', title_en: 'Spring Memory — Photography',
    category: 'exhibition', status: 'upcoming', start_date: '2026-03-15', end_date: '2026-04-15',
    location: '스토리지', organizer: 'The Lit Curation Team',
    description: `봄의 기억은 언제나 특별합니다. 

이번 전시 『봄 기억』은 일상 속 봄의 순간—벚꽃 아래 스쳐 지나가는 사람들, 창문으로 들어오는 따스한 빛, 공원에서 웃음 짓는 아이들—을 섬세하게 포착한 사진 작품들로 구성됩니다.

참여 작가 7인이 각자의 시선으로 바라본 봄의 이야기가 더릿 스토리지 공간을 가득 채울 예정입니다. 사진 한 장 한 장에 담긴 봄의 온기를 느껴보세요.

관람은 무료이며, 오프닝 리셉션은 3월 15일 오후 6시에 진행됩니다.`,
    poster_image: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=1200&q=80',
    is_free: false, price: 8000, max_participants: null, reservation_link: 'https://thelit.kr/reservation',
    tags: ['사진', '봄', '전시', '그룹전'],
  },
}

export default function ProgramDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: program, isLoading } = useProgram(slug ?? '')
  const displayProgram = program ?? FALLBACK[slug ?? '']

  if (isLoading) return <LoadingSpinner />
  if (!displayProgram) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="font-display text-2xl text-brand-muted mb-4">프로그램을 찾을 수 없습니다</p>
        <Link to="/programs" className="btn-secondary">← Programs</Link>
      </div>
    </div>
  )

  const isActive = ['upcoming', 'ongoing'].includes(displayProgram.status)

  return (
    <>
      <Helmet>
        <title>{displayProgram.title} — The Lit</title>
        <meta name="description" content={displayProgram.description?.substring(0, 160)} />
        <meta property="og:image" content={displayProgram.poster_image} />
      </Helmet>

      {/* Hero */}
      <div className="pt-20 bg-brand-cream">
        <div className="container-wide py-12 lg:py-16">
          <Link to="/programs" className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-black transition-colors mb-8">
            <ArrowLeft size={15} /> Programs
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Poster */}
            <AnimatedSection animation="fade-up">
              <img
                src={displayProgram.poster_image}
                alt={displayProgram.title}
                className="w-full aspect-[3/4] object-cover max-h-[600px]"
              />
            </AnimatedSection>

            {/* Info */}
            <AnimatedSection animation="fade-up" delay={100}>
              <div className="lg:sticky lg:top-24">
                <p className="eyebrow mb-3">{displayProgram.title_en}</p>
                <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-light text-brand-black leading-tight mb-6">
                  {displayProgram.title}
                </h1>

                <div className="space-y-3 mb-8 pb-8 border-b border-brand-border">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar size={15} className="text-brand-accent shrink-0" />
                    <span className="text-brand-muted">
                      {format(new Date(displayProgram.start_date), 'yyyy.M.d (EEE)', { locale: ko })}
                      {displayProgram.start_date !== displayProgram.end_date && (
                        <> — {format(new Date(displayProgram.end_date), 'M.d (EEE)', { locale: ko })}</>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin size={15} className="text-brand-accent shrink-0" />
                    <span className="text-brand-muted">더릿 {displayProgram.location}</span>
                  </div>
                  {displayProgram.max_participants && (
                    <div className="flex items-center gap-3 text-sm">
                      <Users size={15} className="text-brand-accent shrink-0" />
                      <span className="text-brand-muted">최대 {displayProgram.max_participants}명</span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="mb-8">
                  <p className="eyebrow mb-2">참가비</p>
                  <p className="font-display text-3xl font-light text-brand-black">
                    {displayProgram.is_free ? '무료' : `${displayProgram.price?.toLocaleString()}원`}
                  </p>
                </div>

                {/* CTA */}
                {isActive && (
                  <div className="flex flex-col gap-3">
                    {displayProgram.reservation_link ? (
                      <a
                        href={displayProgram.reservation_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary justify-center"
                      >
                        예약하기 <ExternalLink size={15} />
                      </a>
                    ) : (
                      <Link to="/contact" className="btn-primary justify-center">
                        참가 문의 <ArrowRight size={15} />
                      </Link>
                    )}
                  </div>
                )}

                {/* Tags */}
                {displayProgram.tags?.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {displayProgram.tags.map((tag: string) => (
                      <span key={tag} className="tag">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>

      {/* Description */}
      <section className="section-padding bg-brand-white">
        <div className="container-narrow">
          <AnimatedSection animation="fade-up">
            <div className="prose prose-neutral max-w-none font-sans text-brand-muted leading-relaxed whitespace-pre-line">
              {displayProgram.description}
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
