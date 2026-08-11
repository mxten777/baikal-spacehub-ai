import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { aboutService, DEFAULT_ABOUT } from "../../services/about";
import { useAuth } from "../../hooks/useAuth";
import type {
  AboutContent,
  AboutTimelineItem,
  AboutValueItem,
  JourneyStep,
  WeddingExperience,
} from "../../types";
import { Check, Loader2, Plus, Trash2, GripVertical, Lock } from "lucide-react";

type BrandTab =
  | "story"
  | "journey"
  | "wedding"
  | "philosophy"
  | "history"
  | "seo";

type SectionKey =
  | "story"
  | "journey"
  | "wedding"
  | "philosophy"
  | "history"
  | "seo";

const TABS: { key: BrandTab; label: string; superAdminOnly?: boolean }[] = [
  { key: "story", label: "Brand Story" },
  { key: "journey", label: "Experience Journey" },
  { key: "wedding", label: "Wedding Experience" },
  { key: "philosophy", label: "Philosophy" },
  { key: "history", label: "History" },
  { key: "seo", label: "SEO", superAdminOnly: true },
];

export default function AdminBrandPage() {
  const { isSuperAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<BrandTab>(() => {
    const t = searchParams.get("tab") as BrandTab | null;
    const valid: BrandTab[] = ["story", "journey", "wedding", "philosophy", "history", "seo"];
    return t && valid.includes(t) ? t : "story";
  });
  const [content, setContent] = useState<AboutContent>({
    id: "",
    updated_at: new Date().toISOString(),
    ...DEFAULT_ABOUT,
  });
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<SectionKey | null>(null);
  const [savedSection, setSavedSection] = useState<SectionKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 8000);
    aboutService
      .get()
      .then(setContent)
      .finally(() => {
        clearTimeout(timer);
        setLoading(false);
      });
    return () => clearTimeout(timer);
  }, []);

  const handleSave = useCallback(
    async (
      section: SectionKey,
      updates: Partial<Omit<AboutContent, "id" | "updated_at">>,
    ) => {
      if (!content) return;
      setSavingSection(section);
      setError(null);
      try {
        const updated = await aboutService.update(content.id, updates);
        setContent(updated);
        setSavedSection(section);
        setTimeout(() => setSavedSection(null), 2000);
      } catch (e) {
        setError(e instanceof Error ? e.message : "저장에 실패했습니다.");
      } finally {
        setSavingSection(null);
      }
    },
    [content],
  );

  const visibleTabs = TABS.filter((t) => !t.superAdminOnly || isSuperAdmin);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-light text-brand-black">
          Brand CMS
        </h1>
        {loading && (
          <p className="font-sans text-xs text-brand-muted mt-1 flex items-center gap-1.5">
            <Loader2 size={12} className="animate-spin" /> 데이터 불러오는 중...
          </p>
        )}
        <p className="font-sans text-sm text-gray-500 mt-1">
          브랜드 핵심 콘텐츠의 원본 관리 위치입니다. Story · Philosophy · History는 이 페이지에서만 수정합니다.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 mb-8 overflow-x-auto">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-5 py-3 font-sans text-xs font-medium tracking-wider uppercase whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-brand-black text-brand-black"
                : "border-transparent text-gray-400 hover:text-brand-black"
            }`}
          >
            {tab.superAdminOnly && <Lock size={10} />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === "story" && (
          <StorySectionPanel
            content={content}
            saving={savingSection === "story"}
            saved={savedSection === "story"}
            onSave={(u) => handleSave("story", u)}
          />
        )}
        {activeTab === "journey" && (
          <JourneyPanel
            content={content}
            saving={savingSection === "journey"}
            saved={savedSection === "journey"}
            onSave={(u) => handleSave("journey", u)}
          />
        )}
        {activeTab === "wedding" && (
          <WeddingPanel
            content={content}
            saving={savingSection === "wedding"}
            saved={savedSection === "wedding"}
            onSave={(u) => handleSave("wedding", u)}
          />
        )}
        {activeTab === "philosophy" && (
          <PhilosophyPanel
            content={content}
            saving={savingSection === "philosophy"}
            saved={savedSection === "philosophy"}
            onSave={(u) => handleSave("philosophy", u)}
          />
        )}
        {activeTab === "history" && (
          <HistoryPanel
            content={content}
            saving={savingSection === "history"}
            saved={savedSection === "history"}
            onSave={(u) => handleSave("history", u)}
          />
        )}
        {activeTab === "seo" && isSuperAdmin && (
          <SeoPanel
            content={content}
            saving={savingSection === "seo"}
            saved={savedSection === "seo"}
            onSave={(u) => handleSave("seo", u)}
          />
        )}
      </div>
    </div>
  );
}

// ── Shared UI ──────────────────────────────────────────────────────────────────

function SectionCard({
  title,
  subtitle,
  saving,
  saved,
  onSave,
  children,
}: {
  title: string;
  subtitle?: string;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h2 className="font-sans text-sm font-medium text-brand-black tracking-wide">
            {title}
          </h2>
          {subtitle && (
            <p className="font-sans text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className={`flex items-center gap-1.5 px-5 py-2 text-xs font-sans tracking-wider uppercase transition-colors disabled:opacity-50 ${
            saved
              ? "bg-green-600 text-white"
              : "bg-brand-black text-white hover:bg-brand-muted"
          }`}
        >
          {saving ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Check size={12} />
          )}
          {saved ? "저장됨" : "저장"}
        </button>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block font-sans text-xs text-gray-500 mb-1.5">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black resize-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
        />
      )}
    </div>
  );
}

// ── Brand Story Panel ──────────────────────────────────────────────────────────

function StorySectionPanel({
  content,
  saving,
  saved,
  onSave,
}: {
  content: AboutContent;
  saving: boolean;
  saved: boolean;
  onSave: (u: Partial<AboutContent>) => void;
}) {
  const [eyebrow, setEyebrow] = useState(content.story_eyebrow);
  const [titleLine1, setTitleLine1] = useState(content.story_title_line1);
  const [titleLine2, setTitleLine2] = useState(content.story_title_line2);
  const [p1, setP1] = useState(content.story_paragraph_1);
  const [p2, setP2] = useState(content.story_paragraph_2);
  const [p3, setP3] = useState(content.story_paragraph_3);
  const [ctaTitle, setCtaTitle] = useState(content.cta_title);
  const [ctaDesc, setCtaDesc] = useState(content.cta_description);

  useEffect(() => {
    setEyebrow(content.story_eyebrow);
    setTitleLine1(content.story_title_line1);
    setTitleLine2(content.story_title_line2);
    setP1(content.story_paragraph_1);
    setP2(content.story_paragraph_2);
    setP3(content.story_paragraph_3);
    setCtaTitle(content.cta_title);
    setCtaDesc(content.cta_description);
  }, [content]);

  return (
    <SectionCard
      title="Brand Story"
      subtitle="원본 관리 위치 — About 페이지 렌더링"
      saving={saving}
      saved={saved}
      onSave={() =>
        onSave({
          story_eyebrow: eyebrow,
          story_title_line1: titleLine1,
          story_title_line2: titleLine2,
          story_paragraph_1: p1,
          story_paragraph_2: p2,
          story_paragraph_3: p3,
          cta_title: ctaTitle,
          cta_description: ctaDesc,
        })
      }
    >
      <Field label="Eyebrow 텍스트" value={eyebrow} onChange={setEyebrow} />
      <div className="grid grid-cols-2 gap-4">
        <Field label="제목 1행" value={titleLine1} onChange={setTitleLine1} />
        <Field label="제목 2행" value={titleLine2} onChange={setTitleLine2} />
      </div>
      <Field
        label="본문 단락 1"
        value={p1}
        onChange={setP1}
        multiline
        rows={3}
      />
      <Field
        label="본문 단락 2"
        value={p2}
        onChange={setP2}
        multiline
        rows={3}
      />
      <Field
        label="본문 단락 3"
        value={p3}
        onChange={setP3}
        multiline
        rows={3}
      />
      <div className="pt-2 border-t border-gray-100">
        <p className="font-sans text-xs text-gray-400 mb-3 uppercase tracking-wider">
          CTA
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="CTA 제목" value={ctaTitle} onChange={setCtaTitle} />
          <Field
            label="CTA 설명"
            value={ctaDesc}
            onChange={setCtaDesc}
            multiline
            rows={2}
          />
        </div>
      </div>
    </SectionCard>
  );
}

// ── Experience Journey Panel ───────────────────────────────────────────────────

function JourneyPanel({
  content,
  saving,
  saved,
  onSave,
}: {
  content: AboutContent;
  saving: boolean;
  saved: boolean;
  onSave: (u: Partial<AboutContent>) => void;
}) {
  const [steps, setSteps] = useState<JourneyStep[]>(
    content.journey_steps ?? [],
  );

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setSteps(content.journey_steps ?? []);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [content]);

  const update = (
    idx: number,
    key: keyof JourneyStep,
    val: string | boolean,
  ) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [key]: val } : s)),
    );
  };

  const add = () => {
    const next = steps.length + 1;
    setSteps((prev) => [
      ...prev,
      {
        number: String(next).padStart(2, "0"),
        emotion: "",
        desc: "",
        is_visible: true,
      },
    ]);
  };

  const remove = (idx: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <SectionCard
      title="Experience Journey"
      subtitle="홈페이지 — Walk Into The Light 섹션"
      saving={saving}
      saved={saved}
      onSave={() => onSave({ journey_steps: steps })}
    >
      <p className="font-sans text-xs text-gray-400">
        감정 흐름 단계를 수정합니다. 노출 여부 체크 해제 시 홈페이지에서
        숨겨집니다.
      </p>
      <div className="space-y-3 mt-2">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`flex gap-3 p-4 border ${step.is_visible ? "border-gray-100 bg-gray-50" : "border-gray-100 bg-gray-100 opacity-60"}`}
          >
            <GripVertical size={14} className="text-gray-300 mt-2.5 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-[60px_1fr_3fr] gap-2">
                <input
                  value={step.number}
                  onChange={(e) => update(idx, "number", e.target.value)}
                  placeholder="01"
                  className="border border-gray-200 px-2 py-1.5 text-sm font-sans focus:outline-none focus:border-brand-black"
                />
                <input
                  value={step.emotion}
                  onChange={(e) => update(idx, "emotion", e.target.value)}
                  placeholder="단계명 (영문)"
                  className="border border-gray-200 px-2 py-1.5 text-sm font-sans focus:outline-none focus:border-brand-black"
                />
                <input
                  value={step.desc}
                  onChange={(e) => update(idx, "desc", e.target.value)}
                  placeholder="설명"
                  className="border border-gray-200 px-2 py-1.5 text-sm font-sans focus:outline-none focus:border-brand-black"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={step.icon ?? ""}
                  onChange={(e) => update(idx, "icon", e.target.value)}
                  placeholder="아이콘 (선택, 이모지/기호)"
                  className="border border-gray-200 px-2 py-1.5 text-sm font-sans focus:outline-none focus:border-brand-black"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`visible-${idx}`}
                    checked={step.is_visible}
                    onChange={(e) =>
                      update(idx, "is_visible", e.target.checked)
                    }
                    className="w-3.5 h-3.5 accent-brand-black"
                  />
                  <label
                    htmlFor={`visible-${idx}`}
                    className="font-sans text-xs text-gray-500"
                  >
                    홈페이지 노출
                  </label>
                </div>
              </div>
            </div>
            <button
              onClick={() => remove(idx)}
              className="text-gray-400 hover:text-red-500 transition-colors shrink-0 mt-0.5"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={add}
        className="flex items-center gap-2 text-sm text-brand-muted hover:text-brand-black transition-colors mt-2"
      >
        <Plus size={14} /> 단계 추가
      </button>
    </SectionCard>
  );
}

// ── Wedding Experience Panel ───────────────────────────────────────────────────

function WeddingPanel({
  content,
  saving,
  saved,
  onSave,
}: {
  content: AboutContent;
  saving: boolean;
  saved: boolean;
  onSave: (u: Partial<AboutContent>) => void;
}) {
  const [tracks, setTracks] = useState<WeddingExperience[]>(
    content.wedding_experiences ?? [],
  );

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setTracks(content.wedding_experiences ?? []);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [content]);

  const update = <K extends keyof WeddingExperience>(
    idx: number,
    key: K,
    val: WeddingExperience[K],
  ) => {
    setTracks((prev) =>
      prev.map((t, i) => (i === idx ? { ...t, [key]: val } : t)),
    );
  };

  const updateKeywords = (idx: number, raw: string) => {
    update(
      idx,
      "keywords",
      raw
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
    );
  };

  const updateRecommended = (idx: number, raw: string) => {
    update(
      idx,
      "recommended",
      raw
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
    );
  };

  const add = () => {
    setTracks((prev) => [
      ...prev,
      {
        number: String(prev.length + 1).padStart(2, "0"),
        track: "",
        keywords: [],
        title: "",
        desc: "",
        recommended: [],
        venue: "",
        cta_text: "",
        cta_href: "/contact",
        is_visible: true,
        sort_order: prev.length + 1,
      },
    ]);
  };

  const remove = (idx: number) => {
    setTracks((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <SectionCard
      title="Wedding Experience"
      subtitle="웨딩 페이지 — 3-Track 웨딩 경험 섹션"
      saving={saving}
      saved={saved}
      onSave={() => onSave({ wedding_experiences: tracks })}
    >
      <p className="font-sans text-xs text-gray-400">
        House Wedding / Garden Wedding / Studio Wedding 3가지 웨딩 경험을
        관리합니다.
      </p>
      <div className="space-y-6 mt-2">
        {tracks.map((track, idx) => (
          <div
            key={idx}
            className={`border ${track.is_visible ? "border-gray-200" : "border-gray-100 opacity-60"} bg-white`}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
              <span className="font-sans text-xs font-medium text-gray-600">
                {track.number} · {track.track || "새 트랙"}
              </span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 font-sans text-xs text-gray-500">
                  <input
                    type="checkbox"
                    checked={track.is_visible}
                    onChange={(e) =>
                      update(idx, "is_visible", e.target.checked)
                    }
                    className="w-3.5 h-3.5 accent-brand-black"
                  />
                  노출
                </label>
                <button
                  onClick={() => remove(idx)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-[60px_1fr_60px] gap-2">
                <input
                  value={track.number}
                  onChange={(e) => update(idx, "number", e.target.value)}
                  placeholder="01"
                  className="border border-gray-200 px-2 py-1.5 text-sm font-sans focus:outline-none focus:border-brand-black"
                />
                <input
                  value={track.track}
                  onChange={(e) => update(idx, "track", e.target.value)}
                  placeholder="트랙명 (예: House Wedding)"
                  className="border border-gray-200 px-2 py-1.5 text-sm font-sans focus:outline-none focus:border-brand-black"
                />
                <input
                  type="number"
                  value={track.sort_order}
                  onChange={(e) =>
                    update(idx, "sort_order", Number(e.target.value))
                  }
                  placeholder="순서"
                  className="border border-gray-200 px-2 py-1.5 text-sm font-sans focus:outline-none focus:border-brand-black"
                />
              </div>
              <input
                value={track.title}
                onChange={(e) => update(idx, "title", e.target.value)}
                placeholder="타이틀 (예: 집 앞마당에서)"
                className="w-full border border-gray-200 px-2 py-1.5 text-sm font-sans focus:outline-none focus:border-brand-black"
              />
              <textarea
                value={track.desc}
                onChange={(e) => update(idx, "desc", e.target.value)}
                placeholder="설명"
                rows={2}
                className="w-full border border-gray-200 px-2 py-1.5 text-sm font-sans focus:outline-none focus:border-brand-black resize-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-sans text-[11px] text-gray-400 mb-1">
                    키워드 (쉼표 구분)
                  </label>
                  <input
                    value={track.keywords.join(", ")}
                    onChange={(e) => updateKeywords(idx, e.target.value)}
                    placeholder="Warm, Intimate, Private"
                    className="w-full border border-gray-200 px-2 py-1.5 text-sm font-sans focus:outline-none focus:border-brand-black"
                  />
                </div>
                <div>
                  <label className="block font-sans text-[11px] text-gray-400 mb-1">
                    추천 대상 (쉼표 구분)
                  </label>
                  <input
                    value={track.recommended.join(", ")}
                    onChange={(e) => updateRecommended(idx, e.target.value)}
                    placeholder="소규모 웨딩, 가족 중심 예식"
                    className="w-full border border-gray-200 px-2 py-1.5 text-sm font-sans focus:outline-none focus:border-brand-black"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block font-sans text-[11px] text-gray-400 mb-1">
                    장소명
                  </label>
                  <input
                    value={track.venue}
                    onChange={(e) => update(idx, "venue", e.target.value)}
                    placeholder="카페 본관 + 잔디정원"
                    className="w-full border border-gray-200 px-2 py-1.5 text-sm font-sans focus:outline-none focus:border-brand-black"
                  />
                </div>
                <div>
                  <label className="block font-sans text-[11px] text-gray-400 mb-1">
                    CTA 텍스트
                  </label>
                  <input
                    value={track.cta_text ?? ""}
                    onChange={(e) => update(idx, "cta_text", e.target.value)}
                    placeholder="House Wedding 문의"
                    className="w-full border border-gray-200 px-2 py-1.5 text-sm font-sans focus:outline-none focus:border-brand-black"
                  />
                </div>
                <div>
                  <label className="block font-sans text-[11px] text-gray-400 mb-1">
                    CTA 링크
                  </label>
                  <input
                    value={track.cta_href ?? ""}
                    onChange={(e) => update(idx, "cta_href", e.target.value)}
                    placeholder="/contact"
                    className="w-full border border-gray-200 px-2 py-1.5 text-sm font-sans focus:outline-none focus:border-brand-black"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={add}
        className="flex items-center gap-2 text-sm text-brand-muted hover:text-brand-black transition-colors mt-2"
      >
        <Plus size={14} /> 트랙 추가
      </button>
    </SectionCard>
  );
}

// ── Philosophy Panel ───────────────────────────────────────────────────────────

function PhilosophyPanel({
  content,
  saving,
  saved,
  onSave,
}: {
  content: AboutContent;
  saving: boolean;
  saved: boolean;
  onSave: (u: Partial<AboutContent>) => void;
}) {
  const [eyebrow, setEyebrow] = useState(content.values_eyebrow);
  const [title, setTitle] = useState(content.values_title);
  const [items, setItems] = useState<AboutValueItem[]>(content.brand_values);

  useEffect(() => {
    setEyebrow(content.values_eyebrow);
    setTitle(content.values_title);
    setItems(content.brand_values);
  }, [content]);

  const update = (idx: number, key: keyof AboutValueItem, val: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [key]: val } : item)),
    );
  };

  const add = () => {
    setItems((prev) => [...prev, { icon: "✦", title: "", desc: "" }]);
  };

  const remove = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <SectionCard
      title="Light Philosophy"
      subtitle="About 페이지 — Core Values 섹션"
      saving={saving}
      saved={saved}
      onSave={() =>
        onSave({
          values_eyebrow: eyebrow,
          values_title: title,
          brand_values: items,
        })
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-sans text-xs text-gray-500 mb-1.5">
            Eyebrow 텍스트
          </label>
          <input
            value={eyebrow}
            onChange={(e) => setEyebrow(e.target.value)}
            className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
          />
        </div>
        <div>
          <label className="block font-sans text-xs text-gray-500 mb-1.5">
            섹션 제목
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
          />
        </div>
      </div>
      <div className="space-y-3 mt-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex gap-3 p-4 border border-gray-100 bg-gray-50"
          >
            <GripVertical size={14} className="text-gray-300 mt-2.5 shrink-0" />
            <div className="grid grid-cols-1 sm:grid-cols-[50px_1fr_3fr] gap-3 flex-1">
              <input
                value={item.icon}
                onChange={(e) => update(idx, "icon", e.target.value)}
                placeholder="아이콘"
                className="border border-gray-200 px-2 py-1.5 text-sm text-center font-sans focus:outline-none focus:border-brand-black"
              />
              <input
                value={item.title}
                onChange={(e) => update(idx, "title", e.target.value)}
                placeholder="제목"
                className="border border-gray-200 px-2 py-1.5 text-sm font-sans focus:outline-none focus:border-brand-black"
              />
              <input
                value={item.desc}
                onChange={(e) => update(idx, "desc", e.target.value)}
                placeholder="설명"
                className="border border-gray-200 px-2 py-1.5 text-sm font-sans focus:outline-none focus:border-brand-black"
              />
            </div>
            <button
              onClick={() => remove(idx)}
              className="text-gray-400 hover:text-red-500 transition-colors shrink-0 mt-0.5"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={add}
        className="flex items-center gap-2 text-sm text-brand-muted hover:text-brand-black transition-colors mt-2"
      >
        <Plus size={14} /> 항목 추가
      </button>
    </SectionCard>
  );
}

// ── History Panel ──────────────────────────────────────────────────────────────

function HistoryPanel({
  content,
  saving,
  saved,
  onSave,
}: {
  content: AboutContent;
  saving: boolean;
  saved: boolean;
  onSave: (u: Partial<AboutContent>) => void;
}) {
  const [items, setItems] = useState<AboutTimelineItem[]>(content.timeline);

  useEffect(() => {
    setItems(content.timeline);
  }, [content]);

  const update = (idx: number, key: keyof AboutTimelineItem, val: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [key]: val } : item)),
    );
  };

  const add = () => {
    setItems((prev) => [...prev, { year: "", title: "", desc: "" }]);
  };

  const remove = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <SectionCard
      title="Brand History"
      subtitle="About 페이지 — 타임라인 섹션"
      saving={saving}
      saved={saved}
      onSave={() => onSave({ timeline: items })}
    >
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex gap-3 p-4 border border-gray-100 bg-gray-50"
          >
            <GripVertical size={14} className="text-gray-300 mt-2.5 shrink-0" />
            <div className="grid grid-cols-1 sm:grid-cols-[80px_1fr_2fr] gap-3 flex-1">
              <input
                value={item.year}
                onChange={(e) => update(idx, "year", e.target.value)}
                placeholder="연도"
                className="border border-gray-200 px-2 py-1.5 text-sm font-sans focus:outline-none focus:border-brand-black"
              />
              <input
                value={item.title}
                onChange={(e) => update(idx, "title", e.target.value)}
                placeholder="제목"
                className="border border-gray-200 px-2 py-1.5 text-sm font-sans focus:outline-none focus:border-brand-black"
              />
              <input
                value={item.desc}
                onChange={(e) => update(idx, "desc", e.target.value)}
                placeholder="설명"
                className="border border-gray-200 px-2 py-1.5 text-sm font-sans focus:outline-none focus:border-brand-black"
              />
            </div>
            <button
              onClick={() => remove(idx)}
              className="text-gray-400 hover:text-red-500 transition-colors shrink-0 mt-0.5"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={add}
        className="flex items-center gap-2 text-sm text-brand-muted hover:text-brand-black transition-colors mt-2"
      >
        <Plus size={14} /> 항목 추가
      </button>
    </SectionCard>
  );
}

// ── SEO Panel (super_admin only) ───────────────────────────────────────────────

function SeoPanel({
  content,
  saving,
  saved,
  onSave,
}: {
  content: AboutContent;
  saving: boolean;
  saved: boolean;
  onSave: (u: Partial<AboutContent>) => void;
}) {
  const [seoTitle, setSeoTitle] = useState(content.seo_title ?? "");
  const [seoDesc, setSeoDesc] = useState(content.seo_description ?? "");
  const [seoOgImage, setSeoOgImage] = useState(content.seo_og_image ?? "");
  const [seoKeywords, setSeoKeywords] = useState(content.seo_keywords ?? "");

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setSeoTitle(content.seo_title ?? "");
    setSeoDesc(content.seo_description ?? "");
    setSeoOgImage(content.seo_og_image ?? "");
    setSeoKeywords(content.seo_keywords ?? "");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [content]);

  return (
    <SectionCard
      title="SEO 설정"
      subtitle="About 페이지 메타 태그 관리 (super_admin 전용)"
      saving={saving}
      saved={saved}
      onSave={() =>
        onSave({
          seo_title: seoTitle,
          seo_description: seoDesc,
          seo_og_image: seoOgImage,
          seo_keywords: seoKeywords,
        })
      }
    >
      <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-amber-50 border border-amber-200">
        <Lock size={12} className="text-amber-600" />
        <span className="font-sans text-xs text-amber-700">
          Super Admin 전용 — SEO 설정은 검색 순위에 직접 영향을 미칩니다.
        </span>
      </div>
      <div>
        <label className="block font-sans text-xs text-gray-500 mb-1.5">
          Title{" "}
          <span className="text-gray-400">({seoTitle.length}/60자 권장)</span>
        </label>
        <input
          value={seoTitle}
          onChange={(e) => setSeoTitle(e.target.value)}
          placeholder="Brand Story — THE LIT | 빛을 향해 걷는 이야기"
          className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
        />
      </div>
      <div>
        <label className="block font-sans text-xs text-gray-500 mb-1.5">
          Description{" "}
          <span className="text-gray-400">({seoDesc.length}/160자 권장)</span>
        </label>
        <textarea
          value={seoDesc}
          onChange={(e) => setSeoDesc(e.target.value)}
          rows={3}
          placeholder="THE LIT를 만든 이유, 빛의 철학, 30m의 여정..."
          className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black resize-none"
        />
      </div>
      <div>
        <label className="block font-sans text-xs text-gray-500 mb-1.5">
          OG Image URL
        </label>
        <input
          value={seoOgImage}
          onChange={(e) => setSeoOgImage(e.target.value)}
          placeholder="https://..."
          className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black"
        />
      </div>
      <div>
        <label className="block font-sans text-xs text-gray-500 mb-1.5">
          Keywords (쉼표 구분)
        </label>
        <textarea
          value={seoKeywords}
          onChange={(e) => setSeoKeywords(e.target.value)}
          rows={2}
          placeholder="더릿 브랜드 스토리, 복합문화공간 철학, THE LIT..."
          className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black resize-none"
        />
      </div>
    </SectionCard>
  );
}
