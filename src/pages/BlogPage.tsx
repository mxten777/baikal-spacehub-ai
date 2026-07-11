import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Search } from "lucide-react";
import { useBlogPosts, useBlogCategories } from "../hooks/useData";
import AnimatedSection from "../components/common/AnimatedSection";
import LoadingSpinner from "../components/common/LoadingSpinner";

const FALLBACK_POSTS = [
  {
    id: "1",
    slug: "contemporary-art-guide",
    title: "현대미술 감상 가이드 — 처음 만나는 현대미술",
    excerpt:
      "현대미술이 어렵게 느껴진다면, 이 글부터 시작해보세요. 감상의 문을 여는 10가지 핵심 키워드를 소개합니다.",
    cover_image_url:      "https://images.unsplash.com/photo-1541675154750-0444c7d51e8e?w=600&q=80",
    published_at: "2026-02-15",
    category: { name: "문화 리뷰", color: "#6366F1" },
    tags: ["미술", "교육", "가이드"],
    is_featured: true,
  },
  {
    id: "2",
    slug: "jazz-night-review",
    title: "Jazz Night 2월 공연 후기",
    excerpt:
      "2월의 추운 밤, 더릿 카페를 가득 채운 재즈 선율. 그 감동적인 밤을 기록했습니다.",
    cover_image_url:      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&q=80",
    published_at: "2026-02-10",
    category: { name: "행사 후기", color: "#10B981" },
    tags: ["재즈", "공연", "후기"],
  },
  {
    id: "3",
    slug: "space-story-studio",
    title: "더릿 스튜디오의 탄생 이야기",
    excerpt:
      "낡은 창고가 어떻게 서울 최고의 스튜디오 공간으로 변신했을까요? 더릿 스튜디오의 비하인드 스토리.",
    cover_image_url:      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80",
    published_at: "2026-01-28",
    category: { name: "공간 스토리", color: "#F59E0B" },
    tags: ["스튜디오", "스토리"],
  },
  {
    id: "4",
    slug: "photographer-interview",
    title: "인터뷰 — 사진작가 김민준의 봄 기억",
    excerpt:
      "봄 기억 사진전을 앞두고 김민준 작가를 만났습니다. 그의 카메라 속 봄 이야기를 들어보세요.",
    cover_image_url:      "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=600&q=80",
    published_at: "2026-01-20",
    category: { name: "인터뷰", color: "#EC4899" },
    tags: ["사진", "인터뷰", "작가"],
  },
  {
    id: "5",
    slug: "ceramics-workshop-story",
    title: "도예 워크숍 — 흙으로 만든 시간",
    excerpt:
      "처음 흙을 만졌을 때의 감촉, 물레 위에서 형태를 잡아가는 설렘. 도예 워크숍 참가자들의 이야기.",
    cover_image_url:      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    published_at: "2026-01-12",
    category: { name: "행사 후기", color: "#10B981" },
    tags: ["도예", "워크숍"],
  },
  {
    id: "6",
    slug: "culture-space-trend-2026",
    title: "2026 문화공간 트렌드 분석",
    excerpt:
      "코로나 이후 달라진 문화공간의 역할과 2026년 주목해야 할 복합문화공간 트렌드를 분석합니다.",
    cover_image_url:      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80",
    published_at: "2026-01-05",
    category: { name: "문화 리뷰", color: "#6366F1" },
    tags: ["트렌드", "문화공간", "분석"],
  },
];

export default function BlogPage() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string | undefined>();
  const { data: result, isLoading } = useBlogPosts({
    search: search || undefined,
    category: activeCat,
    limit: 12,
  });
  const { data: categories } = useBlogCategories();

  const posts =
    result?.data && result.data.length > 0 ? result.data : FALLBACK_POSTS;

  return (
    <>
      <Helmet>
        <title>Blog — The Lit</title>
        <meta
          name="description"
          content="문화 리뷰, 행사 후기, 인터뷰, 공간 스토리 — 더릿의 다양한 콘텐츠를 만나보세요."
        />
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-16 bg-brand-cream">
        <div className="container-wide">
          <AnimatedSection animation="fade-up">
            <p className="eyebrow mb-4">Blog</p>
            <h1 className="font-display text-display font-light text-brand-black mb-6">
              더릿의 이야기
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
          {isLoading ? (
            <LoadingSpinner />
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
                      <img
                        src={posts[0].cover_image_url ?? undefined}
                        alt={posts[0].title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
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
                        <img
                          src={post.cover_image_url ?? undefined}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
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
