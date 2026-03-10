import { Helmet } from 'react-helmet-async'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import AnimatedSection from '../components/common/AnimatedSection'

const timeline = [
  { year: '2018', title: '더릿의 시작', desc: '서울 연남동의 낡은 창고를 문화공간으로 변신시키며 더릿의 여정이 시작되었습니다.' },
  { year: '2020', title: '카페 & 가든 오픈', desc: '커뮤니티 중심의 카페와 야외 가든을 추가하며 복합문화공간으로 성장했습니다.' },
  { year: '2022', title: '스튜디오 & 스토리지', desc: '전문 촬영 스튜디오와 대형 다목적 홀 스토리지를 완성해 전면 복합문화공간이 되었습니다.' },
  { year: '2024', title: '더릿 플랫폼화', desc: '물리적 공간을 넘어 디지털 플랫폼으로 확장, 더 많은 문화 크리에이터와 연결됩니다.' },
]

const values = [
  { icon: '✦', title: '개방성', desc: '누구에게나 열려있는 공간. 다양한 배경과 관심사를 가진 사람들이 교류하는 곳입니다.' },
  { icon: '✦', title: '지속성', desc: '일회성 이벤트가 아닌, 지속 가능한 문화 생태계를 만들어갑니다.' },
  { icon: '✦', title: '진정성', desc: '상업적 논리보다 진정한 문화적 가치를 우선합니다.' },
  { icon: '✦', title: '공동체', desc: '공간을 통해 사람들이 연결되고, 함께 성장하는 커뮤니티를 지향합니다.' },
]

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About — The Lit</title>
        <meta name="description" content="더릿(The Lit)의 이야기, 철학, 그리고 비전을 소개합니다. 2018년 시작된 서울의 프리미엄 복합문화공간 플랫폼." />
      </Helmet>

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px]">
        <img
          src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1920&q=80"
          alt="The Lit"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-overlay-center" />
        <div className="absolute inset-0 flex flex-col justify-end container-wide pb-16">
          <AnimatedSection animation="fade-up">
            <p className="eyebrow text-white/60 mb-3">About The Lit</p>
            <h1 className="font-display text-display font-light text-white leading-tight">
              문화의 불꽃을<br />
              <em>켜는 공간</em>
            </h1>
          </AnimatedSection>
        </div>
      </section>

      {/* Mission statement */}
      <section className="section-padding bg-brand-cream">
        <div className="container-narrow text-center">
          <AnimatedSection animation="fade-up">
            <p className="eyebrow mb-6">Our Mission</p>
            <blockquote className="font-display text-[clamp(1.5rem,3vw,2.5rem)] font-light text-brand-black leading-relaxed mb-8">
              "더릿은 예술가, 크리에이터, 브랜드, 그리고 문화를 사랑하는 모든 이들이
              자신의 이야기를 펼칠 수 있는 최적의 무대를 제공합니다."
            </blockquote>
            <p className="font-sans text-base text-brand-muted leading-relaxed">
              2018년, 서울 연남동의 낡은 빈 창고에서 시작된 더릿은 지금 이 도시에서
              가장 활발한 문화 허브 중 하나가 되었습니다.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Story + Timeline */}
      <section className="section-padding bg-brand-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <AnimatedSection animation="slide-left">
              <p className="eyebrow mb-4">Our Story</p>
              <h2 className="font-display text-headline font-light text-brand-black mb-6">
                작은 창고에서<br />복합문화공간으로
              </h2>
              <p className="font-sans text-sm text-brand-muted leading-relaxed mb-4">
                더릿(The Lit)의 이름은 '불을 밝히다(to light)'에서 왔습니다.
                어두운 공간에 빛을 더하듯, 더릿은 사람들의 창의적 에너지에
                적절한 공간과 환경을 제공합니다.
              </p>
              <p className="font-sans text-sm text-brand-muted leading-relaxed mb-4">
                한때 낡고 버려진 창고였던 이 공간은 이제 전시, 공연, 강연,
                촬영 등 다양한 문화 활동의 터전이 되었습니다.
              </p>
              <p className="font-sans text-sm text-brand-muted leading-relaxed">
                우리는 단순히 공간을 임대하는 것이 아니라, 문화적 경험을 함께
                설계하고 실현하는 파트너입니다.
              </p>
            </AnimatedSection>

            {/* Timeline */}
            <AnimatedSection animation="slide-right" delay={100}>
              <div className="space-y-0">
                {timeline.map((item, i) => (
                  <div key={item.year} className="flex gap-6 pb-10 relative">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-brand-black flex items-center justify-center shrink-0 z-10">
                        <span className="font-sans text-[10px] font-medium text-white tracking-wider">{item.year}</span>
                      </div>
                      {i < timeline.length - 1 && <div className="w-px flex-1 mt-2 bg-brand-border" />}
                    </div>
                    <div className="pt-2 pb-2">
                      <h3 className="font-display text-lg font-light text-brand-black mb-1">{item.title}</h3>
                      <p className="font-sans text-sm text-brand-muted leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-brand-black">
        <div className="container-wide">
          <AnimatedSection animation="fade-up" className="text-center mb-16">
            <p className="eyebrow text-white/40 mb-4">Core Values</p>
            <h2 className="font-display text-display font-light text-white">우리가 믿는 것들</h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <AnimatedSection key={v.title} animation="fade-up" delay={i * 80}>
                <div className="p-8 border border-white/10 hover:border-brand-accent transition-colors duration-300">
                  <span className="text-brand-accent text-2xl block mb-4">{v.icon}</span>
                  <h3 className="font-display text-xl font-light text-white mb-3">{v.title}</h3>
                  <p className="font-sans text-sm text-white/50 leading-relaxed">{v.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-cream text-center">
        <div className="container-narrow">
          <AnimatedSection animation="fade-up">
            <h2 className="font-display text-headline font-light text-brand-black mb-4">
              더릿과 함께하세요
            </h2>
            <p className="font-sans text-sm text-brand-muted mb-8">
              공간 대관부터 협업 프로젝트까지, 더릿이 함께합니다.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/programs" className="btn-primary">
                프로그램 보기 <ArrowRight size={16} />
              </Link>
              <Link to="/contact" className="btn-secondary">
                문의하기
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
