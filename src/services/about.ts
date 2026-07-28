import { supabase } from "../lib/supabase";
import type { AboutContent } from "../types";

const DEFAULT_ABOUT: Omit<AboutContent, "id" | "updated_at"> = {
  hero_image_url: "",
  hero_eyebrow: "About The Lit",
  hero_title_line1: "문화의 불꽃을",
  hero_title_line2: "켜는 공간",
  mission_quote:
    '"더릿은 예술가, 크리에이터, 브랜드, 그리고 문화를 사랑하는 모든 이들이 자신의 이야기를 펼칠 수 있는 최적의 무대를 제공합니다."',
  mission_description:
    "2018년, 서울 연남동의 낡은 빈 창고에서 시작된 더릿은 지금 이 도시에서 가장 활발한 문화 허브 중 하나가 되었습니다.",
  story_eyebrow: "Our Story",
  story_title_line1: "작은 창고에서",
  story_title_line2: "복합문화공간으로",
  story_paragraph_1:
    "더릿(The Lit)의 이름은 '불을 밝히다(to light)'에서 왔습니다. 어두운 공간에 빛을 더하듯, 더릿은 사람들의 창의적 에너지에 적절한 공간과 환경을 제공합니다.",
  story_paragraph_2:
    "한때 낡고 버려진 창고였던 이 공간은 이제 전시, 공연, 강연, 촬영 등 다양한 문화 활동의 터전이 되었습니다.",
  story_paragraph_3:
    "우리는 단순히 공간을 임대하는 것이 아니라, 문화적 경험을 함께 설계하고 실현하는 파트너입니다.",
  timeline: [
    {
      year: "2018",
      title: "더릿의 시작",
      desc: "서울 연남동의 낡은 창고를 문화공간으로 변신시키며 더릿의 여정이 시작되었습니다.",
    },
    {
      year: "2020",
      title: "카페 & 가든 오픈",
      desc: "커뮤니티 중심의 카페와 야외 가든을 추가하며 복합문화공간으로 성장했습니다.",
    },
    {
      year: "2022",
      title: "스튜디오 & 스토리지",
      desc: "전문 촬영 스튜디오와 대형 다목적 홀 스토리지를 완성해 전면 복합문화공간이 되었습니다.",
    },
    {
      year: "2024",
      title: "더릿 플랫폼화",
      desc: "물리적 공간을 넘어 디지털 플랫폼으로 확장, 더 많은 문화 크리에이터와 연결됩니다.",
    },
  ],
  values_eyebrow: "Core Values",
  values_title: "우리가 믿는 것들",
  brand_values: [
    {
      icon: "✦",
      title: "개방성",
      desc: "누구에게나 열려있는 공간. 다양한 배경과 관심사를 가진 사람들이 교류하는 곳입니다.",
    },
    {
      icon: "✦",
      title: "지속성",
      desc: "일회성 이벤트가 아닌, 지속 가능한 문화 생태계를 만들어갑니다.",
    },
    {
      icon: "✦",
      title: "진정성",
      desc: "상업적 논리보다 진정한 문화적 가치를 우선합니다.",
    },
    {
      icon: "✦",
      title: "공동체",
      desc: "공간을 통해 사람들이 연결되고, 함께 성장하는 커뮤니티를 지향합니다.",
    },
  ],
  cta_title: "더릿과 함께하세요",
  cta_description: "공간 대관부터 협업 프로젝트까지, 더릿이 함께합니다.",
  brand_intro_eyebrow: "Our Philosophy",
  brand_intro_title_line1: "문화가 숨쉬는",
  brand_intro_title_line2: "공간의 힘",
  brand_intro_paragraph_1:
    "더릿(The Lit)은 서울 한복판에서 문화와 예술, 그리고 사람이 만나는 복합문화공간입니다. 단순한 장소가 아닌, 창의적 에너지가 교류하고 새로운 이야기가 시작되는 플랫폼입니다.",
  brand_intro_paragraph_2:
    "전시부터 공연, 강연, 워크숍, 브랜드 이벤트까지 — 모든 문화 활동을 위한 최적의 환경을 제공합니다.",
  brand_intro_image_url: "",
  brand_intro_pillars: [
    { label: "전시", en: "Exhibition" },
    { label: "공연", en: "Performance" },
    { label: "강연", en: "Lecture" },
    { label: "워크숍", en: "Workshop" },
    { label: "촬영", en: "Photoshoot" },
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
