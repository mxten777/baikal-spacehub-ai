import { supabase } from '../lib/supabase'
import type { Program, FilterOptions } from '../types'

export const programsService = {
  async getAll(filters?: FilterOptions & { limit?: number }): Promise<Program[]> {
    let query = supabase
      .from('programs')
      .select('*, space:spaces(id, name, name_en)')
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

  async getUpcoming(limit = 6): Promise<Program[]> {
    const { data, error } = await supabase
      .from('programs')
      .select('*, space:spaces(id, name)')
      .in('status', ['upcoming', 'ongoing'])
      .gte('end_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(limit)
    if (error) throw error
    return data ?? []
  },

  async getBySlug(slug: string): Promise<Program | null> {
    const { data, error } = await supabase
      .from('programs')
      .select('*, space:spaces(*)')
      .eq('slug', slug)
      .single()
    if (error) return null
    return data
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
