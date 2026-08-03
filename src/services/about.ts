import { supabase } from "../lib/supabase";
import type { AboutContent } from "../types";

const DEFAULT_ABOUT: Omit<AboutContent, "id" | "updated_at"> = {
  hero_image_url: "",
  hero_eyebrow: "Brand Story",
  hero_title_line1: "빛을 향해",
  hero_title_line2: "걷는 이야기",
  mission_quote:
    '"우리는 공간이 아니라 경험을 만들었습니다. 들어서는 순간부터 나가는 순간까지, 그 사이의 모든 감각이 하나의 이야기가 되는 곳."',
  mission_description:
    "서울의 오래된 골목 안, 낡은 창고가 가진 어둠과 빛의 대비 속에서 우리는 하나의 여정을 발견했습니다. 그것이 더릿의 시작입니다.",
  story_eyebrow: "Why THE LIT",
  story_title_line1: "우리는 왜",
  story_title_line2: "이 공간을 만들었나",
  story_paragraph_1:
    "더릿은 공간을 짓지 않았습니다. 경험을 설계했습니다. 서울의 오래된 골목 안, 아무도 주목하지 않던 한 채의 집이 있었습니다. 우리는 그 집이 가진 어둠과 빛의 대비 속에서 하나의 여정을 발견했습니다.",
  story_paragraph_2:
    "골목, 붉은 대문, 살구나무, 그리고 30m의 어두운 통로 끝에 쏟아지는 빛. 들어오는 사람은 모두 같은 경험을 합니다. 그것이 더릿입니다.",
  story_paragraph_3:
    "더릿(The Lit)의 이름은 '빛을 밝히다(to light)'에서 왔습니다. 우리는 어둠이 있어야 빛이 빛난다는 것을 압니다.",
  timeline: [
    {
      year: "2018",
      title: "더릿의 시작",
      desc: "서울 골목 안 낡은 창고를 경험 공간으로 설계하며 더릿의 여정이 시작되었습니다.",
    },
    {
      year: "2020",
      title: "카페 & 빛의 정원 오픈",
      desc: "살구나무 아래 가든과 카페를 열며 30m 여정의 전체 동선이 완성되었습니다.",
    },
    {
      year: "2022",
      title: "스튜디오 & 스토리지",
      desc: "전문 촬영 스튜디오와 대형 다목적 홀을 완성해 복합 경험 공간으로 확장했습니다.",
    },
    {
      year: "2024",
      title: "더릿 플랫폼화",
      desc: "물리적 경험을 넘어 디지털 플랫폼으로 확장, 더 많은 브랜드·크리에이터와 연결됩니다.",
    },
  ],
  values_eyebrow: "Light Philosophy",
  values_title: "어둠이 있어야 빛이 빛난다",
  brand_values: [
    {
      icon: "◐",
      title: "Dark",
      desc: "어둠은 공포가 아니라 가능성입니다. 출발점이 어두울수록 빛의 도착이 강렬합니다.",
    },
    {
      icon: "→",
      title: "Passage",
      desc: "통과하는 과정이 경험을 완성합니다. 30m의 여정이 더릿의 본질입니다.",
    },
    {
      icon: "✦",
      title: "Light",
      desc: "빛은 결과가 아니라 상태입니다. 더릿에서의 모든 시간이 빛입니다.",
    },
    {
      icon: "○",
      title: "Memory",
      desc: "경험은 공간을 떠나도 남습니다. 더릿은 기억 속에 살아있습니다.",
    },
  ],
  cta_title: "Walk Into The Light",
  cta_description: "더릿의 경험을 직접 시작하세요.",
  brand_intro_eyebrow: "The Passage of Transformation",
  brand_intro_title_line1: "30m,",
  brand_intro_title_line2: "어둠에서 빛으로",
  brand_intro_paragraph_1:
    "골목을 걸어 들어오는 순간, 당신의 경험이 시작됩니다. 더릿은 단순한 공간이 아닙니다. 어둠에서 빛으로 이어지는 30m의 여정 — 이것이 THE LIT입니다.",
  brand_intro_paragraph_2:
    "카페, 정원, 스튜디오, 홀, 루프탑. 다섯 개의 공간이 하나의 경험으로 연결됩니다.",
  brand_intro_image_url: "",
  brand_intro_pillars: [
    { label: "골목", en: "The Alley" },
    { label: "빛의 정원", en: "Light Garden" },
    { label: "스튜디오", en: "Studio" },
    { label: "웨딩", en: "Wedding" },
    { label: "촬영", en: "Production" },
    { label: "브랜드 행사", en: "Brand Event" },
  ],
  journey_steps: [
    { number: "01", emotion: "Arrival", desc: "골목 끝, 예상하지 못한 공간과 마주합니다.", is_visible: true },
    { number: "02", emotion: "Curiosity", desc: "붉은 대문과 살구나무를 지나며 궁금증이 시작됩니다.", is_visible: true },
    { number: "03", emotion: "Dark Passage", desc: "어두운 30m 통로가 일상의 감각을 잠시 멈추게 합니다.", is_visible: true },
    { number: "04", emotion: "Transformation", desc: "빛을 향해 걷는 동안 생각과 시선이 전환됩니다.", is_visible: true },
    { number: "05", emotion: "Light", desc: "통로의 끝에서 정원과 햇살이 한 번에 열립니다.", is_visible: true },
    { number: "06", emotion: "WOW", desc: "100년 소나무와 천연 잔디가 예상 밖의 장면을 만듭니다.", is_visible: true },
    { number: "07", emotion: "Memory", desc: "그 순간은 촬영, 행사, 웨딩, 휴식의 기억으로 남습니다.", is_visible: true },
  ],
  wedding_experiences: [
    {
      number: "01", track: "House Wedding",
      keywords: ["Warm", "Intimate", "Private", "Home"],
      title: "집 앞마당에서",
      desc: "카페 본관과 잔디정원이 하나의 집처럼 연결됩니다. 가까운 사람들과 오래 기억할 수 있는 따뜻하고 프라이빗한 웨딩.",
      recommended: ["소규모 웨딩", "가족 중심 예식", "하우스 파티형", "브런치 웨딩"],
      venue: "카페 본관 + 잔디정원",
      cta_text: "House Wedding 문의", cta_href: "/contact", is_visible: true, sort_order: 1,
    },
    {
      number: "02", track: "Garden Wedding",
      keywords: ["Nature", "Unplugged", "Pine Garden", "Ceremony"],
      title: "100년 소나무 아래",
      desc: "100년 소나무와 천연 잔디가 두 사람의 가장 자연스러운 순간을 감싸는 야외 웨딩.",
      recommended: ["야외 예식", "자연 중심 웨딩", "계절감 있는 웨딩", "소규모 리셉션"],
      venue: "100년 소나무 + 천연 잔디정원",
      cta_text: "Garden Wedding 문의", cta_href: "/contact", is_visible: true, sort_order: 2,
    },
    {
      number: "03", track: "Studio Wedding",
      keywords: ["Industrial", "Editorial", "Modern", "Concept"],
      title: "빛과 여백의 공간에서",
      desc: "시멘트 블록과 빛, 여백만으로도 하나의 화보처럼 완성되는 도시적이고 감각적인 웨딩.",
      recommended: ["콘셉트 웨딩", "애프터파티", "웨딩 촬영", "실내 예식"],
      venue: "Storage 1 / Storage 2",
      cta_text: "Studio Wedding 문의", cta_href: "/contact", is_visible: true, sort_order: 3,
    },
  ],
  seo_title: "Brand Story — THE LIT | 빛을 향해 걷는 이야기",
  seo_description: "THE LIT를 만든 이유, 빛의 철학, 30m의 여정. 더릿 브랜드 스토리와 창립 철학을 소개합니다.",
  seo_og_image: "",
  seo_keywords: "더릿 브랜드 스토리, 복합문화공간 철학, THE LIT 창립 이야기, 빛의 철학, Walk Into The Light",
};

export const aboutService = {
  async get(): Promise<AboutContent> {
    const { data, error } = await supabase
      .from("about_content")
      .select("*")
      .limit(1)
      .single();
    if (error || !data) {
      return { id: "", updated_at: new Date().toISOString(), ...DEFAULT_ABOUT };
    }
    return data as AboutContent;
  },

  async update(
    id: string,
    updates: Partial<Omit<AboutContent, "id" | "updated_at">>,
  ): Promise<AboutContent> {
    const { data, error } = await supabase
      .from("about_content")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as AboutContent;
  },
};

export { DEFAULT_ABOUT };
