import { supabase } from "../lib/supabase";
import type { BlogPost, BlogCategory, FilterOptions } from "../types";

export const blogService = {
  /** Admin용 전체 목록 (is_published 상관없이, JOIN 없이 경량 조회) */
  async getAllAdmin(limit = 50): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  },

  async getPosts(
    filters?: FilterOptions & { limit?: number; page?: number },
  ): Promise<{ data: BlogPost[]; count: number }> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 12;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const now = new Date().toISOString();

    let query = supabase
      .from("blog_posts")
      .select(
        "*, author:profiles(id, full_name, avatar_url), category:blog_categories(*)",
        { count: "exact" },
      )
      .eq("is_published", true)
      .or(`published_at.is.null,published_at.lte.${now}`)
      .order("published_at", { ascending: false })
      .range(from, to);

    if (filters?.category) query = query.eq("category_id", filters.category);
    if (filters?.featured) query = query.eq("is_featured", true);
    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`,
      );
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data ?? [], count: count ?? 0 };
  },

  async getBySlug(slug: string): Promise<BlogPost | null> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("blog_posts")
      .select(
        "*, author:profiles(id, full_name, avatar_url), category:blog_categories(*)",
      )
      .eq("slug", slug)
      .eq("is_published", true)
      .or(`published_at.is.null,published_at.lte.${now}`)
      .single();
    if (error) return null;

    // Increment view count (fire-and-forget)
    supabase.rpc("increment_view_count", { post_id: data.id }).then(() => {});

    return data;
  },

  async getCategories(): Promise<BlogCategory[]> {
    const { data, error } = await supabase
      .from("blog_categories")
      .select("*")
      .order("name");
    if (error) throw error;
    return data ?? [];
  },

  async create(
    post: Omit<
      BlogPost,
      "id" | "created_at" | "updated_at" | "view_count" | "author" | "category"
    >,
  ): Promise<BlogPost> {
    // 공개 전환 시 published_at 자동 설정 (이미 값이 있으면 유지)
    const now = new Date().toISOString();
    const published_at =
      post.is_published && !post.published_at ? now : (post.published_at ?? null);
    const { data, error } = await supabase
      .from("blog_posts")
      .insert({ ...post, published_at, view_count: 0 })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    const { author: _a, category: _c, ...rest } = updates as BlogPost;
    // 공개 전환 시 published_at 자동 설정 (이미 값이 있으면 유지)
    if (rest.is_published === true && !rest.published_at) {
      rest.published_at = new Date().toISOString();
    }
    // 공개 취소 시 published_at은 이력 보존을 위해 유지 (덮어쓰지 않음)
    const { data, error } = await supabase
      .from("blog_posts")
      .update({ ...rest, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) throw error;
  },
};
