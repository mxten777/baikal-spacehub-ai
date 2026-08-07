import { Link } from "react-router-dom";
import {
  Instagram,
  Youtube,
  Twitter,
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
} from "lucide-react";
import { useSettings } from "../../hooks/useData";

const footerLinks = {
  explore: [
    { label: "About", href: "/about" },
    { label: "Spaces", href: "/spaces" },
    { label: "Archive", href: "/archive" },
  ],
  connect: [
    { label: "Blog", href: "/blog" },
    { label: "Media", href: "/media" },
    { label: "Contact", href: "/contact" },
    { label: "Wedding", href: "/wedding" },
    { label: "예약 신청", href: "/reservation" },
  ],
};

function ensureHttps(url: string | undefined, fallback: string): string {
  const raw = url || fallback;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `https://${raw}`;
}

export default function Footer() {
  const year = new Date().getFullYear();
  const { data: settings } = useSettings();

  const instagramUrl = ensureHttps(
    settings?.instagram_url,
    "instagram.com/thelit_official",
  );
  const youtubeUrl = ensureHttps(settings?.youtube_url, "youtube.com/@TheLIT_official");
  const xUrl = ensureHttps(settings?.x_url, "x.com/thelit");
  const address = settings?.address || "경기도 하남시 \ubbf8사동 468";
  const phone = settings?.contact_phone || "1661-0288";
  const email = settings?.contact_email || "goworld33@naver.com";
  const mapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(address)}`;
  const phoneHref = `tel:${phone.replace(/[^0-9]/g, "")}`;

  return (
    <footer className="bg-brand-black text-white">
      {/* Main footer */}
      <div className="container-wide py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-4">
            <Link to="/" aria-label="The Lit — 홈" className="inline-block mb-5">
              <img
                src="/images/thelitlogo_red_trans.png"
                alt="The Lit"
                className="w-[240px] max-w-[240px] h-auto"
              />
            </Link>
            <p className="font-sans text-sm text-white/50 leading-relaxed max-w-xs mb-8">
              복합문화공간 더릿 — 전시, 공연, 강연, 워크숍, 촬영, 브랜드 행사 등
              모든 문화 활동을 위한 프리미엄 공간 플랫폼
            </p>
            {/* Social */}
            <div className="flex items-center gap-4">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 flex items-center justify-center border border-white/20 text-white/60 hover:border-white hover:text-white transition-all duration-200"
              >
                <Instagram size={15} />
              </a>
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 flex items-center justify-center border border-white/20 text-white/60 hover:border-white hover:text-white transition-all duration-200"
              >
                <Youtube size={15} />
              </a>
              <a
                href={xUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="w-9 h-9 flex items-center justify-center border border-white/20 text-white/60 hover:border-white hover:text-white transition-all duration-200"
              >
                <Twitter size={15} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="font-sans text-[10px] tracking-[0.2em] uppercase text-white/40 mb-5">
              Explore
            </h4>
            <ul className="space-y-3">
              {footerLinks.explore.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="font-sans text-sm text-white/60 hover:text-white transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-sans text-[10px] tracking-[0.2em] uppercase text-white/40 mb-5">
              Connect
            </h4>
            <ul className="space-y-3">
              {footerLinks.connect.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="font-sans text-sm text-white/60 hover:text-white transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div className="lg:col-span-3 lg:col-start-10">
            <h4 className="font-sans text-[10px] tracking-[0.2em] uppercase text-white/40 mb-5">
              Location
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-white/60">
                <MapPin
                  size={14}
                  className="mt-0.5 shrink-0 text-brand-accent"
                />
                <span>{address}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/60">
                <Phone size={14} className="shrink-0 text-brand-accent" />
                <a
                  href={phoneHref}
                  className="hover:text-white transition-colors"
                >
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/60">
                <Mail size={14} className="shrink-0 text-brand-accent" />
                <a
                  href={`mailto:${email}`}
                  className="hover:text-white transition-colors"
                >
                  {email}
                </a>
              </li>
            </ul>

            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-5 font-sans text-[11px] tracking-widest uppercase text-brand-accent hover:text-white transition-colors duration-200"
            >
              View Map <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-wide py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-sans text-[11px] text-white/25 tracking-wide">
            © {year} The Lit. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="/privacy"
              className="font-sans text-[11px] text-white/25 hover:text-white/50 transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="font-sans text-[11px] text-white/25 hover:text-white/50 transition-colors duration-200"
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
