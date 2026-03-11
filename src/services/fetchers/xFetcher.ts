/**
 * X (Twitter) API v2 Fetcher
 * 
 * Bearer Token 기반 인증 (앱 전용 읽기).
 * X API v2 timeline endpoint 사용.
 * 
 * 주의: X API v2는 브라우저에서 직접 호출 불가 (CORS 없음).
 * 반드시 Supabase Edge Function 또는 서버 사이드에서 실행해야 한다.
 * 
 * Free Tier: 월 500,000 Read 기준.
 */
import type { NormalizedContent } from '../../types'

interface XTweet {
  id: string
  text: string
  created_at?: string
  attachments?: { media_keys?: string[] }
  author_id?: string
}

interface XMedia {
  media_key: string
  type: 'photo' | 'video' | 'animated_gif'
  url?: string
  preview_image_url?: string
}

interface XUser {
  id: string
  name: string
  username: string
  profile_image_url?: string
}

interface XTimelineResponse {
  data?: XTweet[]
  includes?: {
    media?: XMedia[]
    users?: XUser[]
  }
  meta?: { newest_id?: string; oldest_id?: string; result_count?: number }
}

export async function fetchXTimeline(
  userId: string,
  bearerToken: string,
  maxResults = 20
): Promise<NormalizedContent[]> {
  const url = new URL(`https://api.twitter.com/2/users/${userId}/tweets`)
  url.searchParams.set(
    'tweet.fields',
    'created_at,text,attachments,author_id,entities'
  )
  url.searchParams.set('expansions', 'attachments.media_keys,author_id')
  url.searchParams.set('media.fields', 'url,preview_image_url,type')
  url.searchParams.set('user.fields', 'name,username,profile_image_url')
  url.searchParams.set('max_results', String(Math.min(maxResults, 100)))
  // 리트윗 제외
  url.searchParams.set('exclude', 'retweets,replies')

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${bearerToken}` },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`X API error: ${res.status} — ${JSON.stringify(err)}`)
  }

  const json: XTimelineResponse = await res.json()
  const tweets = json.data ?? []
  const mediaMap = new Map<string, XMedia>(
    (json.includes?.media ?? []).map((m) => [m.media_key, m])
  )
  const userMap = new Map<string, XUser>(
    (json.includes?.users ?? []).map((u) => [u.id, u])
  )

  return tweets.map((tweet): NormalizedContent => {
    const author = tweet.author_id ? userMap.get(tweet.author_id) : undefined
    const mediaKeys = tweet.attachments?.media_keys ?? []
    const firstMedia = mediaKeys.length > 0 ? mediaMap.get(mediaKeys[0]) : undefined

    const thumbnail =
      firstMedia?.url ?? firstMedia?.preview_image_url ?? undefined

    // 텍스트에서 URL 제거하여 요약 생성
    const summary = tweet.text
      .replace(/https:\/\/t\.co\/\S+/g, '')
      .trim()
      .slice(0, 280)

    return {
      external_id: tweet.id,
      external_url: author
        ? `https://x.com/${author.username}/status/${tweet.id}`
        : `https://x.com/i/web/status/${tweet.id}`,
      title: summary.split('\n')[0]?.slice(0, 100) ?? 'X 게시물',
      summary,
      author_name: author ? `@${author.username}` : undefined,
      thumbnail_url: thumbnail,
      published_at: tweet.created_at
        ? new Date(tweet.created_at).toISOString()
        : undefined,
      platform: 'x',
      metadata_json: {
        tweet_id: tweet.id,
        has_media: mediaKeys.length > 0,
        media_type: firstMedia?.type,
      },
    }
  })
}

// userId를 username으로 조회하는 헬퍼
export async function lookupXUserId(
  username: string,
  bearerToken: string
): Promise<string | null> {
  const url = `https://api.twitter.com/2/users/by/username/${username}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${bearerToken}` },
  })
  if (!res.ok) return null
  const json = await res.json()
  return json.data?.id ?? null
}
