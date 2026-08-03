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
