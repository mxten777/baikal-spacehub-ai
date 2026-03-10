import { Link } from 'react-router-dom'
import { Instagram, Youtube, Twitter, MapPin, Phone, Mail, ArrowUpRight } from 'lucide-react'

const footerLinks = {
  explore: [
    { label: 'About', href: '/about' },
    { label: 'Spaces', href: '/spaces' },
    { label: 'Programs', href: '/programs' },
    { label: 'Archive', href: '/archive' },
  ],
  connect: [
    { label: 'Blog', href: '/blog' },
    { label: 'Media', href: '/media' },
    { label: 'Contact', href: '/contact' },
    { label: 'Reserve Space', href: '/contact?type=rental' },
  ],
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-brand-black text-white">
      {/* Main footer */}
      <div className="container-wide py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-4">
            <Link to="/" className="font-display text-2xl font-light tracking-[0.15em] uppercase text-white block mb-4">
              The Lit
            </Link>
            <p className="font-sans text-sm text-white/50 leading-relaxed max-w-xs mb-8">
              복합문화공간 더릿 — 전시, 공연, 강연, 워크숍, 촬영, 브랜드 행사 등
              모든 문화 활동을 위한 프리미엄 공간 플랫폼
            </p>
            {/* Social */}
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/thelit"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 flex items-center justify-center border border-white/20 text-white/60 hover:border-white hover:text-white transition-all duration-200"
              >
                <Instagram size={15} />
              </a>
              <a
                href="https://youtube.com/@thelit"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 flex items-center justify-center border border-white/20 text-white/60 hover:border-white hover:text-white transition-all duration-200"
              >
                <Youtube size={15} />
              </a>
              <a
                href="https://x.com/thelit"
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
            <h4 className="font-sans text-[10px] tracking-[0.2em] uppercase text-white/40 mb-5">Explore</h4>
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
            <h4 className="font-sans text-[10px] tracking-[0.2em] uppercase text-white/40 mb-5">Connect</h4>
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
            <h4 className="font-sans text-[10px] tracking-[0.2em] uppercase text-white/40 mb-5">Location</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-white/60">
                <MapPin size={14} className="mt-0.5 shrink-0 text-brand-accent" />
                <span>서울특별시 마포구<br />연남동 000-00</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/60">
                <Phone size={14} className="shrink-0 text-brand-accent" />
                <a href="tel:0200000000" className="hover:text-white transition-colors">02-0000-0000</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/60">
                <Mail size={14} className="shrink-0 text-brand-accent" />
                <a href="mailto:hello@thelit.kr" className="hover:text-white transition-colors">hello@thelit.kr</a>
              </li>
            </ul>

            <a
              href="https://maps.naver.com"
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
            <Link to="/privacy" className="font-sans text-[11px] text-white/25 hover:text-white/50 transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link to="/terms" className="font-sans text-[11px] text-white/25 hover:text-white/50 transition-colors duration-200">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
