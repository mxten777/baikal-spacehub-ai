import { supabase } from '../lib/supabase'
import type { BlogPost, BlogCategory, FilterOptions } from '../types'

export const blogService = {
  async getPosts(filters?: FilterOptions & { limit?: number; page?: number }): Promise<{ data: BlogPost[]; count: number }> {
    const page = filters?.page ?? 1
    const limit = filters?.limit ?? 12
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('blog_posts')
      .select('*, author:profiles(id, full_name, avatar_url), category:blog_categories(*)', { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(from, to)

    if (filters?.category) query = query.eq('category_id', filters.category)
    if (filters?.featured) query = query.eq('is_featured', true)
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`)
    }

    const { data, error, count } = await query
    if (error) throw error
    return { data: data ?? [], count: count ?? 0 }
  },

  async getBySlug(slug: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, author:profiles(id, full_name, avatar_url), category:blog_categories(*)')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()
    if (error) return null

    // Increment view count (fire-and-forget)
    supabase.rpc('increment_view_count', { post_id: data.id }).then(() => {})

    return data
  },

  async getCategories(): Promise<BlogCategory[]> {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name')
    if (error) throw error
    return data ?? []
  },

  async create(post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'author' | 'category'>): Promise<BlogPost> {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({ ...post, view_count: 0 })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    const { author: _a, category: _c, ...rest } = updates as BlogPost
    const { data, error } = await supabase
      .from('blog_posts')
      .update({ ...rest, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id)
    if (error) throw error
  },
}
