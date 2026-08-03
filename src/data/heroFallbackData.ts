/**
 * Hero 슬라이드 Fallback 데이터
 *
 * Supabase 조회 실패 또는 데이터 없을 때 표시되는 기본 슬라이드.
 * 기존 HeroSection.tsx의 하드코딩 데이터와 동일한 내용.
 *
 * ⚠️ 운영 데이터가 Supabase에 정상 입력된 후 이 파일 삭제 가능.
 */

import type { HeroSlide } from "../types";

const PLACEHOLDER_DATE = "2026-01-01T00:00:00Z";

export const HERO_FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: "fallback-1",
    title: "어둠을 지나면\n빛이 있습니다",
    subtitle: "Walk Into The Light",
    description: null,
    desktop_image_url: "/images/hero/hero-1.jpg",
    mobile_image_url: null,
    primary_button_text: "Experience THE LIT",
    primary_button_link: "/about",
    secondary_button_text: "Explore Spaces",
    secondary_button_link: "/spaces",
    display_order: 1,
    is_active: true,
    publish_start_at: null,
    publish_end_at: null,
    created_at: PLACEHOLDER_DATE,
    updated_at: PLACEHOLDER_DATE,
  },
  {
    id: "fallback-2",
    title: "30m,\n한 편의 이야기",
    subtitle: "The Passage of Transformation",
    description: null,
    desktop_image_url: "/images/hero/hero-2.jpg",
    mobile_image_url: null,
    primary_button_text: "Our Story",
    primary_button_link: "/about",
    secondary_button_text: "Explore Spaces",
    secondary_button_link: "/spaces",
    display_order: 2,
    is_active: true,
    publish_start_at: null,
    publish_end_at: null,
    created_at: PLACEHOLDER_DATE,
    updated_at: PLACEHOLDER_DATE,
  },
  {
    id: "fallback-3",
    title: "빛이 머무는\n다섯 개의 공간",
    subtitle: "Cafe · Garden · Studio · Box Room · Rooftop",
    description: null,
    desktop_image_url: "/images/hero/hero-3.jpg",
    mobile_image_url: null,
    primary_button_text: "Discover Spaces",
    primary_button_link: "/spaces",
    secondary_button_text: "Wedding",
    secondary_button_link: "/wedding",
    display_order: 3,
    is_active: true,
    publish_start_at: null,
    publish_end_at: null,
    created_at: PLACEHOLDER_DATE,
    updated_at: PLACEHOLDER_DATE,
  },
];
