/**
 * RSS Fetcher
 *
 * CORS 우회 전략 (우선순위 순):
 * 1. Supabase Edge Function (fetch-rss) — 서버사이드 fetch, Naver 차단 완전 우회
 * 2. rss2json.com  — RSS 전용 서버사이드 파서 (Edge Function 미배포 시 폴백)
 * 3. CORS 프록시 체인 — 3개 프록시 폴백 + 직접 XML 파싱
 */
import type { NormalizedContent } from '../../types'

// Supabase Edge Function URL
const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  'https://ifadgzgiowsyhztylgrd.supabase.co'
const EDGE_FUNCTION_URL = `${SUPABASE_URL.replace(/\/$/, '')}/functions/v1/super-function`
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? ''

// rss2json.com — RSS 전용 변환 서비스 (free tier: 10,000 req/day)
const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json?rss_url='

interface Rss2JsonItem {
  title: string
  link: string
  pubDate: string
  author: string
  thumbnail: string
  description: string
  content: string
  enclosure: { link?: string; type?: string }
}

// 각 프록시는 { type: 'json', key: 'contents' } 또는 { type: 'raw' } 형태
const CORS_PROXIES: Array<
  | { type: 'json'; url: string; key: string }
  | { type: 'raw'; url: string }
> = [
  { type: 'raw',  url: 'https://corsproxy.io/?' },
  { type: 'json', url: 'https://api.allorigins.win/get?url=', key: 'contents' },
  { type: 'raw',  url: 'https://api.codetabs.com/v1/proxy?quest=' },
]

async function fetchWithProxy(rssUrl: string): Promise<string> {
  const encoded = encodeURIComponent(rssUrl)
  const errors: string[] = []

  for (const proxy of CORS_PROXIES) {
    try {
      const res = await fetch(`${proxy.url}${encoded}`, { signal: AbortSignal.timeout(10_000) })
      if (!res.ok) {
        errors.push(`${proxy.url}: HTTP ${res.status}`)
        continue
      }
      if (proxy.type === 'json') {
        const json = await res.json()
        const text: string = json[proxy.key] ?? ''
        if (text) return text
        errors.push(`${proxy.url}: empty contents field`)
      } else {
        const text = await res.text()
        if (text) return text
        errors.push(`${proxy.url}: empty response`)
      }
    } catch (e) {
      errors.push(`${proxy.url}: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  throw new Error(`모든 RSS 프록시 실패:\n${errors.join('\n')}`)
}

// rss2json.com 시도: 성공하면 NormalizedContent[], 실패하면 null
async function tryRss2Json(rssUrl: string): Promise<NormalizedContent[] | null> {
  try {
    const res = await fetch(`${RSS2JSON_API}${encodeURIComponent(rssUrl)}`, {
      signal: AbortSignal.timeout(15_000),
    })
    if (!res.ok) return null
    const json = await res.json()
    if (json.status !== 'ok' || !Array.isArray(json.items)) return null

    const results: NormalizedContent[] = []
    for (const item of json.items as Rss2JsonItem[]) {
      const url = item.link
      if (!url) continue
      const externalId = btoa(url).replace(/[^a-zA-Z0-9]/g, '').slice(0, 64)
      const rawContent = item.content || item.description || ''
      const summary = rawContent.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 300)
      const thumbnail =
        item.thumbnail ||
        item.enclosure?.link ||
        rawContent.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1]
      results.push({
        external_id: externalId,
        external_url: url,
        title: item.title?.trim(),
        summary,
        author_name: item.author || undefined,
        thumbnail_url: thumbnail || undefined,
        published_at: item.pubDate ? new Date(item.pubDate).toISOString() : undefined,
        platform: 'rss',
        metadata_json: { source_url: rssUrl },
      })
    }
    return results.length > 0 ? results : null
  } catch {
    return null
  }
}

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

function parseXmlItems(xmlText: string, sourceUrl: string): NormalizedContent[] {
  const parser = new DOMParser()
  let doc = parser.parseFromString(xmlText, 'text/xml')
  if (doc.querySelector('parsererror')) {
    doc = parser.parseFromString(xmlText, 'text/html') as unknown as XMLDocument
  }

  const items = Array.from(doc.getElementsByTagName('item'))
  const results: NormalizedContent[] = []

  for (const el of items) {
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

    const mediaEls = [...el.getElementsByTagName('media:content'), ...el.getElementsByTagName('content')]
    const mediaEl = mediaEls.find(e => e.hasAttribute('url'))
    if (mediaEl) {
      raw['media:content'] = { url: mediaEl.getAttribute('url') ?? '' }
    }

    const encodedEl =
      el.getElementsByTagName('content:encoded')[0] ||
      el.getElementsByTagName('encoded')[0]
    if (encodedEl) {
      raw['content:encoded'] = encodedEl.textContent ?? ''
    }

    const enclosureEl = el.getElementsByTagName('enclosure')[0]
    if (enclosureEl) {
      raw.enclosure = {
        url: enclosureEl.getAttribute('url') ?? '',
        type: enclosureEl.getAttribute('type') ?? '',
      }
    }

    const normalized = normalizeItem(raw, sourceUrl)
    if (normalized) results.push(normalized)
  }

  return results
}

export async function fetchRss(rssUrl: string): Promise<NormalizedContent[]> {
  // 1순위: Supabase Edge Function — 서버사이드 fetch (Naver CORS 차단 완전 우회)
  if (EDGE_FUNCTION_URL) {
    try {
      const res = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ url: rssUrl }),
        signal: AbortSignal.timeout(20_000),
      })
      if (res.ok) {
        const json = await res.json()
        const xmlText: string = json.content ?? ''
        if (xmlText) {
          const items = parseXmlItems(xmlText, rssUrl)
          if (items.length > 0) return items
        }
      } else {
        console.warn(`[RSS] Edge Function ${res.status}`)
      }
    } catch (e) {
      console.warn('[RSS] Edge Function 실패:', e)
    }
  }

  // 2순위: rss2json.com
  const rss2jsonResult = await tryRss2Json(rssUrl)
  if (rss2jsonResult !== null) return rss2jsonResult

  // 3순위 폴백: CORS 프록시 체인 + 직접 XML 파싱
  const xmlText = await fetchWithProxy(rssUrl)
  return parseXmlItems(xmlText, rssUrl)
}
