import { MISSING_CONFIG_MESSAGE, isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { NOTE_TYPES, type Note, type NoteType, type NoteWithSeller } from "@/lib/types";

type SellerRow = { id: string; full_name: string | null; university: string | null };

/**
 * Completa una lista di appunti con i dati pubblici del venditore, il numero
 * di vendite e l'URL della copertina.
 *
 * Sono query separate (invece di un embed PostgREST) perché `profiles` e
 * `purchases` sono chiuse dalle policy: i dati pubblici passano dalle viste
 * `sellers_public` e `note_stats`.
 */
export async function decorateNotes(notes: Note[]): Promise<NoteWithSeller[]> {
  if (notes.length === 0) return [];

  const supabase = await createClient();
  const sellerIds = [...new Set(notes.map((n) => n.seller_id))];
  const noteIds = notes.map((n) => n.id);

  const [sellersRes, statsRes] = await Promise.all([
    supabase.from("sellers_public").select("id, full_name, university").in("id", sellerIds),
    supabase.from("note_stats").select("note_id, sales_count").in("note_id", noteIds),
  ]);

  const sellerById = new Map<string, SellerRow>(
    (sellersRes.data ?? []).map((s: SellerRow) => [s.id, s]),
  );
  const salesByNote = new Map<string, number>(
    (statsRes.data ?? []).map((s: { note_id: string; sales_count: number }) => [
      s.note_id,
      Number(s.sales_count) || 0,
    ]),
  );

  return notes.map((note) => ({
    ...note,
    seller: sellerById.get(note.seller_id) ?? null,
    sales_count: salesByNote.get(note.id) ?? 0,
    preview_url: note.preview_path
      ? supabase.storage.from("note-previews").getPublicUrl(note.preview_path).data.publicUrl
      : null,
  }));
}

export const SORT_OPTIONS = {
  recenti: { label: "Più recenti", column: "created_at", ascending: false },
  economici: { label: "Prezzo crescente", column: "price_cents", ascending: true },
  costosi: { label: "Prezzo decrescente", column: "price_cents", ascending: false },
} as const;

export type SortKey = keyof typeof SORT_OPTIONS;

export function isSortKey(value: string | undefined): value is SortKey {
  return value !== undefined && value in SORT_OPTIONS;
}

export type CatalogFilters = {
  q?: string;
  university?: string;
  type?: string;
  maxPrice?: string;
  free?: boolean;
  sort?: SortKey;
  limit?: number;
};

/** Appunti pubblicati e visibili nel catalogo. */
export async function getCatalog(filters: CatalogFilters = {}) {
  if (!isSupabaseConfigured()) {
    return { notes: [] as NoteWithSeller[], error: MISSING_CONFIG_MESSAGE };
  }

  const supabase = await createClient();
  const sort = SORT_OPTIONS[filters.sort ?? "recenti"];

  let query = supabase
    .from("notes")
    .select("*")
    .eq("status", "approved")
    .order(sort.column, { ascending: sort.ascending })
    .limit(filters.limit ?? 60);

  if (filters.q) {
    const term = filters.q.replace(/[%,()]/g, " ").trim();
    if (term) {
      query = query.or(
        `title.ilike.%${term}%,description.ilike.%${term}%,course.ilike.%${term}%,professor.ilike.%${term}%`,
      );
    }
  }
  if (filters.university) {
    query = query.ilike("university", `%${filters.university}%`);
  }
  if (filters.type && NOTE_TYPES.includes(filters.type as NoteType)) {
    query = query.eq("note_type", filters.type);
  }
  if (filters.free) {
    query = query.eq("price_cents", 0);
  } else if (filters.maxPrice) {
    const max = Number(filters.maxPrice.replace(",", "."));
    if (Number.isFinite(max) && max >= 0) {
      query = query.lte("price_cents", Math.round(max * 100));
    }
  }

  try {
    const { data, error } = await query;
    if (error) throw error;
    return { notes: await decorateNotes((data ?? []) as Note[]), error: null };
  } catch (err) {
    // Il dettaglio tecnico serve a chi gestisce il sito, non allo studente.
    console.error("Catalogo non caricato:", err);
    return {
      notes: [] as NoteWithSeller[],
      error:
        "Non riusciamo a caricare il catalogo in questo momento. Riprova tra qualche minuto.",
    };
  }
}

/** Altri appunti dello stesso corso o ateneo, mostrati sotto la scheda. */
export async function getRelatedNotes(note: Note, limit = 3) {
  const supabase = await createClient();
  const key = note.course || note.university;
  if (!key) return [] as NoteWithSeller[];

  const { data } = await supabase
    .from("notes")
    .select("*")
    .eq("status", "approved")
    .neq("id", note.id)
    .or(`course.ilike.%${key}%,university.ilike.%${key}%`)
    .limit(limit);

  return decorateNotes((data ?? []) as Note[]);
}
