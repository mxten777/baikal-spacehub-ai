import { supabase } from '../lib/supabase'
import type { MediaItem, MediaPlatform } from '../types'

export const mediaService = {
  async getAll(platform?: MediaPlatform, limit = 12): Promise<MediaItem[]> {
    let query = supabase
      .from('media_items')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (platform) query = query.eq('platform', platform)

    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },

  async getFeatured(limit = 6): Promise<MediaItem[]> {
    const { data, error } = await supabase
      .from('media_items')
      .select('*')
      .eq('is_featured', true)
      .order('sort_order', { ascending: true })
      .limit(limit)
    if (error) throw error
    return data ?? []
  },

  async upsert(item: Partial<Pick<MediaItem, 'id'>> & Omit<MediaItem, 'id' | 'created_at'>): Promise<MediaItem> {
    const { data, error } = await supabase
      .from('media_items')
      .upsert(item, { onConflict: 'platform_id' })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('media_items').delete().eq('id', id)
    if (error) throw error
  },
}

// YouTube Data API v3 helper
export const youtubeService = {
  getEmbedUrl: (videoId: string) => `https://www.youtube.com/embed/${videoId}`,
  getThumbnail: (videoId: string) => `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  extractVideoId: (url: string): string | null => {
    const patterns = [
      /youtu\.be\/([^#&?]{11})/,
      /youtube\.com\/watch\?v=([^#&?]{11})/,
      /youtube\.com\/embed\/([^#&?]{11})/,
      /youtube\.com\/shorts\/([^#&?]{11})/,
    ]
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  },
}
