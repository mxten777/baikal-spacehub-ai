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
    title: "문화가 흐르는\n공간",
    subtitle: "A Space Where Culture Flows",
    description: null,
    desktop_image_url: "/images/hero/hero-1.jpg",
    mobile_image_url: null,
    primary_button_text: "Programs",
    primary_button_link: "/programs",
    secondary_button_text: "Space Rental",
    secondary_button_link: "/reservation",
    display_order: 1,
    is_active: true,
    publish_start_at: null,
    publish_end_at: null,
    created_at: PLACEHOLDER_DATE,
    updated_at: PLACEHOLDER_DATE,
  },
  {
    id: "fallback-2",
    title: "예술과 삶이\n만나는 곳",
    subtitle: "Where Art Meets Life",
    description: null,
    desktop_image_url: "/images/hero/hero-2.jpg",
    mobile_image_url: null,
    primary_button_text: "Programs",
    primary_button_link: "/programs",
    secondary_button_text: "Space Rental",
    secondary_button_link: "/reservation",
    display_order: 2,
    is_active: true,
    publish_start_at: null,
    publish_end_at: null,
    created_at: PLACEHOLDER_DATE,
    updated_at: PLACEHOLDER_DATE,
  },
  {
    id: "fallback-3",
    title: "비범한 경험을\n위한 공간",
    subtitle: "Space for Extraordinary Experiences",
    description: null,
    desktop_image_url: "/images/hero/hero-3.jpg",
    mobile_image_url: null,
    primary_button_text: "Programs",
    primary_button_link: "/programs",
    secondary_button_text: "Space Rental",
    secondary_button_link: "/reservation",
    display_order: 3,
    is_active: true,
    publish_start_at: null,
    publish_end_at: null,
    created_at: PLACEHOLDER_DATE,
    updated_at: PLACEHOLDER_DATE,
  },
];
