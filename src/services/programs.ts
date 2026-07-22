import { supabase } from '../lib/supabase'
import type { Program, FilterOptions } from '../types'

export const programsService = {
  /** 공개 목록 (공개 조건 적용) */
  async getAll(filters?: FilterOptions & { limit?: number }): Promise<Program[]> {
    const now = new Date().toISOString()
    let query = supabase
      .from('programs')
      .select('*')
      .eq('is_published', true)
      .or(`published_at.is.null,published_at.lte.${now}`)
      .order('start_date', { ascending: true })

    if (filters?.category) query = query.eq('category', filters.category)
    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.featured) query = query.eq('is_featured', true)
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }
    if (filters?.limit) query = query.limit(filters.limit)

    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },

  /** 홈 예정 프로그램 (공개 조건 + 행사 진행 상태 적용) */
  async getUpcoming(limit = 6): Promise<Program[]> {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('is_published', true)
      .or(`published_at.is.null,published_at.lte.${now}`)
      .in('status', ['upcoming', 'ongoing'])
      .gte('end_date', now)
      .order('start_date', { ascending: true })
      .limit(limit)
    if (error) throw error
    return data ?? []
  },

  /** 공개 slug 조회 (공개 조건 적용) */
  async getBySlug(slug: string): Promise<Program | null> {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .or(`published_at.is.null,published_at.lte.${now}`)
      .single()
    if (error) return null
    return data
  },

  /** 관리자 전체 목록 (공개 조건 미적용) */
  async getAllAdmin(filters?: FilterOptions & { limit?: number }): Promise<Program[]> {
    let query = supabase
      .from('programs')
      .select('*')
      .order('start_date', { ascending: true })

    if (filters?.category) query = query.eq('category', filters.category)
    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.featured) query = query.eq('is_featured', true)
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }
    if (filters?.limit) query = query.limit(filters.limit)

    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },

  async create(program: Omit<Program, 'id' | 'created_at' | 'updated_at' | 'space'>): Promise<Program> {
    const { data, error } = await supabase
      .from('programs')
      .insert(program)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Program>): Promise<Program> {
    const { space: _space, ...rest } = updates as Program
    const { data, error } = await supabase
      .from('programs')
      .update({ ...rest, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('programs').delete().eq('id', id)
    if (error) throw error
  },
}
