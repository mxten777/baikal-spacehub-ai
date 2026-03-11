/**
 * RSS Fetcher
 * 
 * CORS 우회: allOrigins 프록시 또는 서버 측(Supabase Edge Function) 권장
 * 프론트엔드에서 직접 호출 시 CORS 제한이 있으므로,
 * 실제 운영에서는 Supabase Edge Function으로 이동할 것.
 */
import type { NormalizedContent } from '../../types'

const RSS_PROXY = 'https://api.allorigins.win/get?url='

export interface RssItem {
  title: string
  link: string
  description: string
  pubDate?: string
  author?: string
  enclosure?: { url: string; type: string }
  'media:content'?: { url: string }
  'content:encoded'?: string
}

function extractText(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 500)
}

function extractFirstImage(html: string): string | undefined {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  return match?.[1]
}

function normalizeItem(item: RssItem, sourceUrl: string): NormalizedContent | null {
  const url = item.link
  if (!url) return null

  // external_id: URL 해시 기반
  const externalId = btoa(url).replace(/[^a-zA-Z0-9]/g, '').slice(0, 64)

  const rawContent = item['content:encoded'] || item.description || ''
  const summary = extractText(rawContent).slice(0, 300)
  const thumbnail =
    item.enclosure?.url ||
    item['media:content']?.url ||
    extractFirstImage(rawContent)

  return {
    external_id: externalId,
    external_url: url,
    title: item.title?.trim(),
    summary,
    author_name: item.author,
    thumbnail_url: thumbnail,
    published_at: item.pubDate ? new Date(item.pubDate).toISOString() : undefined,
    platform: 'rss',
    metadata_json: { source_url: sourceUrl },
  }
}

export async function fetchRss(rssUrl: string): Promise<NormalizedContent[]> {
  const proxyUrl = `${RSS_PROXY}${encodeURIComponent(rssUrl)}`

  const res = await fetch(proxyUrl)
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`)

  const json = await res.json()
  const xmlText: string = json.contents

  // DOMParser로 XML 파싱 (브라우저 환경)
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, 'text/xml')

  const items = Array.from(doc.querySelectorAll('item'))

  const results: NormalizedContent[] = []
  for (const el of items) {
    const raw: RssItem = {
      title: el.querySelector('title')?.textContent ?? '',
      link: el.querySelector('link')?.textContent?.trim() ?? '',
      description: el.querySelector('description')?.textContent ?? '',
      pubDate: el.querySelector('pubDate')?.textContent ?? undefined,
      author: el.querySelector('author, dc\\:creator')?.textContent ?? undefined,
    }

    // media:content
    const mediaContent = el.querySelector('media\\:content, content')
    if (mediaContent) {
      raw['media:content'] = { url: mediaContent.getAttribute('url') ?? '' }
    }

    // content:encoded
    const contentEncoded = el.querySelector('encoded')
    if (contentEncoded) {
      raw['content:encoded'] = contentEncoded.textContent ?? ''
    }

    // enclosure
    const enclosure = el.querySelector('enclosure')
    if (enclosure) {
      raw.enclosure = {
        url: enclosure.getAttribute('url') ?? '',
        type: enclosure.getAttribute('type') ?? '',
      }
    }

    const normalized = normalizeItem(raw, rssUrl)
    if (normalized) results.push(normalized)
  }

  return results
}
