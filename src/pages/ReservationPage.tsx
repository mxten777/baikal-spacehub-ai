import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, Sparkles, Check, X } from "lucide-react";
import type { EventType, ReservationFormData } from "../types";
import { reservationsService } from "../services/reservations";

// ─── Event type config ────────────────────────────────────────────────────────

const EVENT_TYPES: {
  id: EventType;
  label: string;
  desc: string;
  img: string;
}[] = [
  {
    id: "exhibition",
    label: "전시",
    desc: "아트 전시 · 사진전 · 설치미술",
    img: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=600&q=75",
  },
  {
    id: "performance",
    label: "공연",
    desc: "음악 · 연극 · 퍼포먼스",
    img: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=75",
  },
  {
    id: "workshop",
    label: "워크숍",
    desc: "교육 · 강연 · 클래스",
    img: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=75",
  },
  {
    id: "brand_event",
    label: "브랜드 행사",
    desc: "팝업 · 런칭 · 프레스",
    img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=75",
  },
  {
    id: "corporate",
    label: "기업행사",
    desc: "팀빌딩 · 미팅 · 연말파티",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=75",
  },
  {
    id: "shoot",
    label: "촬영",
    desc: "사진 · 영상 · CF · 룩북",
    img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=75",
  },
  {
    id: "wedding",
    label: "웨딩",
    desc: "스몰웨딩 · 포토웨딩 · 파티",
    img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=75",
  },
  {
    id: "gathering",
    label: "모임",
    desc: "생일파티 · 소모임 · 축하",
    img: "https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=600&q=75",
  },
  {
    id: "consultation",
    label: "공간 상담",
    desc: "방문 상담 · 맞춤 플랜",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=75",
  },
];

// ─── Space recommendation logic ────────────────────────────────────────────────

const SPACES: {
  id: string;
  name: string;
  nameKo: string;
  cap: number;
  desc: string;
  img: string;
  tags: string[];
}[] = [
  {
    id: "cafe",
    name: "Cafe Space",
    nameKo: "카페 공간",
    cap: 30,
    desc: "따뜻한 인테리어와 바 카운터. 소모임과 팝업에 최적.",
    img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80",
    tags: ["소모임", "팝업", "파티"],
  },
  {
    id: "garden",
    name: "Garden Yard",
    nameKo: "가든 야드",
    cap: 50,
    desc: "야외 조경과 조명이 아름다운 프리미엄 야외 공간.",
    img: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
    tags: ["야외", "웨딩", "파티"],
  },
  {
    id: "studio",
    name: "Main Studio",
    nameKo: "메인 스튜디오",
    cap: 80,
    desc: "전문 조명·음향 시스템과 무대가 있는 멀티 스튜디오.",
    img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80",
    tags: ["공연", "촬영", "강연"],
  },
  {
    id: "hall",
    name: "Open Hall",
    nameKo: "오픈 홀",
    cap: 150,
    desc: "화이트 갤러리 벽과 오픈 플로어의 대형 복합 공간.",
    img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80",
    tags: ["전시", "대형행사", "런칭"],
  },
];

function getRecommendedSpace(eventType: EventType, attendees: number) {
  const n = attendees || 0;
  if (eventType === "exhibition") return SPACES[3]; // Open Hall
  if (eventType === "wedding") return SPACES[1]; // Garden Yard
  if (eventType === "gathering" || n <= 30) return SPACES[0]; // Cafe
  if (n <= 50) return SPACES[1]; // Garden
  if (n <= 80) return SPACES[2]; // Studio
  return SPACES[3]; // Open Hall
}

// ─── AI Concierge hints ───────────────────────────────────────────────────────

