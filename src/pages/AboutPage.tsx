import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { usePublicPhotos } from "../hooks/useData";
import AnimatedSection from "../components/common/AnimatedSection";
import { aboutService, DEFAULT_ABOUT } from "../services/about";
import type { AboutContent } from "../types";
import SeoHead from "../components/common/SeoHead";
import { SITE_URL, localBusinessJsonLd, breadcrumbJsonLd } from "../lib/seo";

export default function AboutPage() {
  const [content, setContent] = useState<AboutContent>({
    id: "",
    updated_at: "",
    ...DEFAULT_ABOUT,
  });

  useEffect(() => {
    aboutService
      .get()
      .then(setContent)
      .catch(() => {
        /* fallback to default already set */
      });
  }, []);

  // project_category='about' + stage='web' 업로드 사진 → 히어로에 crossfade
  const { data: aboutPhotos } = usePublicPhotos("about");
  const uploadedHeroUrl = aboutPhotos?.[0]?.public_url;

  const {
    hero_image_url,
    hero_eyebrow,
    hero_title_line1,
    hero_title_line2,
    mission_quote,
    mission_description,
    story_eyebrow,
    story_title_line1,
    story_title_line2,
    story_paragraph_1,
    story_paragraph_2,
    story_paragraph_3,
    timeline,
    values_eyebrow,
    values_title,
    brand_values,
    cta_title,
    cta_description,
  } = content;

  return (
    <>
      <SeoHead
        title="About — The Lit"
        description="더릿(The Lit)의 이야기, 철학, 그리고 비전을 소개합니다. 서울의 프리미엄 복합문화공간 플랫폼."
        canonical={`${SITE_URL}/about`}
        keywords="더릿 소개, 복합문화공간 철학, The Lit 비전, 더릿 스토리"
        jsonLd={[
          localBusinessJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", url: SITE_URL },
            { name: "About", url: `${SITE_URL}/about` },
          ]),
        ]}
      />

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px]">
        {/* 폴백: 즉시 표시 */}
        <img
          src={hero_image_url}
          alt="The Lit"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* 'about' 카테고리 업로드 사진: 로드 완료 후 fade in */}
        {uploadedHeroUrl && (
          <img
            src={uploadedHeroUrl}
            alt="The Lit"
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700"
            onLoad={(e) =>
              (e.currentTarget as HTMLImageElement).classList.remove(
                "opacity-0",
              )
            }
          />
        )}
        <div className="absolute inset-0 bg-gradient-overlay-center" />
        <div className="absolute inset-0 flex flex-col justify-end container-wide pb-16">
          <AnimatedSection animation="fade-up">
            <p className="eyebrow text-white/60 mb-3">{hero_eyebrow}</p>
            <h1 className="font-display text-display font-light text-white leading-tight">
              {hero_title_line1}
              <br />
              <span>{hero_title_line2}</span>
            </h1>
          </AnimatedSection>
        </div>
      </section>

      {/* Mission statement */}
      <section className="section-padding bg-brand-cream">
        <div className="container-narrow text-center">
          <AnimatedSection animation="fade-up">
            <p className="eyebrow mb-6">Our Mission</p>
            <blockquote className="font-display text-[clamp(1.5rem,3vw,2.5rem)] font-light text-brand-black leading-relaxed mb-8">
              {mission_quote}
            </blockquote>
            <p className="font-sans text-base text-brand-muted leading-relaxed">
              {mission_description}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Story + Timeline */}
      <section className="section-padding bg-brand-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <AnimatedSection animation="slide-left">
              <p className="eyebrow mb-4">{story_eyebrow}</p>
              <h2 className="font-display text-headline font-light text-brand-black mb-6">
                {story_title_line1}
                <br />
                {story_title_line2}
              </h2>
              <p className="font-sans text-sm text-brand-muted leading-relaxed mb-4">
                {story_paragraph_1}
              </p>
              <p className="font-sans text-sm text-brand-muted leading-relaxed mb-4">
                {story_paragraph_2}
              </p>
              <p className="font-sans text-sm text-brand-muted leading-relaxed">
                {story_paragraph_3}
              </p>
            </AnimatedSection>

            {/* Timeline */}
            <AnimatedSection animation="slide-right" delay={100}>
              <div className="space-y-0">
                {timeline.map((item, i) => (
                  <div key={item.year} className="flex gap-6 pb-10 relative">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-brand-black flex items-center justify-center shrink-0 z-10">
                        <span className="font-sans text-[10px] font-medium text-white tracking-wider">
                          {item.year}
                        </span>
                      </div>
                      {i < timeline.length - 1 && (
                        <div className="w-px flex-1 mt-2 bg-brand-border" />
                      )}
                    </div>
                    <div className="pt-2 pb-2">
                      <h3 className="font-display text-lg font-light text-brand-black mb-1">
                        {item.title}
                      </h3>
                      <p className="font-sans text-sm text-brand-muted leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-brand-black">
        <div className="container-wide">
          <AnimatedSection animation="fade-up" className="text-center mb-16">
            <p className="eyebrow text-white/40 mb-4">{values_eyebrow}</p>
            <h2 className="font-display text-display font-light text-white">
              {values_title}
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {brand_values.map((v, i) => (
              <AnimatedSection key={v.title} animation="fade-up" delay={i * 80}>
                <div className="p-8 border border-white/10 hover:border-brand-accent transition-colors duration-300">
                  <span className="text-brand-accent text-2xl block mb-4">
                    {v.icon}
                  </span>
                  <h3 className="font-display text-xl font-light text-white mb-3">
                    {v.title}
                  </h3>
                  <p className="font-sans text-sm text-white/50 leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-cream text-center">
        <div className="container-narrow">
          <AnimatedSection animation="fade-up">
            <h2 className="font-display text-headline font-light text-brand-black mb-4">
              {cta_title}
            </h2>
            <p className="font-sans text-sm text-brand-muted mb-8">
              {cta_description}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/programs" className="btn-primary">
                프로그램 보기 <ArrowRight size={16} />
              </Link>
              <Link to="/contact" className="btn-secondary">
                문의하기
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
