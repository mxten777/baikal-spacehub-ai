import { useState, useEffect, useRef, useCallback } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import MegaMenu from "./MegaMenu";
import SearchOverlay from "./SearchOverlay";
import LatestFeedPanel from "./LatestFeedPanel";
import MobileNav from "./MobileNav";
import AnnouncementBar from "./AnnouncementBar";

const NAV_ITEMS = [
  { label: "Brand Story", href: "/about", hasMega: false },
  { label: "Spaces", href: "/spaces", hasMega: true },
  { label: "Wedding", href: "/wedding", hasMega: false },
  { label: "Archive", href: "/archive", hasMega: true },
  { label: "Media", href: "/media", hasMega: true },
  { label: "Contact", href: "/contact", hasMega: false },
];

type Phase = "top" | "mid" | "solid";

const BG: Record<Phase, string> = {
  top: "rgba(0,0,0,0)",
  mid: "rgba(255,255,255,0.78)",
  solid: "rgba(250,250,250,0.97)",
};
const SHADOW: Record<Phase, string> = {
  top: "0 0 0 rgba(0,0,0,0)",
  mid: "0 1px 0 rgba(0,0,0,0.06)",
  solid: "0 1px 0 rgba(0,0,0,0.06)",
};

export default function Header() {
  const [phase, setPhase] = useState<Phase>("top");
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [feedOpen, setFeedOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    if (y < 20) setPhase("top");
    else if (y < 100) setPhase("mid");
    else setPhase("solid");
  });

  // Close everything on route change
  useEffect(() => {
    setActiveMega(null); // eslint-disable-line react-hooks/set-state-in-effect
    setMobileOpen(false);
    setSearchOpen(false);
    setFeedOpen(false);
  }, [location.pathname]);

  const onNavEnter = useCallback((label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveMega(label);
  }, []);

  const onNavLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => setActiveMega(null), 130);
  }, []);

  const onMegaEnter = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const onMegaLeave = useCallback(() => setActiveMega(null), []);

  const currentPhase: Phase = isHome ? phase : "solid";
  const isDark = isHome && phase === "top";
  const isGlass = isHome && phase === "mid";
  const lightText = isDark || isGlass;

  return (
    <>
      {/* paddingTop: env(safe-area-inset-top) — viewport-fit=cover 시 노치·상단 크롬 영역 회피 */}
      <header className="fixed top-0 left-0 right-0 z-50" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <AnnouncementBar />
        {/* — Animated background layer — */}
        <motion.div
          className={`absolute inset-0 pointer-events-none ${currentPhase !== "top" ? "backdrop-blur-xl" : ""}`}
          animate={{
            backgroundColor: BG[currentPhase],
            boxShadow: SHADOW[currentPhase],
          }}
          style={{
            transition: "backdrop-filter 500ms cubic-bezier(0.25,0.1,0.25,1)",
          }}
          transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        />

        {/* — Top gradient scrim — legibility over bright hero images — */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0) 100%)",
          }}
          animate={{ opacity: isDark ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        />

        {/* — Header content — */}
        <div className="relative container-wide">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            {/* Logo */}
            <Link to="/" aria-label="The Lit — 홈">
              <img
                src="/images/thelitlogo_red_trans.png"
                alt="The Lit"
                className="h-[52px]"
              />
            </Link>

            {/* Desktop Nav */}
            <nav aria-label="메인 메뉴" className="hidden lg:flex items-center">
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.href}
                  onMouseEnter={() => {
                    if (item.hasMega) onNavEnter(item.label);
                    else {
                      if (closeTimer.current) clearTimeout(closeTimer.current);
                      setActiveMega(null);
                    }
                  }}
                  onMouseLeave={item.hasMega ? onNavLeave : undefined}
                >
                  <NavLink
                    to={item.href}
                    aria-haspopup={item.hasMega || undefined}
                    aria-expanded={
                      item.hasMega ? activeMega === item.label : undefined
                    }
                    className={({ isActive }) => {
                      const isOpen = activeMega === item.label;
                      const textColor = lightText
                        ? isActive || isOpen
                          ? "text-white"
                          : "text-white/65 hover:text-white"
                        : isActive || isOpen
                          ? "text-brand-black"
                          : "text-brand-subtle hover:text-brand-black";
                      const border = isActive
                        ? "border-current"
                        : "border-transparent";
                      return `block px-[13px] py-2 font-sans text-[10.5px] font-medium tracking-[0.16em] uppercase border-b transition-colors duration-200 ${border} ${textColor}`;
                    }}
                    style={
                      lightText
                        ? { textShadow: "0 1px 6px rgba(0,0,0,0.55)" }
                        : undefined
                    }
                  >
                    {item.label}
                  </NavLink>
                </div>
              ))}
            </nav>

            {/* Right Controls */}
            <div className="hidden lg:flex items-center gap-1">
              {/* Search */}
              <motion.button
                onClick={() => setSearchOpen(true)}
                animate={{
                  color: lightText ? "rgba(255,255,255,0.55)" : "#A0A0A0",
                }}
                whileHover={{ color: lightText ? "#ffffff" : "#0A0A0A" }}
                transition={{ duration: 0.2 }}
                className="w-9 h-9 flex items-center justify-center"
                aria-label="검색"
              >
                <Search size={15} strokeWidth={1.5} />
              </motion.button>

              {/* NEW pulse */}
              <button
                onClick={() => setFeedOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-2 group"
                aria-label="최신 업데이트"
              >
                <motion.span
                  className="w-[5px] h-[5px] rounded-full bg-rose-500 shrink-0"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.span
                  animate={{
                    color: lightText ? "rgba(255,255,255,0.45)" : "#B0B0B0",
                  }}
                  className="font-sans text-[8.5px] font-semibold tracking-[0.25em] uppercase group-hover:opacity-100 transition-opacity"
                  style={{ color: "inherit" }}
                >
                  NEW
                </motion.span>
              </button>

              {/* CTA */}
              <Link
                to="/reservation"
                className={`ml-2 font-sans text-[10px] font-medium tracking-[0.2em] uppercase px-5 py-[9px] border transition-all duration-300
                  ${
                    lightText
                      ? "border-white/40 text-white hover:bg-white hover:border-white hover:text-brand-black"
                      : "border-brand-black text-brand-black hover:bg-brand-black hover:text-white"
                  }`}
              >
                Book a Space
              </Link>
            </div>

            {/* Mobile Controls */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setSearchOpen(true)}
                className={`w-10 h-10 flex items-center justify-center transition-colors ${lightText ? "text-white/60" : "text-brand-subtle"}`}
                aria-label="검색"
              >
                <Search size={17} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setMobileOpen(true)}
                className={`w-10 h-10 flex items-center justify-center transition-colors ${lightText ? "text-white" : "text-brand-black"}`}
                aria-label="메뉴 열기"
              >
                <Menu size={21} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mega Menu (fixed, below header) */}
      <MegaMenu
        activeItem={activeMega}
        onMegaEnter={onMegaEnter}
        onMegaLeave={onMegaLeave}
      />

      {/* Overlays */}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <LatestFeedPanel open={feedOpen} onClose={() => setFeedOpen(false)} />
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
