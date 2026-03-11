import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import AnimatedSection from '../common/AnimatedSection'

const pillars = [
  { label: '전시', en: 'Exhibition' },
  { label: '공연', en: 'Performance' },
  { label: '강연', en: 'Lecture' },
  { label: '워크숍', en: 'Workshop' },
  { label: '촬영', en: 'Photoshoot' },
  { label: '브랜드 행사', en: 'Brand Event' },
]

export default function BrandIntroSection() {
  return (
    <section className="section-padding bg-brand-cream">
      <div className="container-wide">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left — text */}
          <div>
            <AnimatedSection animation="fade-up">
              <p className="eyebrow mb-5">Our Philosophy</p>
              <h2 className="font-display font-light text-brand-black mb-7"
                 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '-0.03em', lineHeight: '1.08' }}>
                문화가 숨쉬는<br />
                <em style={{ fontStyle: 'normal', color: '#C8A97E' }}>공간의 힘</em>
              </h2>
              <p className="font-sans text-[15px] text-brand-muted leading-relaxed mb-5">
                더릿(The Lit)은 서울 한복판에서 문화와 예술, 그리고 사람이 만나는
                복합문화공간입니다. 단순한 장소가 아닌, 창의적 에너지가 교류하고
                새로운 이야기가 시작되는 플랫폼입니다.
              </p>
              <p className="font-sans text-[15px] text-brand-muted leading-relaxed mb-12">
                전시부터 공연, 강연, 워크숍, 브랜드 이벤트까지 — 모든 문화 활동을
                위한 최적의 환경을 제공합니다.
              </p>
              <Link to="/about" className="btn-ghost text-brand-black">
                더 알아보기 <ArrowRight size={14} />
              </Link>
            </AnimatedSection>
          </div>

          {/* Right — program types + image */}
          <div>
            <AnimatedSection animation="fade-up" delay={150}>
              <div className="relative pb-8 sm:pb-10">
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
                  alt="The Lit 공간"
                  className="w-full aspect-[4/5] object-cover"
                />
                {/* Floating card — 모바일에서 이미지 하단 붙임, sm+에서 네거티브 오프셋 */}
                <div className="absolute bottom-0 left-0 sm:-bottom-2 sm:-left-8 bg-brand-black py-6 px-7 sm:py-7 sm:px-8 max-w-[240px] sm:max-w-[260px]">
                  <p className="font-sans text-[9px] tracking-[0.22em] uppercase text-white/30 mb-4">
                    What We Do
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pillars.map((p) => (
                      <span
                        key={p.en}
                        className="font-sans text-[11px] text-white/70 bg-white/10 px-3 py-1.5 leading-none"
                      >
                        {p.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  )
}
