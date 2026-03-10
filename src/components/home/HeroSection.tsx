import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const slides = [
  {
    id: '1',
    title: '문화가 흐르는\n공간',
    subtitle: 'A Space Where Culture Flows',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80',
  },
  {
    id: '2',
    title: '예술과 삶이\n만나는 곳',
    subtitle: 'Where Art Meets Life',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80',
  },
  {
    id: '3',
    title: '비범한 경험을\n위한 공간',
    subtitle: 'Space for Extraordinary Experiences',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1920&q=80',
  },
]

export default function HeroSection() {
  const [current, setCurrent] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startAuto = () => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 6000)
  }

  useEffect(() => {
    startAuto()
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden">
      {/* Background slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[current].id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <img
            src={slides[current].image}
            alt=""
            className="w-full h-full object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-overlay-center" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full container-wide pb-20 lg:pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={slides[current].id + '-content'}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-white/45 mb-5">
              The Lit — 복합문화공간
            </p>
            <h1 className="font-display font-light text-white whitespace-pre-line mb-7"
               style={{ fontSize: 'clamp(3rem, 7vw, 7rem)', letterSpacing: '-0.03em', lineHeight: '1.02' }}>
              {slides[current].title}
            </h1>
            <p className="font-sans text-[15px] text-white/55 mb-12 tracking-[0.02em]">
              {slides[current].subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link to="/programs" className="btn-primary">
                Programs <ArrowRight size={15} />
              </Link>
              <Link to="/contact?type=rental" className="btn-outline-white">
                Space Rental
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide indicators */}
        <div className="flex items-center gap-3 mt-12">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrent(i)
                if (intervalRef.current) clearInterval(intervalRef.current)
                startAuto()
              }}
              className={`transition-all duration-300 ${
                i === current
                  ? 'w-8 h-0.5 bg-white'
                  : 'w-4 h-0.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-8 lg:right-16 z-10 flex flex-col items-center gap-2">
        <span className="writing-vertical font-sans text-[9px] tracking-[0.25em] uppercase text-white/40">
          Scroll
        </span>
        <div className="w-px h-12 bg-white/20 relative overflow-hidden">
          <motion.div
            className="absolute top-0 w-full h-1/2 bg-white/60"
            animate={{ y: ['0%', '200%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </div>
    </section>
  )
}
