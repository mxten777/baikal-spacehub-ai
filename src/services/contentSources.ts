import { supabase } from '../lib/supabase'
import type { ContentSource, ContentPlatform } from '../types'

export const contentSourcesService = {
  async getAll(platform?: ContentPlatform): Promise<ContentSource[]> {
    let query = supabase
      .from('content_sources')
      .select('*')
      .order('created_at', { ascending: false })

    if (platform) query = query.eq('platform', platform)

    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },

  async getActive(): Promise<ContentSource[]> {
    const { data, error } = await supabase
      .from('content_sources')
      .select('*')
      .eq('is_active', true)
      .order('platform')
    if (error) throw error
    return data ?? []
  },

  async getById(id: string): Promise<ContentSource | null> {
    const { data, error } = await supabase
      .from('content_sources')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return null
    return data
  },

  async create(
    source: Omit<ContentSource, 'id' | 'created_at' | 'updated_at' | 'last_fetched_at'>
  ): Promise<ContentSource> {
    const { data, error } = await supabase
      .from('content_sources')
      .insert(source)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<ContentSource>): Promise<ContentSource> {
    const { data, error } = await supabase
      .from('content_sources')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateLastFetched(id: string): Promise<void> {
    const { error } = await supabase
      .from('content_sources')
      .update({ last_fetched_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('content_sources').delete().eq('id', id)
    if (error) throw error
  },
}
