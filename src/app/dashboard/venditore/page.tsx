import Link from "next/link";

import { deleteNote } from "@/app/actions/notes";
import { downloadNote } from "@/app/actions/purchases";
import Stat from "@/components/stat";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  STATUS_LABEL,
  formatDate,
  formatPrice,
  type Note,
  type NoteStatus,
} from "@/lib/types";

export const metadata = { title: "I miei appunti — AppuntiUni" };

const STATUS_STYLE: Record<NoteStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

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

  return (
    <div className="flex flex-col gap-6">
      {params.errore && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{params.errore}</p>
      )}

      <div className="grid gap-5 sm:grid-cols-3">
        <Stat label="Appunti caricati" value={notes.length} />
        <Stat label="Vendite totali" value={sales.length} />
        <Stat label="Incasso" value={formatPrice(revenue)} />
      </div>

      <div className="flex justify-end">
        <Link href="/dashboard/venditore/nuovo" className="btn-primary">
          + Carica nuovi appunti
        </Link>
      </div>

      <section className="card divide-y divide-slate-200">
        <header className="px-5 py-4">
          <h2 className="font-semibold">I miei annunci</h2>
        </header>

        {notes.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-600">
            Non hai ancora caricato appunti.
          </p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/appunti/${note.id}`}
                    className="truncate font-medium hover:underline"
                  >
                    {note.title}
                  </Link>
                  <span className={`badge ${STATUS_STYLE[note.status]}`}>
                    {STATUS_LABEL[note.status]}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {formatPrice(note.price_cents)} · caricato il {formatDate(note.created_at)}
                  {note.status === "rejected" && note.reject_reason
                    ? ` · motivo: ${note.reject_reason}`
                    : ""}
                </p>
              </div>

              <form action={downloadNote}>
                <input type="hidden" name="note_id" value={note.id} />
                <input type="hidden" name="back" value="/dashboard/venditore" />
                <button type="submit" className="btn-secondary">
                  Scarica
                </button>
              </form>

              <form action={deleteNote}>
                <input type="hidden" name="note_id" value={note.id} />
                <button type="submit" className="btn-danger">
                  Elimina
                </button>
              </form>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
