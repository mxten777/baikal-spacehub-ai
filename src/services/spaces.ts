import { supabase } from '../lib/supabase'
import type { Space, FilterOptions } from '../types'

export const spacesService = {
  /** 공개 목록 (공개 조건 적용) */
  async getAll(filters?: FilterOptions): Promise<Space[]> {
    let query = supabase
      .from('spaces')
      .select('*')
      .eq('publish_status', 'published')
      .or(`published_at.is.null,published_at.lte.${new Date().toISOString()}`)
      .order('sort_order', { ascending: true })

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },

  /** 공개 slug 조회 (공개 조건 적용) */
  async getBySlug(slug: string): Promise<Space | null> {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('spaces')
      .select('*')
      .eq('slug', slug)
      .eq('publish_status', 'published')
      .or(`published_at.is.null,published_at.lte.${now}`)
      .single()
    if (error) return null
    return data
  },

  /** ID 조회 (어드민 내부 용도 — 공개 조건 미적용) */
  async getById(id: string): Promise<Space | null> {
    const { data, error } = await supabase
      .from('spaces')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return null
    return data
  },

  /** 관리자 전체 목록 (공개 조건 미적용) */
  async getAllAdmin(filters?: FilterOptions): Promise<Space[]> {
    let query = supabase
      .from('spaces')
      .select('*')
      .order('sort_order', { ascending: true })

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },

  async create(space: Partial<Space> & Pick<Space, 'name' | 'slug' | 'category' | 'is_available' | 'sort_order'>): Promise<Space> {
    const { data, error } = await supabase
      .from('spaces')
      .insert(space)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Space>): Promise<Space> {
    const { data, error } = await supabase
      .from('spaces')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('spaces').delete().eq('id', id)
    if (error) throw error
  },
}
