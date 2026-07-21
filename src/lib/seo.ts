// ─── SEO Constants ────────────────────────────────────────────────────────────
export const SITE_URL = 'https://thelit.kr'
export const SITE_NAME = 'The Lit'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og/og-default.jpg`
export const DEFAULT_DESCRIPTION =
  'The Lit(더릿)은 서울의 프리미엄 복합문화공간입니다. 전시, 공연, 워크샵, 공간 대여가 한 곳에서 이루어집니다.'
export const DEFAULT_KEYWORDS =
  '복합문화공간, 공간 대여, 전시, 공연, 워크샵, 문화 프로그램, The Lit, 더릿, 서울 문화 공간, 하남 문화 공간'

// ─── JSON-LD Generators ───────────────────────────────────────────────────────

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'The Lit',
    alternateName: '더릿',
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    sameAs: [
      'https://instagram.com/thelit_official',
      'https://blog.naver.com/thelit_culture',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '1661-0288',
      contactType: 'customer service',
      areaServed: 'KR',
      availableLanguage: 'Korean',
    },
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
  }
}

export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'The Lit (더릿)',
    image: DEFAULT_OG_IMAGE,
    url: SITE_URL,
    telephone: '1661-0288',
    email: 'goworld33@naver.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '미사동 468',
      addressLocality: '하남시',
      addressRegion: '경기도',
      addressCountry: 'KR',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '11:00',
        closes: '21:00',
      },
    ],
    priceRange: '$$',
  }
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function blogPostingJsonLd(post: {
  title: string
  description: string
  url: string
  image?: string | null
  publishedAt?: string | null
  author?: string | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url: post.url,
    image: post.image || DEFAULT_OG_IMAGE,
    datePublished: post.publishedAt ?? undefined,
    author: {
      '@type': 'Person',
      name: post.author || SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/favicon.svg`,
      },
    },
  }
}

export function eventJsonLd(event: {
  name: string
  description: string
  url: string
  image?: string | null
  startDate: string
  endDate?: string | null
  location?: string | null
  price?: number | null
  isFree?: boolean | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    url: event.url,
    image: event.image || DEFAULT_OG_IMAGE,
    startDate: event.startDate,
    endDate: event.endDate ?? undefined,
    location: {
      '@type': 'Place',
      name: event.location || 'The Lit',
      address: {
        '@type': 'PostalAddress',
        addressLocality: '하남시',
        addressRegion: '경기도',
        addressCountry: 'KR',
      },
    },
    offers: {
      '@type': 'Offer',
      price: event.isFree ? 0 : (event.price ?? 0),
      priceCurrency: 'KRW',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/reservation`,
    },
    organizer: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  }
}
