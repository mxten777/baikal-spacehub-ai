import { supabase } from '../lib/supabase'
import type { FetchLog } from '../types'

export const fetchLogsService = {
  async getRecent(sourceId?: string, limit = 50): Promise<FetchLog[]> {
    let query = supabase
      .from('fetch_logs')
      .select('*, source:content_sources(name,platform)')
      .order('fetched_at', { ascending: false })
      .limit(limit)

    if (sourceId) query = query.eq('source_id', sourceId)

    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },

  async create(
    log: Omit<FetchLog, 'id' | 'fetched_at'>
  ): Promise<FetchLog> {
    const { data, error } = await supabase
      .from('fetch_logs')
      .insert(log)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getLastSuccessful(sourceId: string): Promise<FetchLog | null> {
    const { data, error } = await supabase
      .from('fetch_logs')
      .select('*')
      .eq('source_id', sourceId)
      .eq('status', 'success')
      .order('fetched_at', { ascending: false })
      .limit(1)
      .single()
    if (error) return null
    return data
  },
}
