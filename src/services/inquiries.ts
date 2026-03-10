import { supabase } from '../lib/supabase'
import type { Inquiry, InquiryType } from '../types'

export const inquiriesService = {
  async submit(inquiry: Omit<Inquiry, 'id' | 'status' | 'admin_notes' | 'replied_at' | 'created_at' | 'updated_at' | 'space'>): Promise<Inquiry> {
    const { data, error } = await supabase
      .from('inquiries')
      .insert({ ...inquiry, status: 'pending' })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getAll(filters?: { status?: string; type?: InquiryType }): Promise<Inquiry[]> {
    let query = supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.type) query = query.eq('inquiry_type', filters.type)

    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },

  async getById(id: string): Promise<Inquiry | null> {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return null
    return data
  },

  async updateStatus(id: string, status: Inquiry['status'], _notes?: string): Promise<void> {
    const updates: Partial<Inquiry> = {
      status,
      updated_at: new Date().toISOString(),
    }
    // notes and replied_at not stored in current schema

    const { error } = await supabase.from('inquiries').update(updates).eq('id', id)
    if (error) throw error
  },
}
