import Link from "next/link";

import { downloadNote } from "@/app/actions/purchases";
import Stat from "@/components/stat";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  NOTE_TYPE_LABEL,
  formatDate,
  formatFileKind,
  formatPrice,
  type Note,
  type Purchase,
} from "@/lib/types";

export const metadata = { title: "I miei acquisti — AppuntiUni" };

type PurchaseRow = Purchase & { note: Note | null };

export default async function BuyerDashboard({
  searchParams,
}: {
  searchParams: Promise<{ acquistato?: string; errore?: string }>;
}) {
  const params = await searchParams;
  const profile = await requireProfile("/dashboard/acquisti");
  const supabase = await createClient();

  const { data } = await supabase
    .from("purchases")
    .select("*, note:notes(*)")
    .eq("buyer_id", profile.id)
    .order("created_at", { ascending: false });

  const purchases = (data ?? []) as PurchaseRow[];
  const totalSpent = purchases.reduce((sum, p) => sum + p.amount_cents, 0);

  return (
    <div className="flex flex-col gap-6">
      {params.acquistato && (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
          Acquisto completato: trovi il file qui sotto.
        </p>
      )}
      {params.errore && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{params.errore}</p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Stat label="Appunti acquistati" value={purchases.length} />
        <Stat label="Totale speso" value={formatPrice(totalSpent)} />
      </div>

      <section className="card divide-y divide-slate-200">
        <header className="px-5 py-4">
          <h2 className="font-semibold">Libreria</h2>
        </header>

        {purchases.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-600">
            Non hai ancora acquistato nulla.{" "}
            <Link href="/appunti" className="font-semibold text-brand-700 hover:underline">
              Sfoglia il catalogo
            </Link>
            .
          </p>
        ) : (
          purchases.map((purchase) => (
            <div
              key={purchase.id}
              className="flex flex-wrap items-center gap-4 px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {purchase.note?.title ?? "Appunto rimosso"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {[
                    purchase.note ? NOTE_TYPE_LABEL[purchase.note.note_type] : null,
                    purchase.note?.course,
                    purchase.note?.pages ? `${purchase.note.pages} pagine` : null,
                    purchase.note ? formatFileKind(purchase.note.file_mime, purchase.note.file_path) : null,
                    `acquistato il ${formatDate(purchase.created_at)}`,
                    formatPrice(purchase.amount_cents),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>

              {purchase.note && (
                <form action={downloadNote}>
                  <input type="hidden" name="note_id" value={purchase.note.id} />
                  <input type="hidden" name="back" value="/dashboard/acquisti" />
                  <button type="submit" className="btn-secondary">
                    Scarica
                  </button>
                </form>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
