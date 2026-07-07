import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type {
  Reservation,
  ReservationFormData,
  ReservationStatus,
} from "../types";

export const reservationsService = {
  async create(data: ReservationFormData): Promise<Reservation> {
    if (!isSupabaseConfigured) throw new Error("Supabase not configured");

    const { data: result, error } = await supabase
      .from("reservations")
      .insert({
        event_type: data.eventType,
        preferred_date: data.preferredDate || null,
        date_flexible: data.dateFlexible,
        expected_attendees: data.expectedAttendees
          ? parseInt(data.expectedAttendees)
          : null,
        event_purpose: data.eventPurpose || null,
        budget_range: data.budgetRange || null,
        additional_details: data.additionalDetails,
        recommended_space: data.recommendedSpace || null,
        selected_space_id: data.selectedSpaceId || null,
        name: data.name,
        phone: data.phone,
        email: data.email,
        company: data.company || null,
        notes: data.notes || null,
      })
      .select()
      .single();

    if (error) throw error;
    return result as Reservation;
  },

  async getAll(filters?: { status?: ReservationStatus }) {
    if (!isSupabaseConfigured) return [];

    let query = supabase
      .from("reservations")
      .select("*, spaces(name, slug)")
      .order("created_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Reservation[];
  },

  async updateStatus(
    id: string,
    status: ReservationStatus,
    adminNotes?: string,
  ) {
    if (!isSupabaseConfigured) throw new Error("Supabase not configured");

    const update: Record<string, unknown> = { status };
    if (adminNotes !== undefined) update.admin_notes = adminNotes;

    const { data, error } = await supabase
      .from("reservations")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Reservation;
  },
};
