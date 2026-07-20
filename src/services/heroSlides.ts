import { supabase } from "../lib/supabase";
import type { HeroSlide } from "../types";

export type HeroSlideCreateInput = Omit<
  HeroSlide,
  "id" | "created_at" | "updated_at"
>;
export type HeroSlideUpdateInput = Partial<HeroSlideCreateInput>;

export const heroSlidesService = {
  /** Admin: 전체 슬라이드 조회 (비활성 포함) */
  async getAll(): Promise<HeroSlide[]> {
    const { data, error } = await supabase
      .from("hero_slides")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  /**
   * 공개: 활성 + 게시기간 내 슬라이드만 조회
   * 조건: is_active=true AND (start IS NULL OR start<=NOW) AND (end IS NULL OR end>=NOW)
   */
  async getActive(): Promise<HeroSlide[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("hero_slides")
      .select("*")
      .eq("is_active", true)
      .or(`publish_start_at.is.null,publish_start_at.lte."${now}"`)
      .or(`publish_end_at.is.null,publish_end_at.gte."${now}"`)
      .order("display_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async create(data: HeroSlideCreateInput): Promise<HeroSlide> {
    const { data: result, error } = await supabase
      .from("hero_slides")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async update(id: string, data: HeroSlideUpdateInput): Promise<HeroSlide> {
    const { data: result, error } = await supabase
      .from("hero_slides")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("hero_slides").delete().eq("id", id);
    if (error) throw error;
  },

  /** 순서 변경: 인접 항목과 display_order 교환 */
  async swapOrder(
    a: { id: string; display_order: number },
    b: { id: string; display_order: number },
  ): Promise<void> {
    await Promise.all([
      supabase
        .from("hero_slides")
        .update({ display_order: b.display_order })
        .eq("id", a.id),
      supabase
        .from("hero_slides")
        .update({ display_order: a.display_order })
        .eq("id", b.id),
    ]);
  },
};
