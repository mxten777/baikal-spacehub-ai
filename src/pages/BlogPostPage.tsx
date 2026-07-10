import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useBlogPost } from '../hooks/useData'
import AnimatedSection from '../components/common/AnimatedSection'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FALLBACK: Record<string, any> = {
  'contemporary-art-guide': {
    id: '1', slug: 'contemporary-art-guide',
    title: '현대미술 감상 가이드 — 처음 만나는 현대미술',
    excerpt: '현대미술이 어렵게 느껴진다면, 이 글부터 시작해보세요.',
    content: `현대미술은 왜 이렇게 어렵게 느껴질까요?

많은 사람들이 미술관에 가면 "이게 뭔지 잘 모르겠다"는 느낌을 받습니다. 이는 당연한 감정입니다. 현대미술은 의도적으로 관람자에게 질문을 던지거나 불편함을 주기도 하니까요.

## 1. 이해보다 느낌이 먼저

현대미술 감상의 첫 번째 원칙은 '이해하려 하지 말고 느껴라'입니다. 작품 앞에 서서 처음 드는 감정이 무엇인지 주목하세요. 그 감정 자체가 작품과의 대화의 시작입니다.

## 2. 작가의 의도를 찾아보자

많은 현대미술 작품들은 작가의 개인적 경험, 사회적 메시지, 철학적 질문을 담고 있습니다. 전시 노트나 도슨트 설명을 통해 작가의 이야기를 들어보세요.

## 3. 맥락을 이해하면 달라진다

같은 작품이라도 어떤 배경에서 만들어졌는지 알면 전혀 다르게 보입니다. 작품이 만들어진 시대, 사회적 맥락, 미술사적 위치 등을 알면 감상이 훨씬 풍부해집니다.

## 4. 반복 관람의 힘

처음 봤을 때와 두 번째, 세 번째 볼 때 다르게 보이는 것이 좋은 작품입니다. 같은 전시를 여러 번 방문해보세요.

더릿에서는 정기적으로 현대미술 강연과 도슨트 투어를 운영하고 있습니다.`,
    cover_image: 'https://images.unsplash.com/photo-1541675154750-0444c7d51e8e?w=1200&q=80',
    published_at: '2026-02-15',
    author: { full_name: 'The Lit', avatar_url: '' },
    category: { name: '문화 리뷰', color: '#6366F1' },
    tags: ['미술', '교육', '가이드'],
  },
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: post, isLoading } = useBlogPost(slug ?? '')
  const displayPost = post ?? FALLBACK[slug ?? '']

  if (isLoading) return <LoadingSpinner />
  if (!displayPost) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="font-display text-2xl text-brand-muted mb-4">포스트를 찾을 수 없습니다</p>
        <Link to="/blog" className="btn-secondary">← Blog</Link>
      </div>
    </div>
  )

  return (
    <>
      <Helmet>
        <title>{displayPost.title} — The Lit Blog</title>
        <meta name="description" content={displayPost.excerpt} />
        {displayPost.og_image && <meta property="og:image" content={displayPost.og_image} />}
        {displayPost.published_at && <meta property="article:published_time" content={displayPost.published_at} />}
      </Helmet>

      {/* Cover image */}
      {displayPost.cover_image && (
        <div className="h-[50vh] min-h-[400px] relative mt-16 lg:mt-20">
          <img src={displayPost.cover_image} alt={displayPost.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      )}

      <article className="section-padding">
        <div className="container-narrow">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-black transition-colors mb-10">
            <ArrowLeft size={15} /> Blog
          </Link>

          <AnimatedSection animation="fade-up">
            {displayPost.category && (
              <p className="eyebrow mb-3" style={{ color: displayPost.category.color }}>
                {displayPost.category.name}
              </p>
            )}
            <h1 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-light text-brand-black leading-tight mb-6">
              {displayPost.title}
            </h1>

            <div className="flex items-center gap-4 mb-10 pb-8 border-b border-brand-border">
              {displayPost.author?.full_name && (
                <span className="font-sans text-sm text-brand-muted">by {displayPost.author.full_name}</span>
              )}
              {displayPost.published_at && (
                <span className="font-sans text-sm text-brand-muted">
                  {format(new Date(displayPost.published_at), 'yyyy년 M월 d일', { locale: ko })}
                </span>
              )}
            </div>

            <div className="max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({children}) => <h1 className="font-display text-2xl font-light text-brand-black mt-10 mb-4 leading-tight">{children}</h1>,
                  h2: ({children}) => <h2 className="font-display text-xl font-light text-brand-black mt-8 mb-3 leading-tight">{children}</h2>,
                  h3: ({children}) => <h3 className="font-display text-lg font-light text-brand-black mt-6 mb-2">{children}</h3>,
                  p: ({children}) => <p className="font-sans text-[15px] text-brand-muted leading-relaxed mb-5">{children}</p>,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  a: ({href, children}: any) => (
                    <a
                      href={href ?? '#'}
                      className="text-brand-accent underline underline-offset-2 hover:opacity-70 transition-opacity"
                      {...(href?.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >{children}</a>
                  ),
                  ul: ({children}) => <ul className="list-disc pl-6 mb-5 space-y-1.5 font-sans text-[15px] text-brand-muted">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal pl-6 mb-5 space-y-1.5 font-sans text-[15px] text-brand-muted">{children}</ol>,
                  li: ({children}) => <li className="leading-relaxed">{children}</li>,
                  blockquote: ({children}) => (
                    <blockquote className="border-l-[3px] border-brand-accent pl-5 my-6 text-brand-muted italic">{children}</blockquote>
                  ),
                  pre: ({children}) => (
                    <pre className="bg-brand-cream p-4 rounded overflow-x-auto mb-5 text-sm font-mono leading-relaxed">{children}</pre>
                  ),
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  code: ({children, className}: any) => {
                    const isBlock = !!className
                    if (isBlock) return <code className={`${className} font-mono text-sm`}>{children}</code>
                    return <code className="bg-brand-cream px-1.5 py-0.5 text-sm font-mono rounded text-brand-black">{children}</code>
                  },
                  strong: ({children}) => <strong className="font-semibold text-brand-black">{children}</strong>,
                  em: ({children}) => <em className="italic">{children}</em>,
                  img: ({src, alt}) => src ? (
                    <img src={src} alt={alt ?? ''} className="w-full my-6 object-cover" loading="lazy" />
                  ) : null,
                  hr: () => <hr className="border-brand-border my-8" />,
                  table: ({children}) => (
                    <div className="overflow-x-auto mb-5">
                      <table className="w-full text-sm font-sans border-collapse">{children}</table>
                    </div>
                  ),
                  th: ({children}) => <th className="text-left border-b border-brand-border pb-2 pr-4 font-semibold text-brand-black">{children}</th>,
                  td: ({children}) => <td className="border-b border-brand-line py-2 pr-4 text-brand-muted">{children}</td>,
                }}
              >
                {displayPost.content ?? ''}
              </ReactMarkdown>
            </div>

            {/* Tags */}
            {displayPost.tags?.length > 0 && (
              <div className="mt-10 pt-8 border-t border-brand-border flex flex-wrap gap-2">
                {displayPost.tags.map((tag: string) => (
                  <span key={tag} className="tag">#{tag}</span>
                ))}
              </div>
            )}
          </AnimatedSection>
        </div>
      </article>
    </>
  )
}
