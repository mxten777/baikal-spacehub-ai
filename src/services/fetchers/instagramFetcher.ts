/**
 * Instagram Graph API Fetcher
 * 
 * Instagram Basic Display API 또는 Graph API를 사용한다.
 * - Business/Creator 계정: Instagram Graph API (Meta Business Suite 연동 필요)
 * - Personal 계정: Basic Display API (deprecated 예정으로 Graph API 권장)
 * 
 * 실제 운영에서는 Long-lived Access Token을 Supabase DB에 저장하고
 * Supabase Edge Function에서 토큰을 갱신하며 수집할 것.
 * 
 * 브라우저에서 직접 호출 시 CORS 제한으로 Edge Function 필수.
 */
import type { NormalizedContent } from '../../types'

interface InstagramMedia {
  id: string
  caption?: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url?: string
  thumbnail_url?: string
  permalink: string
  timestamp: string
  username?: string
}

interface InstagramCarouselChild {
  id: string
  media_url?: string
  thumbnail_url?: string
  media_type: string
}

export async function fetchInstagram(
  accessToken: string,
  userId = 'me',
  limit = 20
): Promise<NormalizedContent[]> {
  const fields = [
    'id', 'caption', 'media_type', 'media_url',
    'thumbnail_url', 'permalink', 'timestamp', 'username',
  ].join(',')

  const url = new URL(`https://graph.instagram.com/${userId}/media`)
  url.searchParams.set('fields', fields)
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('access_token', accessToken)

  const res = await fetch(url.toString())
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Instagram API error: ${res.status} — ${JSON.stringify(err)}`)
  }

  const json = await res.json()
  const items: InstagramMedia[] = json.data ?? []

  return items
    .map((item): NormalizedContent | null => {
      const thumbnail =
        item.thumbnail_url ?? (item.media_type === 'IMAGE' ? item.media_url : undefined)

      const summary = item.caption
        ? item.caption.slice(0, 300).replace(/#\S+/g, '').trim()
        : undefined

      return {
        external_id: item.id,
        external_url: item.permalink,
        title: summary?.split('\n')[0]?.slice(0, 100) ?? 'Instagram 게시물',
        summary,
        author_name: item.username,
        thumbnail_url: thumbnail,
        media_url: item.media_url,
        published_at: item.timestamp ? new Date(item.timestamp).toISOString() : undefined,
        platform: 'instagram',
        metadata_json: {
          media_type: item.media_type,
          original_caption: item.caption,
          instagram_id: item.id,
        },
      }
    })
    .filter((item): item is NormalizedContent => item !== null)
}

// Carousel 첫 번째 이미지 추출 (선택적)
export async function fetchCarouselFirstImage(
  mediaId: string,
  accessToken: string
): Promise<InstagramCarouselChild | null> {
  const url = new URL(`https://graph.instagram.com/${mediaId}/children`)
  url.searchParams.set('fields', 'id,media_url,thumbnail_url,media_type')
  url.searchParams.set('access_token', accessToken)

  const res = await fetch(url.toString())
  if (!res.ok) return null

  const json = await res.json()
  return json.data?.[0] ?? null
}

// Long-lived token 갱신 (60일 유효, 매달 갱신 필요)
export async function refreshInstagramToken(longLivedToken: string): Promise<string> {
  const url = new URL('https://graph.instagram.com/refresh_access_token')
  url.searchParams.set('grant_type', 'ig_refresh_token')
  url.searchParams.set('access_token', longLivedToken)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Instagram token refresh failed')

  const json = await res.json()
  return json.access_token
}
