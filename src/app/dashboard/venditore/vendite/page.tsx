import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPrice, type Note, type Purchase } from "@/lib/types";

export const metadata = { title: "Vendite — AppuntiUni" };

type SaleRow = Purchase & { note: Pick<Note, "id" | "title" | "seller_id"> | null };

export default async function SalesPage() {
  const profile = await requireRole(["seller", "admin"], "/dashboard/venditore/vendite");
  const supabase = await createClient();

  // Le policy RLS restituiscono già solo gli acquisti relativi ai propri appunti
  // (più i propri, se l'utente ha anche comprato qualcosa): filtriamo per sicurezza.
  const { data } = await supabase
    .from("purchases")
    .select("*, note:notes(id, title, seller_id)")
    .order("created_at", { ascending: false });

  const sales = ((data ?? []) as SaleRow[]).filter(
    (row) => row.note?.seller_id === profile.id,
  );
  const revenue = sales.reduce((sum, s) => sum + s.amount_cents, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="text-sm text-slate-500">Vendite</p>
          <p className="text-3xl font-bold">{sales.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">Incasso lordo</p>
          <p className="text-3xl font-bold">{formatPrice(revenue)}</p>
        </div>
      </div>

      <section className="card divide-y divide-slate-200">
        <header className="px-5 py-4">
          <h2 className="font-semibold">Storico vendite</h2>
        </header>

        {sales.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-600">
            Nessuna vendita registrata finora.
          </p>
        ) : (
          sales.map((sale) => (
            <div key={sale.id} className="flex items-center gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{sale.note?.title}</p>
                <p className="text-xs text-slate-500">{formatDate(sale.created_at)}</p>
              </div>
              <p className="font-semibold">{formatPrice(sale.amount_cents)}</p>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
