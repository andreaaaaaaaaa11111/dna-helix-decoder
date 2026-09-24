import Link from "next/link";

import { deleteNote, setNoteStatus } from "@/app/actions/notes";
import Stat from "@/components/stat";
import {
  NOTE_TYPE_LABEL,
  STATUS_LABEL,
  formatDate,
  formatFileSize,
  formatPrice,
  type Note,
  type NoteStatus,
} from "@/lib/types";

const STATUS_STYLE: Record<NoteStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

export type AdminStat = { label: string; value: string | number };

/** Vista della dashboard amministratore: statistiche e moderazione. */
export default function AdminOverview({
  stats,
  notes,
  readOnly = false,
}: {
  stats: AdminStat[];
  notes: Note[];
  readOnly?: boolean;
}) {
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-3">
        {stats.map((stat) => (
          <Stat key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="flex justify-end">
        <Link
          href={readOnly ? "/demo/utenti" : "/dashboard/admin/utenti"}
          className="btn-secondary"
        >
          Gestisci utenti e ruoli →
        </Link>
      </div>

      <section className="card divide-y divide-slate-200">
        <header className="px-5 py-4">
          <h2 className="font-semibold">Moderazione appunti</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Gli annunci diventano visibili nel catalogo solo dopo l&apos;approvazione.
          </p>
        </header>

        {notes.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-600">Nessun appunto caricato.</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="flex flex-wrap items-center gap-3 px-5 py-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {readOnly ? (
                    <span className="font-semibold">{note.title}</span>
                  ) : (
                    <Link href={`/appunti/${note.id}`} className="font-semibold hover:underline">
                      {note.title}
                    </Link>
                  )}
                  <span className={`badge ${STATUS_STYLE[note.status]}`}>
                    {STATUS_LABEL[note.status]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {[
                    formatPrice(note.price_cents),
                    NOTE_TYPE_LABEL[note.note_type] ?? "Appunti",
                    note.course,
                    note.university ?? "ateneo n.d.",
                    note.pages ? `${note.pages} pagine` : null,
                    formatFileSize(note.file_size),
                    formatDate(note.created_at),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>

              {readOnly ? (
                <>
                  {note.status !== "approved" && (
                    <button type="button" className="btn-primary" disabled>
                      Approva
                    </button>
                  )}
                  {note.status !== "rejected" && (
                    <button type="button" className="btn-secondary" disabled>
                      Rifiuta
                    </button>
                  )}
                  <button type="button" className="btn-danger" disabled>
                    Elimina
                  </button>
                </>
              ) : (
                <>
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
                        className="input w-32 py-1.5 text-xs"
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
                </>
              )}
            </div>
          ))
        )}
      </section>
    </>
  );
}
