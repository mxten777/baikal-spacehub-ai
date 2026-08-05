import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Search } from "lucide-react";
import { useBlogPosts, useBlogCategories } from "../hooks/useData";
import AnimatedSection from "../components/common/AnimatedSection";
import SeoHead from "../components/common/SeoHead";
import { SITE_URL, breadcrumbJsonLd } from "../lib/seo";

export default function BlogPage() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string | undefined>();
  const { data: result } = useBlogPosts({
    search: search || undefined,
    category: activeCat,
    limit: 12,
  });
  const { data: categories } = useBlogCategories();

  const posts = result?.data ?? [];

  return (
    <>
      <SeoHead
        title="Stories — THE LIT | 빛 속에서 태어난 이야기들"
        description="더릿을 거쳐간 사람들, 공간들, 그리고 순간들의 기록. Space Stories · Brand Journal · Interview · Culture Review."
        canonical={`${SITE_URL}/blog`}
        keywords="더릿 스토리즈, 에디토리얼, 공간 스토리, 인터뷰, 브랜드 저널"
        jsonLd={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Blog", url: `${SITE_URL}/blog` },
        ])}
      />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-brand-cream">
        <div className="container-wide">
          <AnimatedSection animation="fade-up">
            <p className="eyebrow mb-4">Stories</p>
            <h1 className="font-display text-display font-light text-brand-black mb-6">
              빛 속에서 태어난 이야기들
            </h1>
          </AnimatedSection>

          {/* Search */}
          <AnimatedSection animation="fade-up" delay={100}>
            <div className="relative max-w-md mt-4">
              <Search
                size={16}
                className="absolute left-0 top-1/2 -translate-y-1/2 text-brand-muted"
              />
              <input
                type="search"
                placeholder="검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-7 pr-4 py-3 bg-transparent border-b border-brand-border text-brand-black placeholder:text-brand-muted/60 focus:border-brand-black focus:outline-none font-sans text-sm"
              />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Category filter */}
      {categories && categories.length > 0 && (
        <div className="border-b border-brand-border bg-brand-white">
          <div className="container-wide py-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveCat(undefined)}
              className={`shrink-0 px-5 py-2 font-sans text-xs font-medium tracking-widest uppercase transition-all ${!activeCat ? "bg-brand-black text-white" : "bg-brand-cream text-brand-muted hover:text-brand-black"}`}
            >
              전체
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`shrink-0 px-5 py-2 font-sans text-xs font-medium tracking-widest uppercase transition-all ${activeCat === cat.id ? "bg-brand-black text-white" : "bg-brand-cream text-brand-muted hover:text-brand-black"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Posts */}
      <section className="section-padding bg-brand-white">
        <div className="container-wide">
          {posts.length === 0 ? (
            <AnimatedSection animation="fade-up" className="py-24 text-center">
              <p className="font-display text-xl font-light text-brand-black mb-3">
                아직 등록된 스토리가 없습니다.
              </p>
              <p className="font-sans text-sm text-brand-muted">
                관리자에서 첫 번째 스토리를 등록해 주세요.
              </p>
            </AnimatedSection>
          ) : (
            <>
              {/* Featured post */}
              {posts[0] && (
                <AnimatedSection animation="fade-up" className="mb-8 sm:mb-12">
                  <Link
                    to={`/blog/${posts[0].slug}`}
                    className="group grid grid-cols-1 lg:grid-cols-2 bg-brand-cream"
                  >
                    <div className="overflow-hidden aspect-[16/9] lg:aspect-auto">
                      {posts[0].cover_image_url ? (
                        <img
                          src={posts[0].cover_image_url ?? undefined}
                          alt={posts[0].title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full min-h-[200px] bg-brand-warm flex items-center justify-center">
                          <span className="font-display text-brand-muted/30 tracking-widest text-sm uppercase">
                            이미지 준비 중
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5 sm:p-8 lg:p-12 flex flex-col justify-center">
                      {posts[0].category && (
                        <span
                          className="eyebrow mb-3"
                          style={{ color: posts[0].category.color }}
                        >
                          {posts[0].category.name}
                        </span>
                      )}
                      <h2 className="font-display text-2xl lg:text-3xl font-light text-brand-black mb-4 group-hover:text-brand-accent transition-colors">
                        {posts[0].title}
                      </h2>
                      <p className="font-sans text-sm text-brand-muted leading-relaxed mb-6">
                        {posts[0].excerpt}
                      </p>
                      <p className="font-sans text-xs text-brand-muted">
                        {posts[0].published_at &&
                          format(new Date(posts[0].published_at), "yyyy.M.d", {
                            locale: ko,
                          })}
                      </p>
                    </div>
                  </Link>
                </AnimatedSection>
              )}

              {/* Rest of posts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.slice(1).map((post, i) => (
                  <AnimatedSection
                    key={post.id}
                    animation="fade-up"
                    delay={i * 60}
                  >
                    <Link to={`/blog/${post.slug}`} className="group block">
                      <div className="overflow-hidden aspect-[16/9] mb-4">
                        {post.cover_image_url ? (
                          <img
                            src={post.cover_image_url ?? undefined}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-brand-warm flex items-center justify-center">
                            <span className="font-display text-brand-muted/30 tracking-widest text-xs uppercase">
                              이미지 준비 중
                            </span>
                          </div>
                        )}
                      </div>
                      {post.category && (
                        <p
                          className="eyebrow mb-2"
                          style={{ color: post.category.color }}
                        >
                          {post.category.name}
                        </p>
                      )}
                      <h3 className="font-display text-lg font-light text-brand-black mb-2 group-hover:text-brand-accent transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="font-sans text-sm text-brand-muted leading-relaxed line-clamp-2 mb-3">
                        {post.excerpt}
                      </p>
                      <p className="font-sans text-xs text-brand-muted">
                        {post.published_at &&
                          format(new Date(post.published_at), "yyyy.M.d", {
                            locale: ko,
                          })}
                      </p>
                    </Link>
                  </AnimatedSection>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