const CONCIERGE_HINTS: Record<string, string[]> = {
  default: [
    "행사 유형을 선택하시면 가장 적합한 공간을 추천해 드립니다.",
    "더릿에는 30~150명 규모의 4가지 전용 공간이 있습니다.",
  ],
  exhibition: [
    "오픈홀은 화이트 갤러리 벽과 전문 조명을 갖추고 있습니다.",
    "설치·철수 시간 별도 협의가 가능합니다.",
  ],
  performance: [
    "메인스튜디오는 전문 음향·조명 시스템이 갖춰져 있습니다.",
    "외부 엔지니어 반입이 가능합니다.",
  ],
  workshop: [
    "스크린, 프로젝터, 화이트보드 등 강의 장비가 구비되어 있습니다.",
    "케이터링 협업도 가능합니다.",
  ],
  brand_event: [
    "브랜드 컬러에 맞게 공간 커스텀이 가능합니다.",
    "미디어 촬영을 위한 드롭쉿 배경도 준비 가능합니다.",
  ],
  corporate: [
    "반일/종일 패키지로 효율적인 운영이 가능합니다.",
    "B2B 정기 계약 시 추가 혜택이 있습니다.",
  ],
  shoot: [
    "메인스튜디오는 사이클로라마와 전문 조명 시스템이 있습니다.",
    "가든야드는 자연광 촬영에 최적화되어 있습니다.",
  ],
  wedding: [
    "가든야드는 최대 50명의 아늑한 프라이빗 웨딩이 가능합니다.",
    "플로리스트·케이터링 파트너 추천 서비스를 제공합니다.",
  ],
  gathering: [
    "카페공간은 바 카운터와 음향 시스템이 갖춰져 있습니다.",
    "케이터링 파트너와 협업해 드립니다.",
  ],
  consultation: [
    "담당자가 맞춤 플랜을 제안해 드립니다.",
    "접수 후 1-2영업일 내 연락드립니다.",
  ],
};

const BUDGET_OPTIONS = [
  "50만원 미만",
  "50-100만원",
  "100-300만원",
  "300-500만원",
  "500만원 이상",
  "미정",
];

// ─── Contact form schema ───────────────────────────────────────────────────────

const contactSchema = z.object({
  name: z.string().min(2, "이름을 입력해 주세요"),
  phone: z.string().min(10, "연락처를 입력해 주세요"),
  email: z
    .string()
    .email("올바른 이메일 주소를 입력해 주세요")
    .optional()
    .or(z.literal("")),
  company: z.string().optional(),
  notes: z.string().optional(),
});
type ContactFormValues = z.infer<typeof contactSchema>;

// ─── Animation variants ───────────────────────────────────────────────────────

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.38, ease: "easeOut" as const },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -60 : 60,
    transition: { duration: 0.25, ease: "easeIn" as const },
  }),
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 h-[3px] bg-brand-line">
      <motion.div
        className="h-full bg-brand-black"
        animate={{ width: `${(step / total) * 100}%` }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      />
    </div>
  );
}

function StepLabel({
  step,
  total,
  label,
}: {
  step: number;
  total: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-10">
      <span className="font-sans text-[9px] tracking-[0.25em] uppercase text-brand-subtle">
        {step} / {total}
      </span>
      <span className="w-4 h-px bg-brand-border" />
      <span className="font-sans text-[9px] tracking-[0.25em] uppercase text-brand-subtle">
        {label}
      </span>
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextLabel = "다음",
  backVisible = true,
  loading = false,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  backVisible?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="flex items-center justify-between mt-12 pt-8 border-t border-brand-line">
      {backVisible ? (
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-sans text-xs tracking-widest uppercase text-brand-subtle hover:text-brand-black transition-colors"
        >
          <ChevronLeft size={14} /> 이전
        </button>
      ) : (
        <div />
      )}
      <button
        onClick={onNext}
        disabled={loading}
        className="flex items-center gap-2 px-8 py-3 bg-brand-black text-white font-sans text-[10px] tracking-[0.2em] uppercase hover:bg-brand-charcoal transition-colors disabled:opacity-50"
      >
        {loading ? "처리 중..." : nextLabel}
        {!loading && <ChevronRight size={14} />}
      </button>
    </div>
  );
}

// ─── Step 1: Event Type Selection ─────────────────────────────────────────────

