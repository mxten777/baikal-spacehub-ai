import { useState, useEffect, useCallback } from "react";
import { aboutService, DEFAULT_ABOUT } from "../../services/about";
import ImageUploadField from "../../components/admin/ImageUploadField";
import type {
  AboutContent,
  AboutTimelineItem,
  AboutValueItem,
  BrandIntroPillar,
} from "../../types";
import { Check, Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import { deleteStorageFilesByUrls } from "../../lib/storage";

type SectionKey =
  | "hero"
  | "mission"
  | "story"
  | "timeline"
  | "values"
  | "cta"
  | "brand_intro";

export default function AdminAboutPage() {
  const [content, setContent] = useState<AboutContent>({
    id: "",
    updated_at: new Date().toISOString(),
    ...DEFAULT_ABOUT,
  });
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<SectionKey | null>(null);
  const [savedSection, setSavedSection] = useState<SectionKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);

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
      // Capture image URLs that will be replaced by this save
      const urlsToDelete = new Set<string>();
      if (
        "hero_image_url" in updates &&
        content.hero_image_url &&
        updates.hero_image_url !== content.hero_image_url
      ) {
        urlsToDelete.add(content.hero_image_url);
      }
      if (
        "brand_intro_image_url" in updates &&
        content.brand_intro_image_url &&
        updates.brand_intro_image_url !== content.brand_intro_image_url
      ) {
        urlsToDelete.add(content.brand_intro_image_url);
      }
      try {
        const updated = await aboutService.update(content.id, updates);
        setContent(updated);
        setSavedSection(section);
        setTimeout(() => setSavedSection(null), 2000);
        if (urlsToDelete.size > 0) {
          deleteStorageFilesByUrls(urlsToDelete)
            .then((result) => {
              if (result.failed.length > 0) {
                result.failed.forEach(({ url, error }) =>
                  console.error("[Storage cleanup]", url, error),
                );
                setStorageWarning(
                  "내용은 저장되었지만 일부 이전 이미지 파일을 정리하지 못했습니다.",
                );
              }
            })
            .catch(console.error);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "저장에 실패했습니다.");
      } finally {
        setSavingSection(null);
      }
    },
    [content],
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-light text-brand-black">
          About 페이지 관리
        </h1>
        {loading && (
          <p className="font-sans text-xs text-brand-muted mt-1 flex items-center gap-1.5">
            <Loader2 size={12} className="animate-spin" /> 데이터 불러오는 중...
          </p>
        )}
        <p className="font-sans text-sm text-gray-500 mt-1">
          About 페이지의 모든 콘텐츠를 편집합니다.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {storageWarning && (
        <div className="flex items-center justify-between gap-3 mb-6 px-4 py-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-sans">
          <span>{storageWarning}</span>
          <button
            type="button"
            onClick={() => setStorageWarning(null)}
            className="shrink-0 text-amber-600 hover:text-amber-900"
          >
            ✕
          </button>
        </div>
      )}

      <div className="space-y-10">
        {/* ── Hero ── */}
        <HeroSection
          content={content}
          saving={savingSection === "hero"}
          saved={savedSection === "hero"}
          onSave={(updates) => handleSave("hero", updates)}
        />

        {/* ── Mission ── */}
        <MissionSection
          content={content}
          saving={savingSection === "mission"}
          saved={savedSection === "mission"}
          onSave={(updates) => handleSave("mission", updates)}
        />

        {/* ── Story ── */}
        <StorySection
          content={content}
          saving={savingSection === "story"}
          saved={savedSection === "story"}
          onSave={(updates) => handleSave("story", updates)}
        />

        {/* ── Timeline ── */}
        <TimelineSection
          content={content}
          saving={savingSection === "timeline"}
          saved={savedSection === "timeline"}
          onSave={(updates) => handleSave("timeline", updates)}
        />

        {/* ── Values ── */}
        <ValuesSection
          content={content}
          saving={savingSection === "values"}
          saved={savedSection === "values"}
          onSave={(updates) => handleSave("values", updates)}
        />

        {/* ── CTA ── */}
        <CtaSection
          content={content}
          saving={savingSection === "cta"}
          saved={savedSection === "cta"}
          onSave={(updates) => handleSave("cta", updates)}
        />

        {/* ── Brand Intro (홈 철학 섹션) ── */}
        <BrandIntroAdminSection
          content={content}
          saving={savingSection === "brand_intro"}
          saved={savedSection === "brand_intro"}
          onSave={(updates) => handleSave("brand_intro", updates)}
        />
      </div>
    </div>
  );
}

