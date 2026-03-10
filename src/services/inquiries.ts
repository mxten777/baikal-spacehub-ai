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
      .select('*, space:spaces(id, name)')
      .order('created_at', { ascending: false })

    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.type) query = query.eq('type', filters.type)

    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },

  async getById(id: string): Promise<Inquiry | null> {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*, space:spaces(*)')
      .eq('id', id)
      .single()
    if (error) return null
    return data
  },

  async updateStatus(id: string, status: Inquiry['status'], notes?: string): Promise<void> {
    const updates: Partial<Inquiry> = {
      status,
      updated_at: new Date().toISOString(),
    }
    if (notes) updates.admin_notes = notes
    if (status === 'replied') updates.replied_at = new Date().toISOString()

    const { error } = await supabase.from('inquiries').update(updates).eq('id', id)
    if (error) throw error
  },
}
