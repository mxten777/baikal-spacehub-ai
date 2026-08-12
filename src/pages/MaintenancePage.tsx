import { motion, useReducedMotion } from "framer-motion";

export default function MaintenancePage() {
  const prefersReducedMotion = useReducedMotion();

  /** Returns Framer Motion animate props, or instant-show if reduced motion. */
  function anim(delay: number, duration: number, y = 0) {
    if (prefersReducedMotion) {
      return {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0 },
      };
    }
    return {
      initial: { opacity: 0, ...(y !== 0 && { y }) },
      animate: { opacity: 1, ...(y !== 0 && { y: 0 }) },
      transition: {
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    };
  }

  return (
    <main
      className="relative w-full overflow-hidden flex flex-col min-h-screen"
      style={{ height: "100dvh" }}
      aria-label="THE LIT — 새로운 시작을 준비하고 있습니다"
    >
      {/* ── Background ─────────────────────────────────────────────────── */}
      <motion.div className="absolute inset-0" {...anim(0, 2.0)}>
        <picture>
          <source
            media="(max-width: 767px)"
            srcSet="/images/hero/hero-1-mobile.webp"
          />
          <img
            src="/images/hero/hero-1.webp"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center"
            style={{ objectPosition: "50% 55%" }}
          />
        </picture>

        {/* Cinematic overlay: darker top + bottom, atmospheric middle */}
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,10,10,0.62) 0%, rgba(10,10,10,0.18) 40%, rgba(10,10,10,0.18) 60%, rgba(10,10,10,0.72) 100%)",
          }}
        />
        {/* Edge vignette — keeps center brighter */}
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.38) 100%)",
          }}
        />
      </motion.div>

      {/* ── Logo ───────────────────────────────────────────────────────── */}
      <header className="relative z-10 flex justify-center pt-9 md:pt-11 lg:pt-13">
        <motion.div {...anim(0.4, 1.2)}>
          <img
            src="/images/thelitlogo_black_trans.png"
            alt="THE LIT"
            className="h-7 md:h-8 w-auto object-contain brightness-0 invert"
          />
        </motion.div>
      </header>

      {/* ── Center copy ────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        {/* Eyebrow */}
        <motion.p
          className="font-sans text-white/55 mb-6 md:mb-8 uppercase"
          style={{ fontSize: "0.625rem", letterSpacing: "0.22em" }}
          {...anim(0.8, 1.0)}
        >
          A NEW CHAPTER OF THE LIT
        </motion.p>

        {/* Main headline */}
        <motion.h1
          className="font-display text-white"
          style={{
            fontSize: "clamp(2.75rem, 6vw, 6.5rem)",
            lineHeight: 1.04,
            letterSpacing: "-0.03em",
          }}
          {...anim(1.0, 1.4, 20)}
        >
          Where Your Light
          <br />
          Shines Again
        </motion.h1>

        {/* Korean primary */}
        <motion.p
          className="font-sans text-sm md:text-base text-white/78 mt-7 md:mt-9"
          style={{ letterSpacing: "0.01em" }}
          {...anim(1.5, 1.0)}
        >
          더릿이 새로운 모습으로 준비되고 있습니다.
        </motion.p>

        {/* Sub copy */}
        <motion.p
          className="font-sans text-xs md:text-sm text-white/45 mt-3 md:mt-4 leading-relaxed max-w-xs md:max-w-md"
          {...anim(1.8, 1.0)}
        >
          공간을 넘어, 더 특별한 순간과 경험을 위한 THE LIT으로
          <br />곧 다시 만나겠습니다.
        </motion.p>
      </div>

      {/* ── Bottom brand statement ──────────────────────────────────────── */}
      <footer className="relative z-10 flex justify-center pb-9 md:pb-11 lg:pb-13">
        <motion.p
          className="font-sans text-white/30"
          style={{ fontSize: "0.5625rem", letterSpacing: "0.2em" }}
          {...anim(2.0, 0.8)}
        >
          <span className="hidden sm:inline">
            HOUSE WEDDING · K-CULTURE · EVENT · CAFÉ &amp; GARDEN
          </span>
          <span className="sm:hidden">WEDDING · CULTURE · EVENT · GARDEN</span>
        </motion.p>
      </footer>
    </main>
  );
}
