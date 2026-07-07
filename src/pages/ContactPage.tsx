import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Clock, ArrowUpRight, MessageCircle } from 'lucide-react'
import AnimatedSection from '../components/common/AnimatedSection'

// ─── Kakao Channel URL ────────────────────────────────────────────────────────
// TODO: 실제 카카오채널 URL로 교체 (http://pf.kakao.com/_CHANNEL_ID/chat)
const KAKAO_CHANNEL_URL = 'http://pf.kakao.com/_thelit/chat'

const CONTACT = {
  phone:     '1661-0288',
  email:     'goworld33@naver.com',
  address:   '경기도 하남시 미사동 468',
  hours:     '화 — 일  11:00 — 21:00 · 월요일 휴무',
  map:       'https://map.naver.com/v5/search/경기도 하남시 미사동 468',
  instagram: 'https://instagram.com/thelit_official',
  blog:      'https://blog.naver.com/thelit_culture',
}

export default function ContactPage() {
  return (
    <>
      <Helmet>
        <title>Contact — The Lit</title>
        <meta name="description" content="더릿 복합문화공간 — 카카오채널, 전화, 이메일로 빠르게 연락하세요." />
      </Helmet>

      {/* Page header */}
      <section className="pt-32 pb-16 bg-brand-white border-b border-brand-line">
        <div className="container-wide">
          <AnimatedSection animation="fade-up">
            <p className="eyebrow mb-4">Contact</p>
            <h1 className="font-display text-display font-light text-brand-black leading-tight">
              언제든지<br />연락주세요
            </h1>
          </AnimatedSection>
        </div>
      </section>

      <section className="section-padding bg-brand-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

            {/* Left: Channels */}
            <AnimatedSection animation="slide-left">
              <div className="space-y-10">

                {/* Kakao Channel */}
                <div>
                  <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-brand-subtle mb-4">
                    가장 빠른 연락 방법
                  </p>
                  <motion.a
                    href={KAKAO_CHANNEL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-5 p-6 border-2 border-[#FEE500] bg-[#FEE500]/5 hover:bg-[#FEE500]/10 transition-colors group"
                  >
                    <div className="w-14 h-14 bg-[#FEE500] flex items-center justify-center shrink-0">
                      <MessageCircle size={26} className="text-[#3A1D1D]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-display text-xl font-light text-brand-black">카카오채널 채팅</p>
                      <p className="font-sans text-xs text-brand-muted mt-0.5">
                        운영시간 내 즉시 응답 · 문의 · 협업 · 미디어
                      </p>
                    </div>
                    <ArrowUpRight size={18} className="text-brand-muted group-hover:text-brand-black transition-colors" />
                  </motion.a>
                </div>

                {/* Space Reservation */}
                <div>
                  <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-brand-subtle mb-4">
                    공간 예약
                  </p>
                  <Link
                    to="/reservation"
                    className="flex items-center gap-5 p-6 border-2 border-brand-black bg-brand-black text-white hover:bg-brand-charcoal transition-colors group"
                  >
                    <div className="w-14 h-14 bg-white/10 flex items-center justify-center shrink-0">
                      <span className="font-display text-2xl font-light">大</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-display text-xl font-light">공간 예약 위저드</p>
                      <p className="font-sans text-xs text-white/60 mt-0.5">
                        행사 유형 선택 → 공간 추천 → 예약 접수
                      </p>
                    </div>
                    <ArrowUpRight size={18} className="text-white/50 group-hover:text-white transition-colors" />
                  </Link>
                </div>

                {/* Direct contact */}
                <div>
                  <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-brand-subtle mb-4">
                    직접 연락
                  </p>
                  <div className="space-y-0">
                    <a
                      href={`tel:16610288`}
                      className="flex items-center gap-4 py-4 border-b border-brand-line group hover:border-brand-border transition-colors"
                    >
                      <Phone size={14} className="text-brand-subtle shrink-0" />
                      <div className="flex-1">
                        <p className="font-sans text-[9px] tracking-widest uppercase text-brand-subtle mb-0.5">전화</p>
                        <p className="font-sans text-sm text-brand-black group-hover:text-brand-accent transition-colors">
                          {CONTACT.phone}
                        </p>
                      </div>
                    </a>
                    <a
                      href={`mailto:${CONTACT.email}`}
                      className="flex items-center gap-4 py-4 border-b border-brand-line group hover:border-brand-border transition-colors"
                    >
                      <Mail size={14} className="text-brand-subtle shrink-0" />
                      <div className="flex-1">
                        <p className="font-sans text-[9px] tracking-widest uppercase text-brand-subtle mb-0.5">이메일</p>
                        <p className="font-sans text-sm text-brand-black group-hover:text-brand-accent transition-colors">
                          {CONTACT.email}
                        </p>
                      </div>
                    </a>
                  </div>
                </div>

                {/* SNS */}
                <div>
                  <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-brand-subtle mb-4">
                    소셜 미디어
                  </p>
                  <div className="flex gap-3">
                    <a
                      href={CONTACT.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 border border-brand-line hover:border-brand-border text-brand-muted hover:text-brand-black transition-all font-sans text-xs tracking-widest uppercase"
                    >
                      Instagram <ArrowUpRight size={11} />
                    </a>
                    <a
                      href={CONTACT.blog}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 border border-brand-line hover:border-brand-border text-brand-muted hover:text-brand-black transition-all font-sans text-xs tracking-widest uppercase"
                    >
                      Naver Blog <ArrowUpRight size={11} />
                    </a>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Right: Location + Map */}
            <AnimatedSection animation="slide-right">
              <div className="space-y-8">
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-brand-black flex items-center justify-center shrink-0">
                      <MapPin size={15} className="text-white" />
                    </div>
                    <div>
                      <p className="font-sans text-[9px] tracking-widest uppercase text-brand-subtle mb-1">주소</p>
                      <p className="font-sans text-sm text-brand-black">{CONTACT.address}</p>
                      <a
                        href={CONTACT.map}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-sans text-[10px] tracking-widest uppercase text-brand-accent hover:text-brand-black transition-colors mt-1"
                      >
                        지도 보기 <ArrowUpRight size={10} />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-brand-black flex items-center justify-center shrink-0">
                      <Clock size={15} className="text-white" />
                    </div>
                    <div>
                      <p className="font-sans text-[9px] tracking-widest uppercase text-brand-subtle mb-1">운영 시간</p>
                      <p className="font-sans text-sm text-brand-black">{CONTACT.hours}</p>
                      <p className="font-sans text-[10px] text-brand-muted mt-1">
                        대관 행사 중 일반 방문이 제한될 수 있습니다
                      </p>
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div className="aspect-[4/3] overflow-hidden bg-brand-warm">
                  <iframe
                    src="https://www.openstreetmap.org/export/embed.html?bbox=127.196%2C37.549%2C127.212%2C37.565&layer=mapnik&marker=37.557%2C127.204"
                    width="100%"
                    height="100%"
                    className="border-0 grayscale"
                    allowFullScreen
                    loading="lazy"
                    title="The Lit 위치"
                  />
                </div>
              </div>
            </AnimatedSection>

          </div>
        </div>
      </section>
    </>
  )
}
