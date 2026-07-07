import { useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { label: "About", href: "/about" },
  { label: "Spaces", href: "/spaces" },
  { label: "Programs", href: "/programs" },
  { label: "Events", href: "/events" },
  { label: "Archive", href: "/archive" },
  { label: "Media", href: "/media" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export default function MobileNav({ open, onClose }: MobileNavProps) {
  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="내비게이션 메뉴"
          className="fixed inset-0 z-[60] bg-[#080808] lg:hidden overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
        >
          {/* Background texture */}
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=40"
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Gradient vignette */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(8,8,8,0.55) 0%, transparent 40%, rgba(8,8,8,0.5) 100%)",
            }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-4 w-11 h-11 flex items-center justify-center text-white/70 hover:text-white transition-colors z-10"
            aria-label="메뉴 닫기"
          >
            <X size={18} />
          </button>

          {/* Layout */}
          <div className="relative flex flex-col h-full px-7 pt-[72px] pb-8 overflow-y-auto">
            {/* Brand label */}
            <motion.p
              className="font-display text-[9px] tracking-[0.36em] uppercase text-white/50 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18 }}
            >
              더릿 — 복합문화공간
            </motion.p>

            {/* Navigation links */}
            <nav aria-label="모바일 메인 메뉴" className="flex-1">
              {NAV_ITEMS.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.16 + i * 0.055,
                    duration: 0.38,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                >
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `block py-[13px] font-display font-extralight border-b border-white/20 transition-colors duration-200 leading-tight ${
                        isActive
                          ? "text-white"
                          : "text-white/75 hover:text-white"
                      }`
                    }
                    style={{
                      fontSize: "clamp(1.85rem, 7.5vw, 2.4rem)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {item.label}
                  </NavLink>
                </motion.div>
              ))}
            </nav>

            {/* Bottom CTA + contact */}
            <motion.div
              className="mt-10 space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.62, duration: 0.35 }}
            >
              <Link
                to="/reservation"
                className="block w-full text-center py-[13px] font-sans text-[10px] font-medium tracking-[0.22em] uppercase border border-white/50 text-white hover:bg-white hover:text-brand-black transition-all duration-300"
              >
                Book a Space
              </Link>
              <div className="flex items-center justify-between pt-1">
                <span className="font-sans text-[9px] tracking-widest text-white/50">
                  goworld33@naver.com
                </span>
                <span className="font-sans text-[9px] tracking-widest text-white/50">
                  1661-0288
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
