import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Train, Bus, Car, ExternalLink } from "lucide-react";
import AnimatedSection from "../common/AnimatedSection";
import { useSettings } from "../../hooks/useData";

type TransportTab = "subway" | "bus" | "car";

const KAKAO_MAP_URL =
  "https://map.kakao.com/link/map/더릿,37.5572,127.2040";
const NAVER_MAP_URL =
  "https://map.naver.com/v5/search/경기도%20하남시%20미사동%20468";
const GOOGLE_MAP_URL =
  "https://maps.google.com/?q=37.5572,127.2040";

const TRANSPORT: Record<
  TransportTab,
  { icon: React.ReactNode; title: string; steps: string[] }
> = {
  subway: {
    icon: <Train size={15} />,
    title: "지하철",
    steps: [
      "경강선 미사역 1번 출구",
      "도보 약 10분 (850m)",
      "또는 택시 3분 (기본 요금)",
    ],
  },
  bus: {
    icon: <Bus size={15} />,
    title: "버스",
    steps: [
      "미사역 정류장 하차",
      "간선: 370, 3500",
      "지선: 9300, 하남 10번",
      "하차 후 도보 5분",
    ],
  },
  car: {
    icon: <Car size={15} />,
    title: "자가용 · 주차",
    steps: [
      "서울 방향: 미사대로 → 미사강변동로 진입",
      "성남 방향: 경강로 → 미사대로 북쪽",
      "건물 지하 주차장 2시간 무료",
      "이후 10분당 500원",
    ],
  },
};

export default function LocationSection() {
  const { data: settings } = useSettings();
  const [activeTab, setActiveTab] = useState<TransportTab>("subway");

  const address = settings?.address || "경기도 하남시 미사동 468";
  const phone = settings?.contact_phone || "1661-0288";
  const email = settings?.contact_email || "goworld33@naver.com";
  const businessHours = settings?.business_hours || "화 — 일: 11:00 — 21:00";
  const holiday = settings?.holiday || "월요일 휴관";
  const phoneHref = `tel:${phone.replace(/[^0-9]/g, "")}`;

  const { steps } = TRANSPORT[activeTab];

  return (
    <section className="section-padding bg-brand-cream">
      <div className="container-wide">
        {/* Section header */}
        <AnimatedSection animation="fade-up" className="mb-12">
          <p className="eyebrow mb-4">Find Us</p>
          <h2 className="font-display text-headline font-light text-brand-black">
            오시는 길
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Map column */}
          <AnimatedSection animation="slide-left" className="space-y-4">
            {/* Map embed */}
            <div className="relative overflow-hidden shadow-sm" style={{ aspectRatio: "4/3" }}>
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=127.196%2C37.549%2C127.212%2C37.565&layer=mapnik&marker=37.557%2C127.204"
                width="100%"
                height="100%"
                className="absolute inset-0 border-0"
                allowFullScreen
                loading="lazy"
                title="The Lit 위치"
              />
              {/* Overlay label */}
              <div className="absolute bottom-0 left-0 right-0 bg-brand-black/80 backdrop-blur-sm px-4 py-3 flex items-center gap-2">
                <MapPin size={14} className="text-brand-accent shrink-0" />
                <span className="font-sans text-xs text-white tracking-wide">
                  경기도 하남시 미사동 468 · 더릿
                </span>
              </div>
            </div>

            {/* Map service buttons */}
            <div className="flex gap-2">
              {[
                { label: "카카오맵", href: KAKAO_MAP_URL },
                { label: "네이버지도", href: NAVER_MAP_URL },
                { label: "Google Maps", href: GOOGLE_MAP_URL },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 border border-brand-black/20 hover:border-brand-black hover:bg-brand-black hover:text-white transition-all duration-200 font-sans text-xs tracking-wide text-brand-black"
                >
                  <ExternalLink size={11} />
                  {label}
                </a>
              ))}
            </div>
          </AnimatedSection>

          {/* Info column */}
          <AnimatedSection animation="slide-right">
            {/* Contact info */}
            <ul className="space-y-5 mb-10">
              <li className="flex items-start gap-4">
                <div className="w-9 h-9 bg-brand-black flex items-center justify-center shrink-0">
                  <MapPin size={14} className="text-white" />
                </div>
                <div>
                  <p className="font-sans text-xs tracking-widest uppercase text-brand-muted mb-1">
                    Address
                  </p>
                  <p className="font-sans text-sm text-brand-black leading-relaxed">
                    {address}
                    <br />
                    <span className="text-brand-muted text-xs">경강선 미사역 1번 출구 도보 10분</span>
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="w-9 h-9 bg-brand-black flex items-center justify-center shrink-0">
                  <Clock size={14} className="text-white" />
                </div>
                <div>
                  <p className="font-sans text-xs tracking-widest uppercase text-brand-muted mb-1">
                    Hours
                  </p>
                  <p className="font-sans text-sm text-brand-black leading-relaxed">
                    {businessHours}
                    <br />
                    <span className="text-brand-muted text-xs">{holiday}</span>
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="w-9 h-9 bg-brand-black flex items-center justify-center shrink-0">
                  <Phone size={14} className="text-white" />
                </div>
                <div>
                  <p className="font-sans text-xs tracking-widest uppercase text-brand-muted mb-1">
                    Phone
                  </p>
                  <a
                    href={phoneHref}
                    className="font-sans text-sm text-brand-black hover:text-brand-accent transition-colors"
                  >
                    {phone}
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="w-9 h-9 bg-brand-black flex items-center justify-center shrink-0">
                  <Mail size={14} className="text-white" />
                </div>
                <div>
                  <p className="font-sans text-xs tracking-widest uppercase text-brand-muted mb-1">
                    Email
                  </p>
                  <a
                    href={`mailto:${email}`}
                    className="font-sans text-sm text-brand-black hover:text-brand-accent transition-colors"
                  >
                    {email}
                  </a>
                </div>
              </li>
            </ul>

            {/* Transportation guide */}
            <div className="border border-brand-black/10 bg-white">
              {/* Tab bar */}
              <div className="flex border-b border-brand-black/10">
                {(Object.keys(TRANSPORT) as TransportTab[]).map((key) => {
                  const { icon, title } = TRANSPORT[key];
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-3 font-sans text-xs tracking-wide transition-colors duration-150 ${
                        activeTab === key
                          ? "bg-brand-black text-white"
                          : "text-brand-muted hover:text-brand-black hover:bg-brand-cream"
                      }`}
                    >
                      {icon}
                      {title}
                    </button>
                  );
                })}
              </div>

              {/* Step list */}
              <ul className="p-5 space-y-3">
                {steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-brand-black text-white font-sans text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="font-sans text-sm text-brand-black leading-relaxed">
                      {step}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
