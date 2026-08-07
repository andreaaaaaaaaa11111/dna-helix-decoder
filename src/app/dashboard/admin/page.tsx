import Link from "next/link";

import { deleteNote, setNoteStatus } from "@/app/actions/notes";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  STATUS_LABEL,
  formatDate,
  formatPrice,
  type Note,
  type NoteStatus,
} from "@/lib/types";

export const metadata = { title: "Amministrazione — AppuntiUni" };

const STATUS_STYLE: Record<NoteStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

export default async function AdminDashboard() {
  await requireRole(["admin"], "/dashboard/admin");
  const supabase = await createClient();

  const [notesRes, usersRes, purchasesRes] = await Promise.all([
    supabase.from("notes").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, role"),
    supabase.from("purchases").select("amount_cents"),
  ]);

  const notes = (notesRes.data ?? []) as Note[];
  const users = usersRes.data ?? [];
  const purchases = purchasesRes.data ?? [];
  const gmv = purchases.reduce((sum, p) => sum + (p.amount_cents ?? 0), 0);
  const pending = notes.filter((n) => n.status === "pending");

  const stats = [
    { label: "Utenti registrati", value: users.length },
    { label: "Venditori", value: users.filter((u) => u.role === "seller").length },
    { label: "Appunti totali", value: notes.length },
    { label: "In attesa di revisione", value: pending.length },
    { label: "Acquisti", value: purchases.length },
    { label: "Volume vendite", value: formatPrice(gmv) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Link href="/dashboard/admin/utenti" className="btn-secondary">
          Gestisci utenti e ruoli →
        </Link>
      </div>

      <section className="card divide-y divide-slate-200">
        <header className="px-5 py-4">
          <h2 className="font-semibold">Moderazione appunti</h2>
          <p className="text-xs text-slate-500">
            Gli annunci diventano visibili nel catalogo solo dopo l&apos;approvazione.
          </p>
        </header>

        {notes.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-600">
            Nessun appunto caricato.
          </p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
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
                  {formatPrice(note.price_cents)} · {note.university ?? "ateneo n.d."} ·{" "}
                  {formatDate(note.created_at)}
                </p>
              </div>

              {note.status !== "approved" && (
                <form action={setNoteStatus}>
                  <input type="hidden" name="note_id" value={note.id} />
                  <input type="hidden" name="status" value="approved" />
                  <button type="submit" className="btn-primary">
                    Approva
                  </button>
                </form>
              )}

              {note.status !== "rejected" && (
                <form action={setNoteStatus} className="flex items-center gap-2">
                  <input type="hidden" name="note_id" value={note.id} />
                  <input type="hidden" name="status" value="rejected" />
                  <input
                    name="reject_reason"
                    placeholder="Motivo"
                    className="input w-32 py-1 text-xs"
                  />
                  <button type="submit" className="btn-secondary">
                    Rifiuta
                  </button>
                </form>
              )}

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