function Step1({
  selected,
  onSelect,
  onNext,
}: {
  selected: EventType | null;
  onSelect: (t: EventType) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <StepLabel step={1} total={4} label="행사 유형" />
      <h1 className="font-display text-[2.4rem] font-light text-brand-black mb-3 leading-tight">
        어떤 행사를
        <br />
        준비하고 계신가요?
      </h1>
      <p className="font-sans text-sm text-brand-muted mb-10">
        행사 유형에 맞는 최적의 공간과 플랜을 제안해 드립니다.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {EVENT_TYPES.map((type) => (
          <motion.button
            key={type.id}
            onClick={() => onSelect(type.id)}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className={`group relative overflow-hidden text-left border-2 transition-all duration-200 ${
              selected === type.id
                ? "border-brand-black"
                : "border-transparent hover:border-brand-border"
            }`}
          >
            {/* Image */}
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={type.img}
                alt={type.label}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
            </div>
            {/* Label */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="font-display text-base font-light text-white leading-tight">
                {type.label}
              </p>
              <p className="font-sans text-[10px] text-white/60 mt-0.5 leading-snug">
                {type.desc}
              </p>
            </div>
            {/* Selected check */}
            {selected === type.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-brand-black flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <NavButtons
        onBack={() => {}}
        onNext={onNext}
        backVisible={false}
        nextLabel={selected ? "다음 단계" : "유형을 선택해 주세요"}
      />
    </div>
  );
}

// ─── Step 2: Event Details ────────────────────────────────────────────────────

function Step2({
  formData,
  onChange,
  onBack,
  onNext,
}: {
  formData: ReservationFormData;
  onChange: (k: keyof ReservationFormData, v: unknown) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const isShoots = formData.eventType === "shoot";
  const isConsultation = formData.eventType === "consultation";
  const selectedType = EVENT_TYPES.find((t) => t.id === formData.eventType);

  return (
    <div>
      <StepLabel step={2} total={4} label="행사 세부사항" />
      <h1 className="font-display text-[2.4rem] font-light text-brand-black mb-3 leading-tight">
        {selectedType?.label} 행사를
        <br />
        알려주세요
      </h1>
      <p className="font-sans text-sm text-brand-muted mb-10">
        입력하신 정보를 바탕으로 최적의 공간을 추천해 드립니다.
      </p>

      <div className="space-y-8">
        {/* Date */}
        {!isConsultation && (
          <div>
            <label className="block font-sans text-[9px] tracking-[0.2em] uppercase text-brand-subtle mb-3">
              희망 날짜
            </label>
            <input
              type="date"
              value={formData.preferredDate}
              onChange={(e) => onChange("preferredDate", e.target.value)}
              className="w-full border-b border-brand-border bg-transparent font-sans text-sm text-brand-black py-2 outline-none focus:border-brand-black transition-colors"
            />
            <label className="flex items-center gap-2 mt-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.dateFlexible}
                onChange={(e) => onChange("dateFlexible", e.target.checked)}
                className="accent-brand-black"
              />
              <span className="font-sans text-xs text-brand-muted">
                날짜가 유동적입니다
              </span>
            </label>
          </div>
        )}

        {/* Attendees */}
        {!isConsultation && !isShoots && (
          <div>
            <label className="block font-sans text-[9px] tracking-[0.2em] uppercase text-brand-subtle mb-3">
              예상 인원
            </label>
            <input
              type="number"
              min="1"
              max="200"
              placeholder="예) 50"
              value={formData.expectedAttendees}
              onChange={(e) => onChange("expectedAttendees", e.target.value)}
              className="w-full border-b border-brand-border bg-transparent font-display text-3xl font-light text-brand-black py-2 outline-none focus:border-brand-black transition-colors placeholder:text-brand-line"
            />
            <p className="font-sans text-[10px] text-brand-subtle mt-1">명</p>
          </div>
        )}

        {/* Shoot type */}
        {isShoots && (
          <div>
            <label className="block font-sans text-[9px] tracking-[0.2em] uppercase text-brand-subtle mb-3">
              촬영 종류
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                "사진 촬영",
                "영상 촬영",
                "CF · 광고",
                "룩북 · 패션",
                "유튜브 · 콘텐츠",
                "기타",
              ].map((t) => (
                <button
                  key={t}
                  onClick={() =>
                    onChange("additionalDetails", {
                      ...formData.additionalDetails,
                      shootType: t,
                    })
                  }
                  className={`py-2.5 px-3 text-left font-sans text-xs border transition-all ${
                    formData.additionalDetails.shootType === t
                      ? "border-brand-black text-brand-black"
                      : "border-brand-line text-brand-muted hover:border-brand-border"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Purpose / notes */}
        {!isConsultation && (
          <div>
            <label className="block font-sans text-[9px] tracking-[0.2em] uppercase text-brand-subtle mb-3">
              행사 목적 및 분위기{" "}
              <span className="text-brand-line normal-case">(선택)</span>
            </label>
            <textarea
              rows={3}
              placeholder="행사의 성격, 분위기, 특별 요구사항을 간단히 적어주세요"
              value={formData.eventPurpose}
              onChange={(e) => onChange("eventPurpose", e.target.value)}
              className="w-full border-b border-brand-border bg-transparent font-sans text-sm text-brand-black py-2 outline-none focus:border-brand-black transition-colors resize-none placeholder:text-brand-line"
            />
          </div>
        )}

        {/* Budget */}
        {!isConsultation && (
          <div>
            <label className="block font-sans text-[9px] tracking-[0.2em] uppercase text-brand-subtle mb-3">
              예산 범위{" "}
              <span className="text-brand-line normal-case">(선택)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {BUDGET_OPTIONS.map((b) => (
                <button
                  key={b}
                  onClick={() =>
                    onChange("budgetRange", formData.budgetRange === b ? "" : b)
                  }
                  className={`px-3 py-1.5 font-sans text-xs border transition-all ${
                    formData.budgetRange === b
                      ? "border-brand-black text-brand-black"
                      : "border-brand-line text-brand-muted hover:border-brand-border"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
}

// ─── Step 3: Space Recommendation ────────────────────────────────────────────

function Step3({
  formData,
  onChange,
  onBack,
  onNext,
}: {
  formData: ReservationFormData;
  onChange: (k: keyof ReservationFormData, v: unknown) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const attendees = parseInt(formData.expectedAttendees) || 0;
  const recommended = getRecommendedSpace(formData.eventType!, attendees);
  const selectedId = formData.selectedSpaceId || recommended.id;

  const handleSelect = (spaceId: string) => {
    const sp = SPACES.find((s) => s.id === spaceId);
    onChange("selectedSpaceId", spaceId);
    onChange("recommendedSpace", sp?.nameKo || "");
  };

  if (!formData.selectedSpaceId && formData.eventType) {
    onChange("selectedSpaceId", recommended.id);
    onChange("recommendedSpace", recommended.nameKo);
  }

  return (
    <div>
      <StepLabel step={3} total={4} label="공간 추천" />
      <h1 className="font-display text-[2.4rem] font-light text-brand-black mb-3 leading-tight">
        이런 공간은
        <br />
        어떠세요?
      </h1>
      <p className="font-sans text-sm text-brand-muted mb-10">
        행사 조건에 맞는 최적의 공간을 추천해 드립니다.
      </p>

      <div className="space-y-4">
        {SPACES.map((space) => {
          const isSelected = selectedId === space.id;
          const isRecommended = recommended.id === space.id;
          const fits = attendees === 0 || attendees <= space.cap;

          return (
            <motion.button
              key={space.id}
              onClick={() => handleSelect(space.id)}
              whileHover={{ x: 2 }}
              transition={{ duration: 0.2 }}
              className={`w-full flex items-stretch gap-4 border-2 text-left transition-all duration-200 ${
                isSelected
                  ? "border-brand-black"
                  : "border-brand-line hover:border-brand-border"
              }`}
            >
              {/* Image */}
              <div className="w-28 shrink-0 overflow-hidden">
                <img
                  src={space.img}
                  alt={space.nameKo}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              {/* Info */}
              <div className="flex-1 py-4 pr-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <p className="font-display text-lg font-light text-brand-black leading-tight">
                      {space.nameKo}
                    </p>
                    <p className="font-sans text-[9px] tracking-widest uppercase text-brand-subtle">
                      {space.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isRecommended && (
                      <span className="font-sans text-[8px] tracking-widest uppercase bg-brand-black text-white px-2 py-1">
                        추천
                      </span>
                    )}
                    {isSelected && (
                      <div className="w-6 h-6 bg-brand-black flex items-center justify-center shrink-0">
                        <Check size={11} className="text-white" />
                      </div>
                    )}
                  </div>
                </div>
                <p className="font-sans text-[11px] text-brand-muted leading-relaxed mb-2">
                  {space.desc}
                </p>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-sans text-[10px] ${fits ? "text-brand-muted" : "text-rose-400"}`}
                  >
                    최대 {space.cap}명
                    {!fits && attendees > 0 && ` · 수용 인원 초과`}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <NavButtons onBack={onBack} onNext={onNext} nextLabel="공간 확정" />
    </div>
  );
}

// ─── Step 4: Contact Info ─────────────────────────────────────────────────────

function Step4({
  onBack,
  onSubmit,
  loading,
}: {
  onBack: () => void;
  onSubmit: (data: ContactFormValues) => void;
  loading: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
  });

  return (
    <div>
      <StepLabel step={4} total={4} label="연락처" />
      <h1 className="font-display text-[2.4rem] font-light text-brand-black mb-3 leading-tight">
        마지막으로
        <br />
        연락처를 알려주세요
      </h1>
      <p className="font-sans text-sm text-brand-muted mb-10">
        담당자가 1-2영업일 내 직접 연락드립니다.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
        {/* Name */}
        <div>
          <label className="block font-sans text-[9px] tracking-[0.2em] uppercase text-brand-subtle mb-2">
            이름 *
          </label>
          <input
            {...register("name")}
            placeholder="홍길동"
            className="w-full border-b border-brand-border bg-transparent font-sans text-sm text-brand-black py-2 outline-none focus:border-brand-black transition-colors placeholder:text-brand-line"
          />
          {errors.name && (
            <p className="font-sans text-xs text-rose-500 mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block font-sans text-[9px] tracking-[0.2em] uppercase text-brand-subtle mb-2">
            휴대폰 *
          </label>
          <input
            {...register("phone")}
            type="tel"
            placeholder="010-0000-0000"
            className="w-full border-b border-brand-border bg-transparent font-sans text-sm text-brand-black py-2 outline-none focus:border-brand-black transition-colors placeholder:text-brand-line"
          />
          {errors.phone && (
            <p className="font-sans text-xs text-rose-500 mt-1">
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block font-sans text-[9px] tracking-[0.2em] uppercase text-brand-subtle mb-2">
            이메일 <span className="text-brand-line normal-case">(선택)</span>
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="hello@example.com"
            className="w-full border-b border-brand-border bg-transparent font-sans text-sm text-brand-black py-2 outline-none focus:border-brand-black transition-colors placeholder:text-brand-line"
          />
          {errors.email && (
            <p className="font-sans text-xs text-rose-500 mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Company */}
        <div>
          <label className="block font-sans text-[9px] tracking-[0.2em] uppercase text-brand-subtle mb-2">
            회사 / 단체명{" "}
            <span className="text-brand-line normal-case">(선택)</span>
          </label>
          <input
            {...register("company")}
            placeholder="예) (주)더릿컬쳐"
            className="w-full border-b border-brand-border bg-transparent font-sans text-sm text-brand-black py-2 outline-none focus:border-brand-black transition-colors placeholder:text-brand-line"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block font-sans text-[9px] tracking-[0.2em] uppercase text-brand-subtle mb-2">
            추가 요청사항{" "}
            <span className="text-brand-line normal-case">(선택)</span>
          </label>
          <textarea
            {...register("notes")}
            rows={3}
            placeholder="추가로 전달할 내용이 있으면 적어주세요"
            className="w-full border-b border-brand-border bg-transparent font-sans text-sm text-brand-black py-2 outline-none focus:border-brand-black transition-colors resize-none placeholder:text-brand-line"
          />
        </div>

        <div className="flex items-center justify-between pt-8 border-t border-brand-line">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 font-sans text-xs tracking-widest uppercase text-brand-subtle hover:text-brand-black transition-colors"
          >
            <ChevronLeft size={14} /> 이전
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-brand-black text-white font-sans text-[10px] tracking-[0.2em] uppercase hover:bg-brand-charcoal transition-colors disabled:opacity-50"
          >
            {loading ? "접수 중..." : "예약 요청 접수"}
            {!loading && <Check size={14} />}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Step 5: Complete ─────────────────────────────────────────────────────────

function Step5({
  formData,
  onReset,
}: {
  formData: ReservationFormData;
  onReset: () => void;
}) {
  const navigate = useNavigate();
  const space = SPACES.find((s) => s.id === formData.selectedSpaceId);
  const type = EVENT_TYPES.find((t) => t.id === formData.eventType);

  return (
    <div className="text-center py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-16 h-16 bg-brand-black flex items-center justify-center mx-auto mb-8"
      >
        <Check size={28} className="text-white" />
      </motion.div>

      <h1 className="font-display text-[2.4rem] font-light text-brand-black mb-3 leading-tight">
        예약 요청이
        <br />
        접수되었습니다
      </h1>
      <p className="font-sans text-sm text-brand-muted mb-10 max-w-sm mx-auto">
        담당자가 확인 후 1-2영업일 내 <strong>{formData.phone}</strong>으로 직접
        연락드립니다.
      </p>

      {/* Summary */}
      {(type || space) && (
        <div className="bg-brand-cream border border-brand-line p-6 text-left max-w-sm mx-auto mb-10 space-y-3">
          <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-brand-subtle mb-4">
            접수 요약
          </p>
          {type && (
            <div className="flex justify-between">
              <span className="font-sans text-xs text-brand-muted">
                행사 유형
              </span>
              <span className="font-sans text-xs text-brand-black">
                {type.label}
              </span>
            </div>
          )}
          {space && (
            <div className="flex justify-between">
              <span className="font-sans text-xs text-brand-muted">
                추천 공간
              </span>
              <span className="font-sans text-xs text-brand-black">
                {space.nameKo}
              </span>
            </div>
          )}
          {formData.expectedAttendees && (
            <div className="flex justify-between">
              <span className="font-sans text-xs text-brand-muted">
                예상 인원
              </span>
              <span className="font-sans text-xs text-brand-black">
                {formData.expectedAttendees}명
              </span>
            </div>
          )}
          {formData.preferredDate && (
            <div className="flex justify-between">
              <span className="font-sans text-xs text-brand-muted">
                희망 날짜
              </span>
              <span className="font-sans text-xs text-brand-black">
                {formData.preferredDate}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="font-sans text-xs text-brand-muted">연락처</span>
            <span className="font-sans text-xs text-brand-black">
              {formData.phone}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={() => navigate("/spaces")}
          className="px-6 py-2.5 border border-brand-black text-brand-black font-sans text-[10px] tracking-[0.18em] uppercase hover:bg-brand-black hover:text-white transition-all"
        >
          공간 둘러보기
        </button>
        <button
          onClick={onReset}
          className="px-6 py-2.5 font-sans text-[10px] tracking-[0.18em] uppercase text-brand-subtle hover:text-brand-black transition-colors"
        >
          새 예약 요청
        </button>
      </div>
    </div>
  );
}

// ─── AI Concierge Panel ───────────────────────────────────────────────────────

function AIConcierge({
  eventType,
  step,
}: {
  eventType: EventType | null;
  step: number;
}) {
  const [open, setOpen] = useState(false);
  const key = eventType && step > 1 ? eventType : "default";
  const hints = CONCIERGE_HINTS[key] || CONCIERGE_HINTS.default;

  if (step >= 5) return null;

  return (
    <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="w-72 bg-white border border-brand-line shadow-xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={13} className="text-brand-accent" />
                <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-brand-subtle">
                  Concierge
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-brand-subtle hover:text-brand-black transition-colors"
              >
                <X size={13} />
              </button>
            </div>
            <div className="space-y-3">
              {hints.map((hint, i) => (
                <motion.p
                  key={hint}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="font-sans text-xs text-brand-black leading-relaxed"
                >
                  · {hint}
                </motion.p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-4 py-2.5 font-sans text-[10px] tracking-widest uppercase transition-all shadow-lg ${
          open
            ? "bg-brand-black text-white"
            : "bg-white text-brand-black border border-brand-border hover:border-brand-black"
        }`}
      >
        <Sparkles size={12} />
        {open ? "닫기" : "공간 안내"}
      </button>
    </div>
  );
}

// ─── Initial form state ───────────────────────────────────────────────────────

const INITIAL_FORM: ReservationFormData = {
  eventType: null,
  preferredDate: "",
  dateFlexible: false,
  expectedAttendees: "",
  eventPurpose: "",
  budgetRange: "",
  additionalDetails: {},
  recommendedSpace: "",
  selectedSpaceId: "",
  name: "",
  phone: "",
  email: "",
  company: "",
  notes: "",
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReservationPage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<ReservationFormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const TOTAL_STEPS = 4;
  const isConsultation = formData.eventType === "consultation";

  const update = (k: keyof ReservationFormData, v: unknown) =>
    setFormData((prev) => ({ ...prev, [k]: v }));

  const goNext = () => {
    setDirection(1);
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStep1Next = () => {
    if (!formData.eventType) return;
    if (isConsultation) {
      setDirection(1);
      setStep(4); // Skip details & space recommendation
    } else {
      goNext();
    }
  };

  const handleStep4Back = () => {
    if (isConsultation) {
      setDirection(-1);
      setStep(1); // Consultation skipped steps 2 & 3, go back to step 1
    } else {
      goBack();
    }
  };

  const handleSubmit = async (contact: ContactFormValues) => {
    setLoading(true);
    setError(null);
    try {
      const finalData: ReservationFormData = {
        ...formData,
        name: contact.name,
        phone: contact.phone,
        email: contact.email || "",
        company: contact.company || "",
        notes: contact.notes || "",
      };
      await reservationsService.create(finalData);
      setFormData(finalData);
      setDirection(1);
      setStep(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setDirection(1);
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Helmet>
        <title>공간 예약 — The Lit</title>
        <meta
          name="description"
          content="더릿 복합문화공간 예약 — 전시, 공연, 브랜드 행사, 촬영 등 맞춤 공간을 예약하세요."
        />
      </Helmet>

      <ProgressBar step={step > TOTAL_STEPS ? TOTAL_STEPS : step} total={TOTAL_STEPS} />

      {/* Header area */}
      <div className="pt-20 pb-6 px-6 lg:px-0 border-b border-brand-line">
        <div className="container-narrow">
          <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-brand-subtle">
            The Lit — 공간 예약
          </p>
        </div>
      </div>

      {/* Main content */}
      <main className="container-narrow py-16 lg:py-20 px-6 lg:px-0 min-h-[70vh]">
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 font-sans text-sm text-rose-700 flex items-center gap-3">
            <X size={14} className="shrink-0" />
            {error}
          </div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {step === 1 && (
              <Step1
                selected={formData.eventType}
                onSelect={(t) => update("eventType", t)}
                onNext={handleStep1Next}
              />
            )}
            {step === 2 && (
              <Step2
                formData={formData}
                onChange={update}
                onBack={goBack}
                onNext={goNext}
              />
            )}
            {step === 3 && (
              <Step3
                formData={formData}
                onChange={update}
                onBack={goBack}
                onNext={goNext}
              />
            )}
            {step === 4 && (
              <Step4
                onBack={handleStep4Back}
                onSubmit={handleSubmit}
                loading={loading}
              />
            )}
            {step === 5 && <Step5 formData={formData} onReset={handleReset} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* AI Concierge */}
      <AIConcierge eventType={formData.eventType} step={step} />
    </>
  );
}
