import { MISSING_CONFIG_MESSAGE, isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Note, NoteWithSeller } from "@/lib/types";

type SellerRow = { id: string; full_name: string | null; university: string | null };

/**
 * Aggancia i dati pubblici del venditore a una lista di appunti.
 * Query separata (invece di un embed PostgREST) perché `profiles` è chiusa
 * dalle policy: i dati pubblici stanno nella vista `sellers_public`.
 */
export async function attachSellers(notes: Note[]): Promise<NoteWithSeller[]> {
  if (notes.length === 0) return [];

  const supabase = await createClient();
  const ids = [...new Set(notes.map((n) => n.seller_id))];
  const { data } = await supabase
    .from("sellers_public")
    .select("id, full_name, university")
    .in("id", ids);

  const byId = new Map<string, SellerRow>((data ?? []).map((s: SellerRow) => [s.id, s]));
  return notes.map((note) => ({ ...note, seller: byId.get(note.seller_id) ?? null }));
}

export type CatalogFilters = {
  q?: string;
  university?: string;
  free?: boolean;
  limit?: number;
};

/** Appunti pubblicati e visibili nel catalogo. */
export async function getCatalog(filters: CatalogFilters = {}) {
  if (!isSupabaseConfigured()) {
    return { notes: [] as NoteWithSeller[], error: MISSING_CONFIG_MESSAGE };
  }

  const supabase = await createClient();

  let query = supabase
    .from("notes")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(filters.limit ?? 60);

  if (filters.q) {
    const term = filters.q.replace(/[%,()]/g, " ").trim();
    if (term) {
      query = query.or(
        `title.ilike.%${term}%,description.ilike.%${term}%,course.ilike.%${term}%`,
      );
    }
  }
  if (filters.university) {
    query = query.ilike("university", `%${filters.university}%`);
  }
  if (filters.free) {
    query = query.eq("price_cents", 0);
  }

  try {
    const { data, error } = await query;
    if (error) return { notes: [] as NoteWithSeller[], error: error.message };
    return { notes: await attachSellers((data ?? []) as Note[]), error: null };
  } catch (err) {
    return {
      notes: [] as NoteWithSeller[],
      error: err instanceof Error ? err.message : "Catalogo non disponibile",
    };
  }
}
