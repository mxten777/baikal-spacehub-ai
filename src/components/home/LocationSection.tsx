import { MapPin, Phone, Mail, Clock } from "lucide-react";
import AnimatedSection from "../common/AnimatedSection";

export default function LocationSection() {
  return (
    <section className="section-padding bg-brand-cream">
      <div className="container-wide">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Map */}
          <AnimatedSection animation="slide-left">
            <div className="aspect-[4/3] bg-brand-warm relative overflow-hidden">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=127.196%2C37.549%2C127.212%2C37.565&layer=mapnik&marker=37.557%2C127.204"
                width="100%"
                height="100%"
                className="absolute inset-0 border-0 grayscale"
                allowFullScreen
                loading="lazy"
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
                    <p className="font-sans text-xs tracking-widest uppercase text-brand-muted mb-1">
                      Address
                    </p>
                    <p className="font-sans text-sm text-brand-black">
                      경기도 하남시 미사동 468
                      <br />
                      (경강선 미사역 인근)
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-black flex items-center justify-center shrink-0">
                    <Clock size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-sans text-xs tracking-widest uppercase text-brand-muted mb-1">
                      Hours
                    </p>
                    <p className="font-sans text-sm text-brand-black">
                      화 — 일: 11:00 — 21:00
                      <br />
                      월요일 휴관
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-black flex items-center justify-center shrink-0">
                    <Phone size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-sans text-xs tracking-widest uppercase text-brand-muted mb-1">
                      Phone
                    </p>
                    <a
                      href="tel:16610288"
                      className="font-sans text-sm text-brand-black hover:text-brand-accent transition-colors"
                    >
                      1661-0288
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-black flex items-center justify-center shrink-0">
                    <Mail size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-sans text-xs tracking-widest uppercase text-brand-muted mb-1">
                      Email
                    </p>
                    <a
                      href="mailto:goworld33@naver.com"
                      className="font-sans text-sm text-brand-black hover:text-brand-accent transition-colors"
                    >
                      goworld33@naver.com
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
