import { useEffect, useState } from "react";
import HeroSection from "../components/home/HeroSection";
import BrandIntroSection from "../components/home/BrandIntroSection";
import SpacesPreviewSection from "../components/home/SpacesPreviewSection";
import UpcomingProgramsSection from "../components/home/UpcomingProgramsSection";
import ArchiveHighlightsSection from "../components/home/ArchiveHighlightsSection";
import MediaFeedSection from "../components/home/MediaFeedSection";
import CollaborationSection from "../components/home/CollaborationSection";
import LocationSection from "../components/home/LocationSection";
import { aboutService } from "../services/about";
import type { AboutContent } from "../types";
import SeoHead from "../components/common/SeoHead";
import { SITE_URL, organizationJsonLd, websiteJsonLd } from "../lib/seo";

export default function HomePage() {
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);

  useEffect(() => {
    aboutService.get().then(setAboutContent);
  }, []);

  return (
    <>
      <SeoHead
        title="The Lit — 복합문화공간 플랫폼"
        description="더릿(The Lit)은 서울의 프리미엄 복합문화공간입니다. 전시, 공연, 강연, 워크숍, 촬영, 브랜드 행사를 위한 최적의 공간을 제공합니다."
        canonical={SITE_URL}
        keywords="복합문화공간, 공간 대여, 전시, 공연, 워크샵, 더릿, The Lit, 서울 문화 공간, 하남 복합문화공간"
        jsonLd={[organizationJsonLd(), websiteJsonLd()]}
      />

      <HeroSection />
      <BrandIntroSection data={aboutContent ?? undefined} />
      <SpacesPreviewSection />
      <UpcomingProgramsSection />
      <ArchiveHighlightsSection />
      <MediaFeedSection />
      <CollaborationSection />
      <LocationSection />
    </>
  );
}
