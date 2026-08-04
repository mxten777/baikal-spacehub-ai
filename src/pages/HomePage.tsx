import { useEffect, useState } from "react";
import HeroSection from "../components/home/HeroSection";
import ExperienceJourneySection from "../components/home/ExperienceJourneySection";
import BrandIntroSection from "../components/home/BrandIntroSection";
import SpacesPreviewSection from "../components/home/SpacesPreviewSection";
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
        title="THE LIT — Walk Into The Light | 서울 복합문화공간"
        description="골목 끝, 빛을 향해 걸는 브랜드 경험 공간 THE LIT. 30m 여정으로 연결되는 카페·정원·스튜디오·홀·루프탑. 촬영·웨딩·브랜드 행사·전시·공연."
        canonical={SITE_URL}
        keywords="더릿, The Lit, 복합문화공간, 공간 대여, 서울 스튜디오, 하남 웨딩, 촬영 공간, 브랜드 행사 장소, Walk Into The Light, 30m Passage"
        jsonLd={[organizationJsonLd(), websiteJsonLd()]}
      />

      <HeroSection />
      <ExperienceJourneySection steps={aboutContent?.journey_steps} />
      <BrandIntroSection data={aboutContent ?? undefined} />
      <SpacesPreviewSection />
      <ArchiveHighlightsSection />
      <MediaFeedSection />
      <CollaborationSection />
      <LocationSection />
    </>
  );
}
