/**
 * Content Aggregator
 * 
 * 모든 플랫폼 Fetcher를 통합 조율하는 메인 오케스트레이터.
 * 
 * 수집 흐름:
 * 1. content_sources에서 활성 소스 목록 조회
 * 2. 플랫폼별 fetcher 실행
 * 3. 정규화된 콘텐츠를 external_contents에 upsert
 * 4. fetch_logs에 결과 기록
 * 5. content_sources.last_fetched_at 갱신
 * 
 * 주의:
 * - YouTube / X API는 CORS로 인해 브라우저에서 직접 호출 불가.
 *   실제 운영에서는 Supabase Edge Function으로 실행해야 한다.
 * - RSS는 allOrigins 프록시로 브라우저에서 동작 가능.
 */
import type { ContentSource, FetchResult } from '../../types'
import { contentSourcesService } from '../contentSources'
import { externalContentsService } from '../externalContents'
import { fetchLogsService } from '../fetchLogs'
import { fetchRss } from './rssFetcher'
import { fetchYouTubeChannel, fetchYouTubePlaylist } from './youtubeFetcher'
import { fetchInstagram } from './instagramFetcher'
import { fetchXTimeline, lookupXUserId } from './xFetcher'
import { supabase } from '../../lib/supabase'

// 설정 키 읽기 헬퍼
async function getSetting(key: string): Promise<string> {
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single()
  return data?.value ?? ''
}

async function fetchFromSource(source: ContentSource): Promise<FetchResult> {
  const start = Date.now()

  try {
    let items = []

    switch (source.platform) {
      case 'rss': {
        const url = source.rss_url ?? source.source_url
        if (!url) throw new Error('RSS URL not configured')
        items = await fetchRss(url)
        break
      }

      case 'youtube': {
        const apiKey = await getSetting('youtube_api_key')
        if (!apiKey) throw new Error('YouTube API key not configured')

        if (source.channel_id) {
          items = await fetchYouTubeChannel(source.channel_id, apiKey)
        } else if (source.source_url) {
          // playlist URL에서 ID 추출
          const match = source.source_url.match(/list=([A-Za-z0-9_-]+)/)
          if (!match) throw new Error('Invalid YouTube playlist URL')
          items = await fetchYouTubePlaylist(match[1], apiKey)
        } else {
          throw new Error('YouTube: channel_id or playlist URL required')
        }
        break
      }

      case 'instagram': {
        const token = await getSetting('instagram_access_token')
        if (!token) throw new Error('Instagram access token not configured')
        items = await fetchInstagram(token)
        break
      }

      case 'x': {
        const bearerToken = await getSetting('x_bearer_token')
        if (!bearerToken) throw new Error('X bearer token not configured')

        const handle = source.account_handle?.replace('@', '')
        if (!handle) throw new Error('X account handle not configured')

        const userId = await lookupXUserId(handle, bearerToken)
        if (!userId) throw new Error(`X user not found: ${handle}`)

        items = await fetchXTimeline(userId, bearerToken)
        break
      }

      default:
        throw new Error(`Unknown platform: ${source.platform}`)
    }

    return {
      source_id: source.id,
      platform: source.platform,
      items,
      duration_ms: Date.now() - start,
    }
  } catch (error) {
    return {
      source_id: source.id,
      platform: source.platform,
      items: [],
      error: error instanceof Error ? error.message : String(error),
      duration_ms: Date.now() - start,
    }
  }
}

export interface AggregateResult {
  source_id: string
  source_name: string
  platform: string
  status: 'success' | 'partial' | 'error'
  items_found: number
  items_new: number
  items_skipped: number
  error?: string
  duration_ms: number
}

/** 단일 소스 수집 실행 */
export async function runFetchForSource(sourceId: string): Promise<AggregateResult> {
  const source = await contentSourcesService.getById(sourceId)
  if (!source) throw new Error(`Source not found: ${sourceId}`)

  const result = await fetchFromSource(source)

  let itemsNew = 0
  let itemsSkipped = 0
  let status: 'success' | 'partial' | 'error' = 'success'

  if (result.error) {
    status = 'error'
  } else if (result.items.length > 0) {
    const { inserted, skipped } = await externalContentsService.upsertBatch(
      source.id,
      source.platform,
      result.items,
      source.auto_publish
    )
    itemsNew = inserted
    itemsSkipped = skipped
  }

  // 로그 기록
  await fetchLogsService.create({
    source_id: source.id,
    platform: source.platform,
    status,
    items_found: result.items.length,
    items_new: itemsNew,
    items_skipped: itemsSkipped,
    error_message: result.error ?? null,
    duration_ms: result.duration_ms,
  })

  // 마지막 수집 시각 갱신
  await contentSourcesService.updateLastFetched(source.id)

  return {
    source_id: source.id,
    source_name: source.name,
    platform: source.platform,
    status,
    items_found: result.items.length,
    items_new: itemsNew,
    items_skipped: itemsSkipped,
    error: result.error,
    duration_ms: result.duration_ms,
  }
}

/** 모든 활성 소스 일괄 수집 (관리자 수동 실행용) */
export async function runFetchAll(): Promise<AggregateResult[]> {
  const sources = await contentSourcesService.getActive()
  const results: AggregateResult[] = []

  // 순차 실행 (rate limit 대응)
  for (const source of sources) {
    const result = await runFetchForSource(source.id)
    results.push(result)
    // 각 소스 사이 100ms 대기
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  return results
}
