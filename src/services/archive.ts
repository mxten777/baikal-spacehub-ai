import { supabase } from '../lib/supabase'
import type { ArchiveItem, FilterOptions } from '../types'

export const archiveService = {
  /** 공개 목록 (공개 조건 적용) */
  async getAll(filters?: FilterOptions & { limit?: number }): Promise<ArchiveItem[]> {
    const now = new Date().toISOString()
    let query = supabase
      .from('archive_items')
      .select('*')
      .eq('publish_status', 'published')
      .or(`published_at.is.null,published_at.lte.${now}`)
      .order('date', { ascending: false })

    if (filters?.category) query = query.eq('category', filters.category)
    if (filters?.featured) query = query.eq('is_featured', true)
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }
    if (filters?.limit) query = query.limit(filters.limit)

    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },

  /** 공개 slug 조회 (공개 조건 적용) */
  async getBySlug(slug: string): Promise<ArchiveItem | null> {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('archive_items')
      .select('*')
      .eq('slug', slug)
      .eq('publish_status', 'published')
      .or(`published_at.is.null,published_at.lte.${now}`)
      .single()
    if (error) return null
    return data
  },

  /** 관리자 전체 목록 (공개 조건 미적용) */
  async getAllAdmin(filters?: FilterOptions & { limit?: number }): Promise<ArchiveItem[]> {
    let query = supabase
      .from('archive_items')
      .select('*')
      .order('date', { ascending: false })

    if (filters?.category) query = query.eq('category', filters.category)
    if (filters?.featured) query = query.eq('is_featured', true)
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }
    if (filters?.limit) query = query.limit(filters.limit)

    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },

  async create(item: Omit<ArchiveItem, 'id' | 'created_at' | 'updated_at'>): Promise<ArchiveItem> {
    const { data, error } = await supabase.from('archive_items').insert(item).select().single()
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<ArchiveItem>): Promise<ArchiveItem> {
    const { data, error } = await supabase
      .from('archive_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('archive_items').delete().eq('id', id)
    if (error) throw error
  },
}