// ── Shared UI ──────────────────────────────────────────────────────────────────

function SectionCard({
  title,
  saving,
  saved,
  onSave,
  children,
}: {
  title: string;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="font-sans text-sm font-medium text-brand-black tracking-wide">
          {title}
        </h2>
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

// ── Hero Section ───────────────────────────────────────────────────────────────

function HeroSection({
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
  const [heroImageUrl, setHeroImageUrl] = useState(content.hero_image_url);
  const [heroEyebrow, setHeroEyebrow] = useState(content.hero_eyebrow);
  const [heroTitleLine1, setHeroTitleLine1] = useState(
    content.hero_title_line1,
  );
  const [heroTitleLine2, setHeroTitleLine2] = useState(
    content.hero_title_line2,
  );

  useEffect(() => {
    setHeroImageUrl(content.hero_image_url);
    setHeroEyebrow(content.hero_eyebrow);
    setHeroTitleLine1(content.hero_title_line1);
    setHeroTitleLine2(content.hero_title_line2);
  }, [content]);

  return (
    <SectionCard
      title="Hero"
      saving={saving}
      saved={saved}
      onSave={() =>
        onSave({
          hero_image_url: heroImageUrl,
          hero_eyebrow: heroEyebrow,
          hero_title_line1: heroTitleLine1,
          hero_title_line2: heroTitleLine2,
        })
      }
    >
      <ImageUploadField
        label="배경 이미지 URL"
        value={heroImageUrl}
        onChange={(url) => setHeroImageUrl(url ?? "")}
        folder="about"
        photoPickerCategory={null}
      />
      <Field
        label="Eyebrow 텍스트"
        value={heroEyebrow}
        onChange={setHeroEyebrow}
      />
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="제목 1행"
          value={heroTitleLine1}
          onChange={setHeroTitleLine1}
          placeholder="문화의 불꽃을"
        />
        <Field
          label="제목 2행 (이탤릭)"
          value={heroTitleLine2}
          onChange={setHeroTitleLine2}
          placeholder="켜는 공간"
        />
      </div>
    </SectionCard>
  );
}

// ── Mission Section ────────────────────────────────────────────────────────────

function MissionSection({
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
  const [quote, setQuote] = useState(content.mission_quote);
  const [desc, setDesc] = useState(content.mission_description);

  useEffect(() => {
    setQuote(content.mission_quote);
    setDesc(content.mission_description);
  }, [content]);

  return (
    <SectionCard
      title="Our Mission"
      saving={saving}
      saved={saved}
      onSave={() =>
        onSave({
          mission_quote: quote,
          mission_description: desc,
        })
      }
    >
      <Field
        label="미션 인용구"
        value={quote}
        onChange={setQuote}
        multiline
        rows={3}
      />
      <Field
        label="미션 설명"
        value={desc}
        onChange={setDesc}
        multiline
        rows={2}
      />
    </SectionCard>
  );
}

// ── Story Section ──────────────────────────────────────────────────────────────

function StorySection({
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

  useEffect(() => {
    setEyebrow(content.story_eyebrow);
    setTitleLine1(content.story_title_line1);
    setTitleLine2(content.story_title_line2);
    setP1(content.story_paragraph_1);
    setP2(content.story_paragraph_2);
    setP3(content.story_paragraph_3);
  }, [content]);

  return (
    <SectionCard
      title="Our Story"
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
    </SectionCard>
  );
}

// ── Timeline Section ───────────────────────────────────────────────────────────

function TimelineSection({
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
      title="타임라인"
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

// ── Values Section ─────────────────────────────────────────────────────────────

function ValuesSection({
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
      title="Core Values"
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
        <Field label="Eyebrow 텍스트" value={eyebrow} onChange={setEyebrow} />
        <Field label="섹션 제목" value={title} onChange={setTitle} />
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

// ── Brand Intro Section (홈 철학 섹션) ───────────────────────────────────────────

function BrandIntroAdminSection({
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
  const [eyebrow, setEyebrow] = useState(content.brand_intro_eyebrow);
  const [titleLine1, setTitleLine1] = useState(content.brand_intro_title_line1);
  const [titleLine2, setTitleLine2] = useState(content.brand_intro_title_line2);
  const [p1, setP1] = useState(content.brand_intro_paragraph_1);
  const [p2, setP2] = useState(content.brand_intro_paragraph_2);
  const [imageUrl, setImageUrl] = useState(content.brand_intro_image_url);
  const [pillars, setPillars] = useState<BrandIntroPillar[]>(
    content.brand_intro_pillars,
  );

  useEffect(() => {
    setEyebrow(content.brand_intro_eyebrow);
    setTitleLine1(content.brand_intro_title_line1);
    setTitleLine2(content.brand_intro_title_line2);
    setP1(content.brand_intro_paragraph_1);
    setP2(content.brand_intro_paragraph_2);
    setImageUrl(content.brand_intro_image_url);
    setPillars(content.brand_intro_pillars);
  }, [content]);

  const updatePillar = (
    idx: number,
    key: keyof BrandIntroPillar,
    val: string,
  ) => {
    setPillars((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [key]: val } : item)),
    );
  };

  return (
    <SectionCard
      title="홈 철학 섹션 (Our Philosophy)"
      saving={saving}
      saved={saved}
      onSave={() =>
        onSave({
          brand_intro_eyebrow: eyebrow,
          brand_intro_title_line1: titleLine1,
          brand_intro_title_line2: titleLine2,
          brand_intro_paragraph_1: p1,
          brand_intro_paragraph_2: p2,
          brand_intro_image_url: imageUrl,
          brand_intro_pillars: pillars,
        })
      }
    >
      <Field label="Eyebrow 텍스트" value={eyebrow} onChange={setEyebrow} />
      <div className="grid grid-cols-2 gap-4">
        <Field label="제목 1행" value={titleLine1} onChange={setTitleLine1} />
        <Field
          label="제목 2행 (강조색)"
          value={titleLine2}
          onChange={setTitleLine2}
        />
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
        rows={2}
      />
      <ImageUploadField
        label="이미지 URL"
        value={imageUrl}
        onChange={(url) => setImageUrl(url ?? "")}
        folder="about"
        photoPickerCategory={null}
      />
      <div>
        <label className="block font-sans text-xs text-gray-500 mb-2">
          활동 유형 태그
        </label>
        <div className="space-y-2">
          {pillars.map((p, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                value={p.label}
                onChange={(e) => updatePillar(idx, "label", e.target.value)}
                placeholder="한글 이름"
                className="flex-1 border border-gray-200 px-2 py-1.5 text-sm font-sans focus:outline-none focus:border-brand-black"
              />
              <input
                value={p.en}
                onChange={(e) => updatePillar(idx, "en", e.target.value)}
                placeholder="영문 (key)"
                className="flex-1 border border-gray-200 px-2 py-1.5 text-sm font-sans focus:outline-none focus:border-brand-black"
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => setPillars((prev) => [...prev, { label: "", en: "" }])}
          className="flex items-center gap-2 text-sm text-brand-muted hover:text-brand-black transition-colors mt-3"
        >
          <Plus size={14} /> 태그 추가
        </button>
      </div>
    </SectionCard>
  );
}

// ── CTA Section ────────────────────────────────────────────────────────────────

function CtaSection({
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
  const [ctaTitle, setCtaTitle] = useState(content.cta_title);
  const [ctaDesc, setCtaDesc] = useState(content.cta_description);

  useEffect(() => {
    setCtaTitle(content.cta_title);
    setCtaDesc(content.cta_description);
  }, [content]);

  return (
    <SectionCard
      title="CTA (하단 행동 유도)"
      saving={saving}
      saved={saved}
      onSave={() =>
        onSave({
          cta_title: ctaTitle,
          cta_description: ctaDesc,
        })
      }
    >
      <Field label="CTA 제목" value={ctaTitle} onChange={setCtaTitle} />
      <Field
        label="CTA 설명"
        value={ctaDesc}
        onChange={setCtaDesc}
        multiline
        rows={2}
      />
    </SectionCard>
  );
}
