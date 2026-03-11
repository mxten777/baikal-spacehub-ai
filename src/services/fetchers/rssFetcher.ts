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

function getText(el: Element, tagName: string): string {
  return el.getElementsByTagName(tagName)[0]?.textContent?.trim() ?? ''
}

export async function fetchRss(rssUrl: string): Promise<NormalizedContent[]> {
  const proxyUrl = `${RSS_PROXY}${encodeURIComponent(rssUrl)}`

  const res = await fetch(proxyUrl)
  if (!res.ok) throw new Error(`RSS proxy failed: ${res.status}`)

  const json = await res.json()
  const xmlText: string = json.contents
  if (!xmlText) throw new Error('RSS proxy returned empty content')

  // XML 파싱 (text/xml) — namespace 있어도 getElementsByTagName은 안정적
  const parser = new DOMParser()
  let doc = parser.parseFromString(xmlText, 'text/xml')

  // 파싱 오류 시 text/html 폴백
  if (doc.querySelector('parsererror')) {
    doc = parser.parseFromString(xmlText, 'text/html') as unknown as XMLDocument
  }

  const items = Array.from(doc.getElementsByTagName('item'))

  const results: NormalizedContent[] = []
  for (const el of items) {
    // 네이버 블로그는 <link>가 next sibling text node로 존재해 textContent가 빈 경우 있음
    // nextSibling으로 직접 텍스트 노드를 읽는 방식으로 보완
    const linkEl = el.getElementsByTagName('link')[0]
    const linkFromNextSibling = linkEl?.nextSibling?.nodeValue?.trim() ?? ''
    const link =
      getText(el, 'link') ||
      linkFromNextSibling ||
      getText(el, 'guid') ||
      el.getElementsByTagName('origLink')[0]?.textContent?.trim() ||
      el.getElementsByTagName('link')[0]?.getAttribute('href') ||
      ''

    const raw: RssItem = {
      title: getText(el, 'title'),
      link,
      description: getText(el, 'description'),
      pubDate: getText(el, 'pubDate') || undefined,
      author:
        getText(el, 'author') ||
        getText(el, 'dc:creator') ||
        undefined,
    }

    // media:content (namespace prefix 가변 대응)
    const mediaEls = [...el.getElementsByTagName('media:content'), ...el.getElementsByTagName('content')]
    const mediaEl = mediaEls.find(e => e.hasAttribute('url'))
    if (mediaEl) {
      raw['media:content'] = { url: mediaEl.getAttribute('url') ?? '' }
    }

    // content:encoded
    const encodedEl =
      el.getElementsByTagName('content:encoded')[0] ||
      el.getElementsByTagName('encoded')[0]
    if (encodedEl) {
      raw['content:encoded'] = encodedEl.textContent ?? ''
    }

    // enclosure
    const enclosureEl = el.getElementsByTagName('enclosure')[0]
    if (enclosureEl) {
      raw.enclosure = {
        url: enclosureEl.getAttribute('url') ?? '',
        type: enclosureEl.getAttribute('type') ?? '',
      }
    }

    const normalized = normalizeItem(raw, rssUrl)
    if (normalized) results.push(normalized)
  }

  return results
}
