import { supabase } from '../lib/supabase'
import type { Space, FilterOptions } from '../types'

export const spacesService = {
  async getAll(filters?: FilterOptions): Promise<Space[]> {
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

  async getBySlug(slug: string): Promise<Space | null> {
    const { data, error } = await supabase
      .from('spaces')
      .select('*')
      .eq('slug', slug)
      .single()
    if (error) return null
    return data
  },

  async getById(id: string): Promise<Space | null> {
    const { data, error } = await supabase
      .from('spaces')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return null
    return data
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
