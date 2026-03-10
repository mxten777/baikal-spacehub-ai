import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_ITEMS = [
  { label: 'About', href: '/about' },
  { label: 'Spaces', href: '/spaces' },
  { label: 'Programs', href: '/programs' },
  { label: 'Events', href: '/events' },
  { label: 'Archive', href: '/archive' },
  { label: 'Media', href: '/media' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false) // eslint-disable-line react-hooks/set-state-in-effect
  }, [location.pathname])

  const headerBg = isHome
    ? isScrolled
      ? 'bg-brand-white/96 backdrop-blur-lg border-b border-brand-border/60'
      : 'bg-transparent'
    : 'bg-brand-white border-b border-brand-border'

  const textColor = isHome && !isScrolled ? 'text-white' : 'text-brand-black'
  const logoColor = isHome && !isScrolled ? 'text-white' : 'text-brand-black'

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${headerBg}`}
      >
        <div className="container-wide">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link
              to="/"
              className={`font-display text-xl font-light tracking-[0.18em] uppercase transition-colors duration-300 ${logoColor}`}
            >
              The Lit
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    `font-sans text-[10.5px] font-medium tracking-[0.16em] uppercase transition-all duration-300 relative pb-0.5
                    after:absolute after:bottom-0 after:left-0 after:h-px after:bg-current after:transition-all after:duration-500
                    ${isActive
                      ? `after:w-full ${isHome && !isScrolled ? 'text-white' : 'text-brand-black'}`
                      : `after:w-0 hover:after:w-full ${isHome && !isScrolled ? 'text-white/60 hover:text-white' : 'text-brand-subtle hover:text-brand-black'}`
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                to="/contact?type=rental"
                className={`font-sans text-[10.5px] font-medium tracking-[0.16em] uppercase px-6 py-2.5 border transition-all duration-300
                  ${isHome && !isScrolled
                    ? 'border-white/40 text-white hover:border-white hover:bg-white hover:text-brand-black'
                    : 'border-brand-black text-brand-black hover:bg-brand-black hover:text-white'
                  }`}
              >
                Reserve Space
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`lg:hidden p-1 transition-colors ${textColor}`}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 z-40 bg-brand-black lg:hidden"
          >
            <div className="flex flex-col h-full pt-24 pb-10 px-8">
              <nav className="flex flex-col gap-1">
                {NAV_ITEMS.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                  >
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `block py-4 font-display text-[2.25rem] font-light border-b border-white/10 transition-colors duration-300
                        ${isActive ? 'text-brand-accent' : 'text-white/90 hover:text-white'}`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-auto">
                <Link
                  to="/contact?type=rental"
                  className="btn-secondary w-full justify-center border-white text-white hover:bg-white hover:text-brand-black"
                >
                  Reserve Space
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
