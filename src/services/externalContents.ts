import { supabase } from '../lib/supabase'
import type {
  ExternalContent,
  ContentPlatform,
  VisibilityStatus,
  NormalizedContent,
  ExternalContentStats,
} from '../types'

export interface ExternalContentFilters {
  platform?: ContentPlatform
  visibility_status?: VisibilityStatus
  category?: string
  is_featured?: boolean
  search?: string
  limit?: number
  page?: number
}

export const externalContentsService = {
  /** 공개용: published + featured 콘텐츠만 */
  async getPublished(
    filters: { platform?: ContentPlatform; category?: string; limit?: number } = {}
  ): Promise<ExternalContent[]> {
    let query = supabase
      .from('external_contents')
      .select('*, source:content_sources(name,platform)')
      .in('visibility_status', ['published', 'featured'])
      .order('published_at', { ascending: false })
      .limit(filters.limit ?? 24)

    if (filters.platform) query = query.eq('platform', filters.platform)
    if (filters.category) query = query.eq('category', filters.category)

    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },

  /** 관리자용: 전체 콘텐츠 + 필터 */
  async getAllAdmin(
    filters: ExternalContentFilters = {}
  ): Promise<{ data: ExternalContent[]; count: number }> {
    const { limit = 20, page = 1, ...rest } = filters
    const offset = (page - 1) * limit

    let query = supabase
      .from('external_contents')
      .select('*, source:content_sources(name,platform)', { count: 'exact' })
      .order('fetched_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (rest.platform) query = query.eq('platform', rest.platform)
    if (rest.visibility_status) query = query.eq('visibility_status', rest.visibility_status)
    if (rest.category) query = query.eq('category', rest.category)
    if (rest.is_featured !== undefined) query = query.eq('is_featured', rest.is_featured)
    if (rest.search) {
      query = query.or(`title.ilike.%${rest.search}%,summary.ilike.%${rest.search}%`)
    }

    const { data, error, count } = await query
    if (error) throw error
    return { data: data ?? [], count: count ?? 0 }
  },

  /** featured 콘텐츠 (Home 재활용용) */
  async getFeatured(limit = 6): Promise<ExternalContent[]> {
    const { data, error } = await supabase
      .from('external_contents')
      .select('*')
      .eq('is_featured', true)
      .in('visibility_status', ['published', 'featured'])
      .order('published_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data ?? []
  },

  /** 플랫폼별 통계 */
  async getStats(): Promise<ExternalContentStats[]> {
    const { data, error } = await supabase.rpc('get_external_content_stats')
    if (error) throw error
    return data ?? []
  },

  /** 중복 체크 후 일괄 저장 (upsert) */
  async upsertBatch(
    sourceId: string,
    platform: ContentPlatform,
    items: NormalizedContent[],
    autoPublish: boolean
  ): Promise<{ inserted: number; skipped: number }> {
    if (items.length === 0) return { inserted: 0, skipped: 0 }

    const rows = items.map((item) => ({
      source_id: sourceId,
      platform,
      external_id: item.external_id,
      external_url: item.external_url,
      title: item.title ?? null,
      summary: item.summary ?? null,
      content: item.content ?? null,
      author_name: item.author_name ?? null,
      thumbnail_url: item.thumbnail_url ?? null,
      media_url: item.media_url ?? null,
      published_at: item.published_at ?? null,
      metadata_json: item.metadata_json ?? {},
      visibility_status: autoPublish ? 'published' : 'pending',
      fetched_at: new Date().toISOString(),
    }))

    // ignoreDuplicates:true 는 삽입된 행을 반환하지 않으므로 두 단계로 처리
    // 1) upsert (중복이면 아무것도 안 함)
    const { error } = await supabase
      .from('external_contents')
      .upsert(rows, {
        onConflict: 'source_id,external_id',
        ignoreDuplicates: true,
      })

    if (error) throw error

    // 2) 방금 upsert한 external_id들 중 실제로 존재하는 행 수 = 총 행 수 (inserted + already existed)
    //    inserted = 총 행 수 - 이미 있던(skipped) 행 수를 직접 계산하기 어려우므로
    //    fetched_at이 지금과 가까운 行 수로 근사치 계산
    const externalIds = rows.map((r) => r.external_id)
    const { count: totalNow } = await supabase
      .from('external_contents')
      .select('id', { count: 'exact', head: true })
      .eq('source_id', sourceId)
      .in('external_id', externalIds)

    const total = totalNow ?? items.length
    // 이번에 새로 들어온 것 = upsert 시도한 수 중 기존 미존재分
    // 근사: fetched_at이 지금(30초 이내)인 것만 counted
    const since = new Date(Date.now() - 30_000).toISOString()
    const { count: insertedCount } = await supabase
      .from('external_contents')
      .select('id', { count: 'exact', head: true })
      .eq('source_id', sourceId)
      .in('external_id', externalIds)
      .gte('fetched_at', since)

    const inserted = insertedCount ?? 0
    const skipped = total - inserted
    return { inserted, skipped }
  },

  async updateVisibility(id: string, status: VisibilityStatus): Promise<void> {
    const { error } = await supabase
      .from('external_contents')
      .update({ visibility_status: status, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  },

  async updateFeatured(id: string, isFeatured: boolean): Promise<void> {
    const { error } = await supabase
      .from('external_contents')
      .update({ is_featured: isFeatured, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  },

  async updateMeta(
    id: string,
    updates: {
      category?: string
      related_space_id?: string | null
      related_program_id?: string | null
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('external_contents')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('external_contents').delete().eq('id', id)
    if (error) throw error
  },
}
