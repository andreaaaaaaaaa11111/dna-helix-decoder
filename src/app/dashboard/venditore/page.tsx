import SellerNotes from "@/components/views/seller-notes";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Note } from "@/lib/types";

export const metadata = { title: "I miei appunti — AppuntiUni" };

export default async function SellerDashboard({
  searchParams,
}: {
  searchParams: Promise<{ errore?: string }>;
}) {
  const params = await searchParams;
  const profile = await requireRole(["seller", "admin"], "/dashboard/venditore");
  const supabase = await createClient();

  const [{ data: notesData }, { data: salesData }] = await Promise.all([
    supabase
      .from("notes")
      .select("*")
      .eq("seller_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase.from("purchases").select("amount_cents, note_id"),
  ]);

  const notes = (notesData ?? []) as Note[];
  const noteIds = new Set(notes.map((n) => n.id));
  const sales = (salesData ?? []).filter((s) => noteIds.has(s.note_id));
  const revenue = sales.reduce((sum, s) => sum + s.amount_cents, 0);

  // Vendite per singolo annuncio, mostrate accanto a ogni riga.
  const salesByNote = sales.reduce((map, sale) => {
    map.set(sale.note_id, (map.get(sale.note_id) ?? 0) + 1);
    return map;
  }, new Map<string, number>());

  return (
    <div className="flex flex-col gap-6">
      {params.errore && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{params.errore}</p>
      )}

      <SellerNotes
        notes={notes}
        salesByNote={salesByNote}
        salesCount={sales.length}
        revenue={revenue}
      />
    </div>
  );
}
