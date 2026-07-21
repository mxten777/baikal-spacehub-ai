import { Helmet } from 'react-helmet-async'
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE, DEFAULT_KEYWORDS } from '../../lib/seo'

interface SeoHeadProps {
  title: string
  description: string
  canonical: string
  keywords?: string
  image?: string | null
  type?: 'website' | 'article'
  author?: string
  publishedTime?: string | null
  robots?: string
  // Pass one schema object or an array of schema objects
  jsonLd?: object | object[]
}

export default function SeoHead({
  title,
  description,
  canonical,
  keywords = DEFAULT_KEYWORDS,
  image,
  type = 'website',
  author = SITE_NAME,
  publishedTime,
  robots = 'index, follow',
  jsonLd,
}: SeoHeadProps) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`
  const canonicalUrl = canonical.startsWith('http') ? canonical : `${SITE_URL}${canonical}`
  const ogImage = image || DEFAULT_OG_IMAGE
  const schemas: object[] = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []

  return (
    <Helmet>
      {/* ── Primary ─────────────────────────────────── */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      {/* ── Open Graph ──────────────────────────────── */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="ko_KR" />
      {publishedTime ? (
        <meta property="article:published_time" content={publishedTime} />
      ) : null}

      {/* ── Twitter Card ────────────────────────────── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* ── JSON-LD ─────────────────────────────────── */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  )
}
