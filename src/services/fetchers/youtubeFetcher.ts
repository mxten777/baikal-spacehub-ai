/**
 * YouTube Data API v3 Fetcher
 * 
 * 채널 또는 플레이리스트의 최신 영상을 수집한다.
 * API_KEY는 Supabase settings 테이블 또는 환경 변수에서 가져온다.
 * 
 * 실제 운영에서는 API Key를 브라우저에 노출하지 않기 위해
 * Supabase Edge Function으로 이동할 것.
 */
import type { NormalizedContent } from '../../types'

interface YouTubeSearchItem {
  id: { videoId: string }
  snippet: {
    title: string
    description: string
    thumbnails: { high?: { url: string }; medium?: { url: string } }
    publishedAt: string
    channelTitle: string
  }
}

interface YouTubePlaylistItem {
  snippet: {
    title: string
    description: string
    thumbnails: { high?: { url: string }; medium?: { url: string } }
    publishedAt: string
    channelTitle: string
    resourceId: { videoId: string }
  }
}

// 채널의 최신 업로드 플레이리스트 ID 조회
async function getUploadsPlaylistId(channelId: string, apiKey: string): Promise<string | null> {
  const url = new URL('https://www.googleapis.com/youtube/v3/channels')
  url.searchParams.set('part', 'contentDetails')
  url.searchParams.set('id', channelId)
  url.searchParams.set('key', apiKey)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`YouTube Channels API error: ${res.status}`)

  const json = await res.json()
  return json.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? null
}

// 플레이리스트에서 영상 목록 수집
export async function fetchYouTubeChannel(
  channelId: string,
  apiKey: string,
  maxResults = 20
): Promise<NormalizedContent[]> {
  // 1. uploads 플레이리스트 ID 조회
  const playlistId = await getUploadsPlaylistId(channelId, apiKey)
  if (!playlistId) throw new Error('YouTube: uploads playlist not found')

  return fetchYouTubePlaylist(playlistId, apiKey, maxResults)
}

export async function fetchYouTubePlaylist(
  playlistId: string,
  apiKey: string,
  maxResults = 20
): Promise<NormalizedContent[]> {
  const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems')
  url.searchParams.set('part', 'snippet')
  url.searchParams.set('playlistId', playlistId)
  url.searchParams.set('maxResults', String(Math.min(maxResults, 50)))
  url.searchParams.set('key', apiKey)

  const res = await fetch(url.toString())
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`YouTube PlaylistItems API error: ${res.status} — ${JSON.stringify(err)}`)
  }

  const json = await res.json()
  const items: YouTubePlaylistItem[] = json.items ?? []

  return items
    .map((item): NormalizedContent | null => {
      const videoId = item.snippet.resourceId?.videoId
      if (!videoId) return null

      return {
        external_id: videoId,
        external_url: `https://www.youtube.com/watch?v=${videoId}`,
        title: item.snippet.title,
        summary: item.snippet.description?.slice(0, 300),
        author_name: item.snippet.channelTitle,
        thumbnail_url:
          item.snippet.thumbnails.high?.url ?? item.snippet.thumbnails.medium?.url,
        media_url: `https://www.youtube.com/embed/${videoId}`,
        published_at: item.snippet.publishedAt
          ? new Date(item.snippet.publishedAt).toISOString()
          : undefined,
        platform: 'youtube',
        metadata_json: {
          video_id: videoId,
          playlist_id: playlistId,
          embed_url: `https://www.youtube.com/embed/${videoId}`,
        },
      }
    })
    .filter((item): item is NormalizedContent => item !== null)
}

// 키워드 검색 기반 수집 (선택적)
export async function searchYouTube(
  query: string,
  channelId: string,
  apiKey: string,
  maxResults = 10
): Promise<NormalizedContent[]> {
  const url = new URL('https://www.googleapis.com/youtube/v3/search')
  url.searchParams.set('part', 'snippet')
  url.searchParams.set('type', 'video')
  url.searchParams.set('channelId', channelId)
  url.searchParams.set('q', query)
  url.searchParams.set('maxResults', String(maxResults))
  url.searchParams.set('order', 'date')
  url.searchParams.set('key', apiKey)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`YouTube Search API error: ${res.status}`)

  const json = await res.json()
  const items: YouTubeSearchItem[] = json.items ?? []

  return items.map((item): NormalizedContent => {
    const videoId = item.id.videoId
    return {
      external_id: videoId,
      external_url: `https://www.youtube.com/watch?v=${videoId}`,
      title: item.snippet.title,
      summary: item.snippet.description?.slice(0, 300),
      author_name: item.snippet.channelTitle,
      thumbnail_url:
        item.snippet.thumbnails.high?.url ?? item.snippet.thumbnails.medium?.url,
      media_url: `https://www.youtube.com/embed/${videoId}`,
      published_at: item.snippet.publishedAt
        ? new Date(item.snippet.publishedAt).toISOString()
        : undefined,
      platform: 'youtube',
      metadata_json: {
        video_id: videoId,
        embed_url: `https://www.youtube.com/embed/${videoId}`,
      },
    }
  })
}
