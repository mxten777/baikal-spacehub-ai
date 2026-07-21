/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#0A0A0A",
          white: "#FAFAFA",
          cream: "#F5F0EB",
          warm: "#EDE7DE",
          ivory: "#F9F6F2",
          accent: "#C8A97E",
          gold: "#B8960C",
          charcoal: "#1A1A1A",
          smoke: "#2E2E2E",
          muted: "#7A7A7A",
          subtle: "#A0A0A0",
          border: "#E8E8E8",
          line: "#F0F0F0",
        },
      },
      fontFamily: {
        sans: ["Pretendard Variable", "Inter", "system-ui", "sans-serif"],
        display: [
          "Cormorant Garamond",
          "Pretendard Variable",
          "Georgia",
          "serif",
        ],
        serif: [
          "Cormorant Garamond",
          "Pretendard Variable",
          "Georgia",
          "serif",
        ],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem", letterSpacing: "0.05em" }],
        xs: ["0.75rem", { lineHeight: "1.5" }],
        sm: ["0.875rem", { lineHeight: "1.6" }],
        base: ["1rem", { lineHeight: "1.7" }],
        lg: ["1.125rem", { lineHeight: "1.6" }],
        xl: ["1.25rem", { lineHeight: "1.5" }],
        hero: [
          "clamp(3rem, 7vw, 7rem)",
          { lineHeight: "1.02", letterSpacing: "-0.03em" },
        ],
        display: [
          "clamp(2rem, 4vw, 3.75rem)",
          { lineHeight: "1.08", letterSpacing: "-0.03em" },
        ],
        headline: [
          "clamp(1.5rem, 2.5vw, 2.5rem)",
          { lineHeight: "1.15", letterSpacing: "-0.02em" },
        ],
        title: [
          "clamp(1.25rem, 2vw, 1.75rem)",
          { lineHeight: "1.3", letterSpacing: "-0.01em" },
        ],
      },
      letterSpacing: {
        display: "-0.03em",
        tight: "-0.02em",
        snug: "-0.01em",
        normal: "0em",
        ui: "0.12em",
        label: "0.18em",
        widest: "0.22em",
      },
      spacing: {
        section: "clamp(5rem, 9vw, 9rem)",
        container: "clamp(1.25rem, 5vw, 5rem)",
      },
      maxWidth: {
        container: "1440px",
        prose: "680px",
        narrow: "520px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-overlay":
          "linear-gradient(to bottom, transparent 0%, rgba(10,10,10,0.75) 100%)",
        "gradient-overlay-full":
          "linear-gradient(to bottom, rgba(10,10,10,0.25) 0%, rgba(10,10,10,0.45) 50%, rgba(10,10,10,0.85) 100%)",
      },
      animation: {
        "fade-up": "fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in": "fadeIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
        "slide-left": "slideInLeft 0.8s cubic-bezier(0.16,1,0.3,1) forwards",
        "slide-right": "slideInRight 0.8s cubic-bezier(0.16,1,0.3,1) forwards",
        "scale-in": "scaleIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
        marquee: "marquee 40s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      transitionTimingFunction: {
        expo: "cubic-bezier(0.16, 1, 0.3, 1)",
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      aspectRatio: {
        cinema: "21 / 9",
        portrait: "3 / 4",
        wide: "16 / 9",
        square: "1 / 1",
      },
      boxShadow: {
        card: "0 2px 20px rgba(10,10,10,0.06)",
        "card-lg": "0 8px 40px rgba(10,10,10,0.10)",
        lift: "0 16px 64px rgba(10,10,10,0.14)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
