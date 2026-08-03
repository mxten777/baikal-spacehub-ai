import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AnimatedSection from "../common/AnimatedSection";
import SectionHeader from "../common/SectionHeader";
import type { JourneyStep } from "../../types";

interface JourneyStepDisplay {
  number: string;
  emotion: string;
  desc: string;
  numClass: string;
  emotionClass: string;
}

// 감정 흐름: Arrival → Curiosity → Dark Passage → Transformation → Light → WOW → Memory
// 숫자 + 감정 레이블 색상이 어두움→빛 흐름을 시각적으로 표현
const FALLBACK_STEPS: JourneyStepDisplay[] = [
  {
    number: "01",
    emotion: "Arrival",
    desc: "골목 끝, 예상하지 못한 공간과 마주합니다.",
    numClass: "text-white/10",
    emotionClass: "text-white/25",
  },
  {
    number: "02",
    emotion: "Curiosity",
    desc: "붉은 대문과 살구나무를 지나며 궁금증이 시작됩니다.",
    numClass: "text-white/10",
    emotionClass: "text-white/30",
  },
  {
    number: "03",
    emotion: "Dark Passage",
    desc: "어두운 30m 통로가 일상의 감각을 잠시 멈추게 합니다.",
    numClass: "text-brand-accent/30",
    emotionClass: "text-brand-accent/60",
  },
  {
    number: "04",
    emotion: "Transformation",
    desc: "빛을 향해 걷는 동안 생각과 시선이 전환됩니다.",
    numClass: "text-white/15",
    emotionClass: "text-white/40",
  },
  {
    number: "05",
    emotion: "Light",
    desc: "통로의 끝에서 정원과 햇살이 한 번에 열립니다.",
    numClass: "text-brand-accent/40",
    emotionClass: "text-brand-accent/80",
  },
  {
    number: "06",
    emotion: "WOW",
    desc: "100년 소나무와 천연 잔디가 예상 밖의 장면을 만듭니다.",
    numClass: "text-brand-accent/60",
    emotionClass: "text-brand-accent",
  },
  {
    number: "07",
    emotion: "Memory",
    desc: "그 순간은 촬영, 행사, 웨딩, 휴식의 기억으로 남습니다.",
    numClass: "text-brand-accent/40",
    emotionClass: "text-brand-accent/70",
  },
];

// 위치별 고정 색상 클래스 (UI 디자인 — 변경 불가)
const POSITION_CLASSES: { numClass: string; emotionClass: string }[] = [
  { numClass: "text-white/10",        emotionClass: "text-white/25" },
  { numClass: "text-white/10",        emotionClass: "text-white/30" },
  { numClass: "text-brand-accent/30", emotionClass: "text-brand-accent/60" },
  { numClass: "text-white/15",        emotionClass: "text-white/40" },
  { numClass: "text-brand-accent/40", emotionClass: "text-brand-accent/80" },
  { numClass: "text-brand-accent/60", emotionClass: "text-brand-accent" },
  { numClass: "text-brand-accent/40", emotionClass: "text-brand-accent/70" },
];

interface Props {
  steps?: JourneyStep[];
}

export default function ExperienceJourneySection({ steps }: Props) {
  // steps=undefined → DB not loaded, use fallback
  // steps=[] → no steps in DB (migration not applied), use fallback
  // steps=[items] → DB loaded, filter by is_visible (may produce empty if all hidden)
  const displaySteps: JourneyStepDisplay[] =
    steps !== undefined && steps.length > 0
      ? steps
          .filter((s) => s.is_visible)
          .map((s, i) => ({
            number: s.number,
            emotion: s.emotion,
            desc: s.desc,
            ...(POSITION_CLASSES[i] ?? POSITION_CLASSES[POSITION_CLASSES.length - 1]),
          }))
      : FALLBACK_STEPS;

  // Operator intentionally hid all steps → don't render section
  if (steps !== undefined && steps.length > 0 && displaySteps.length === 0) return null;

  return (
    <section className="section-padding bg-brand-black">
      <div className="container-wide">

        {/* Header */}
        <AnimatedSection animation="fade-up" className="mb-4">
          <SectionHeader
            eyebrow="THE EXPERIENCE"
            title="Walk Into The Light"
            light
          />
        </AnimatedSection>

        {/* Intro copy */}
        <AnimatedSection animation="fade-up" delay={80} className="mb-16 lg:mb-24">
          <p className="font-sans text-sm text-white/40 leading-relaxed max-w-sm">
            THE LIT에 들어서는 순간,
            <br />
            공간은 하나의 감정 흐름으로 이어집니다.
          </p>
        </AnimatedSection>

        {/* Journey steps — 숫자와 레이블 색상 대비가 감정 흐름을 나타냄 */}
        <div className="divide-y divide-white/[0.06]">
          {displaySteps.map((step, i) => (
            <AnimatedSection
              key={step.emotion}
              animation="fade-up"
              delay={100 + i * 55}
            >
              <div className="flex items-center gap-6 lg:gap-12 py-7 lg:py-10">
                {/* Decorative step number */}
                <span
                  aria-hidden="true"
                  className={`font-display font-light leading-none select-none shrink-0 w-16 lg:w-24 ${step.numClass}`}
                  style={{ fontSize: "clamp(2.25rem, 4.5vw, 4.25rem)" }}
                >
                  {step.number}
                </span>

                {/* Step content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-sans text-[10px] font-medium tracking-[0.2em] uppercase mb-2 lg:mb-3 ${step.emotionClass}`}
                  >
                    {step.emotion}
                  </p>
                  <p
                    className="font-display font-light text-white/75 leading-snug"
                    style={{
                      fontSize: "clamp(1.05rem, 2vw, 1.55rem)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* CTA */}
        <AnimatedSection
          animation="fade-up"
          delay={500}
          className="mt-16 lg:mt-20 flex flex-wrap items-center gap-4 lg:gap-6"
        >
          <Link to="/spaces" className="btn-outline-white">
            Explore Our Spaces <ArrowRight size={14} />
          </Link>
          <Link to="/contact" className="btn-ghost-light">
            Experience THE LIT <ArrowRight size={14} />
          </Link>
        </AnimatedSection>

      </div>
    </section>
  );
}

