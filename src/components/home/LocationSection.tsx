import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import AnimatedSection from '../common/AnimatedSection'

export default function LocationSection() {
  return (
    <section className="section-padding bg-brand-cream">
      <div className="container-wide">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Map */}
          <AnimatedSection animation="slide-left">
            <div className="aspect-[4/3] bg-brand-warm relative overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3163.3!2d126.9241!3d37.5572!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDMzJzI2LjAiTiAxMjbCsDU1JzI3LjciRQ!5e0!3m2!1sko!2skr!4v1"
                width="100%"
                height="100%"
                className="absolute inset-0 border-0 grayscale"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="The Lit 위치"
              />
            </div>
          </AnimatedSection>

          {/* Info */}
          <AnimatedSection animation="slide-right">
            <div>
              <p className="eyebrow mb-4">Find Us</p>
              <h2 className="font-display text-headline font-light text-brand-black mb-8">
                더릿을 방문하세요
              </h2>

              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-black flex items-center justify-center shrink-0">
                    <MapPin size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-sans text-xs tracking-widest uppercase text-brand-muted mb-1">Address</p>
                    <p className="font-sans text-sm text-brand-black">
                      서울특별시 마포구 연남동 000-00<br />
                      (지하철 2호선 홍대입구역 3번 출구)
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-black flex items-center justify-center shrink-0">
                    <Clock size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-sans text-xs tracking-widest uppercase text-brand-muted mb-1">Hours</p>
                    <p className="font-sans text-sm text-brand-black">
                      화 — 일: 11:00 — 21:00<br />
                      월요일 휴관
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-black flex items-center justify-center shrink-0">
                    <Phone size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-sans text-xs tracking-widest uppercase text-brand-muted mb-1">Phone</p>
                    <a href="tel:0200000000" className="font-sans text-sm text-brand-black hover:text-brand-accent transition-colors">
                      02-0000-0000
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-black flex items-center justify-center shrink-0">
                    <Mail size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-sans text-xs tracking-widest uppercase text-brand-muted mb-1">Email</p>
                    <a href="mailto:hello@thelit.kr" className="font-sans text-sm text-brand-black hover:text-brand-accent transition-colors">
                      hello@thelit.kr
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
