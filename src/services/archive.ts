import { supabase } from '../lib/supabase'
import type { ArchiveItem, FilterOptions } from '../types'

export const archiveService = {
  async getAll(filters?: FilterOptions & { limit?: number }): Promise<ArchiveItem[]> {
    let query = supabase
      .from('archives')
      .select('*')
      .order('held_date', { ascending: false })

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

  async getBySlug(slug: string): Promise<ArchiveItem | null> {
    const { data, error } = await supabase
      .from('archives')
      .select('*')
      .eq('slug', slug)
      .single()
    if (error) return null
    return data
  },

  async create(item: Omit<ArchiveItem, 'id' | 'created_at' | 'updated_at'>): Promise<ArchiveItem> {
    const { data, error } = await supabase.from('archives').insert(item).select().single()
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<ArchiveItem>): Promise<ArchiveItem> {
    const { data, error } = await supabase
      .from('archives')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('archives').delete().eq('id', id)
    if (error) throw error
  },
}
