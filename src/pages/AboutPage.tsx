import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { usePublicPhotos } from "../hooks/useData";
import AnimatedSection from "../components/common/AnimatedSection";
import SectionHeader from "../components/common/SectionHeader";
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
  const [uploadedLoaded, setUploadedLoaded] = useState(false);

  const {
    hero_image_url,
    hero_eyebrow,
    hero_title_line1,
    hero_title_line2,
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
    brand_intro_eyebrow,
    brand_intro_title_line1,
    brand_intro_title_line2,
    brand_intro_paragraph_1,
    brand_intro_paragraph_2,
    brand_intro_pillars,
    seo_title,
    seo_description,
    seo_og_image,
    seo_keywords,
  } = content;

  return (
    <>
      <SeoHead
        title={seo_title || "Brand Story — THE LIT | 빛을 향해 걷는 이야기"}
        description={
          seo_description ||
          "THE LIT를 만든 이유, 빛의 철학, 30m의 여정. 더릿 브랜드 스토리와 창립 철학을 소개합니다."
        }
        canonical={`${SITE_URL}/about`}
        keywords={
          seo_keywords ||
          "더릿 브랜드 스토리, 복합문화공간 철학, THE LIT 창립 이야기, 빛의 철학, Walk Into The Light"
        }
        image={seo_og_image || undefined}
        jsonLd={[
          localBusinessJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", url: SITE_URL },
            { name: "About", url: `${SITE_URL}/about` },
          ]),
        ]}
      />

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] bg-brand-warm">
        {/* 관리자가 등록한 히어로 이미지 */}
        {hero_image_url && (
          <img
            src={hero_image_url}
            alt="The Lit"
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${uploadedLoaded ? "opacity-0" : "opacity-100"}`}
          />
        )}
        {/* 'about' 카테고리 업로드 사진: 로드 완료 후 fade in */}
        {uploadedHeroUrl && (
          <img
            src={uploadedHeroUrl}
            alt="The Lit"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${uploadedLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setUploadedLoaded(true)}
          />
        )}
        {!hero_image_url && !uploadedHeroUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-brand-muted/30 tracking-widest uppercase">
              이미지 준비 중
            </span>
          </div>
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

      {/* 1. Brand Story — Why THE LIT */}
      <section className="section-padding bg-brand-white">
        <div className="container-wide">
          <AnimatedSection animation="slide-left">
            <p className="eyebrow mb-4">{story_eyebrow}</p>
            <h2 className="font-display text-headline font-light text-brand-black mb-6">
              {story_title_line1}
              <br />
              {story_title_line2}
            </h2>
            <div className="max-w-2xl">
              <p className="font-sans text-sm text-brand-muted leading-relaxed mb-4">
                {story_paragraph_1}
              </p>
              <p className="font-sans text-sm text-brand-muted leading-relaxed mb-4">
                {story_paragraph_2}
              </p>
              <p className="font-sans text-sm text-brand-muted leading-relaxed">
                {story_paragraph_3}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 2. Light Philosophy — Dark / Passage / Light / Memory */}
      <section className="section-padding bg-brand-black">
        <div className="container-wide">
          <AnimatedSection animation="fade-up" className="text-center mb-16">
            <SectionHeader
              eyebrow={values_eyebrow}
              title={values_title}
              align="center"
              light
            />
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

      {/* 3. The Journey — 30m Passage */}
      <section className="section-padding bg-brand-cream">
        <div className="container-wide">
          <AnimatedSection animation="fade-up" className="mb-12 lg:mb-16">
            <div className="max-w-2xl">
              <p className="eyebrow mb-4">{brand_intro_eyebrow}</p>
              <h2
                className="font-display font-light text-brand-black mb-5"
                style={{
                  fontSize: "clamp(2rem, 4vw, 3.75rem)",
                  letterSpacing: "-0.03em",
                  lineHeight: "1.08",
                }}
              >
                {brand_intro_title_line1}
                <br />
                <em style={{ fontStyle: "normal", color: "#C8A97E" }}>
                  {brand_intro_title_line2}
                </em>
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <AnimatedSection animation="slide-left" delay={100}>
              <p className="font-sans text-sm text-brand-muted leading-relaxed mb-5">
                {brand_intro_paragraph_1}
              </p>
              <p className="font-sans text-sm text-brand-muted leading-relaxed">
                {brand_intro_paragraph_2}
              </p>
            </AnimatedSection>

            <AnimatedSection animation="slide-right" delay={150}>
              <div className="flex flex-wrap gap-3">
                {brand_intro_pillars.map((p) => (
                  <div
                    key={p.en}
                    className="border border-brand-border px-5 py-3"
                  >
                    <span className="font-sans text-[10px] font-medium tracking-[0.15em] uppercase text-brand-muted block">
                      {p.en}
                    </span>
                    <span className="font-display text-xl font-light text-brand-black">
                      {p.label}
                    </span>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 5. History — Timeline */}
      <section className="section-padding bg-brand-cream">
        <div className="container-wide">
          <AnimatedSection animation="fade-up" className="mb-12 lg:mb-16">
            <SectionHeader eyebrow="History" title="지나온 시간들" />
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={100}>
            <div className="max-w-lg space-y-0">
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
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-black text-center">
        <div className="container-narrow">
          <AnimatedSection animation="fade-up">
            <h2 className="font-display text-headline font-light text-white mb-4">
              {cta_title}
            </h2>
            <p className="font-sans text-sm text-white/50 mb-8">
              {cta_description}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/contact" className="btn-outline-white">
                Experience THE LIT <ArrowRight size={16} />
              </Link>
              <Link to="/spaces" className="btn-ghost-light">
                Explore Spaces
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
