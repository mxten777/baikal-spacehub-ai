import { Helmet } from 'react-helmet-async'
import HeroSection from '../components/home/HeroSection'
import BrandIntroSection from '../components/home/BrandIntroSection'
import SpacesPreviewSection from '../components/home/SpacesPreviewSection'
import UpcomingProgramsSection from '../components/home/UpcomingProgramsSection'
import ArchiveHighlightsSection from '../components/home/ArchiveHighlightsSection'
import MediaFeedSection from '../components/home/MediaFeedSection'
import CollaborationSection from '../components/home/CollaborationSection'
import LocationSection from '../components/home/LocationSection'

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>The Lit — 복합문화공간 플랫폼</title>
        <meta name="description" content="더릿(The Lit)은 서울의 프리미엄 복합문화공간입니다. 전시, 공연, 강연, 워크숍, 촬영, 브랜드 행사를 위한 최적의 공간을 제공합니다." />
        <meta property="og:title" content="The Lit — 복합문화공간 플랫폼" />
        <meta property="og:description" content="더릿에서 당신의 문화 이야기를 시작하세요." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://thelit.kr" />
        <meta property="og:image" content="https://thelit.kr/og-image.jpg" />
        <link rel="canonical" href="https://thelit.kr" />
      </Helmet>

      <HeroSection />
      <BrandIntroSection />
      <SpacesPreviewSection />
      <UpcomingProgramsSection />
      <ArchiveHighlightsSection />
      <MediaFeedSection />
      <CollaborationSection />
      <LocationSection />
    </>
  )
}
