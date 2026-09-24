import Link from "next/link";

import { deleteNote } from "@/app/actions/notes";
import { downloadNote } from "@/app/actions/purchases";
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

/** Vista della dashboard venditore: annunci, stato, vendite e incasso. */
export default function SellerNotes({
  notes,
  salesByNote,
  salesCount,
  revenue,
  readOnly = false,
}: {
  notes: Note[];
  salesByNote: Map<string, number>;
  salesCount: number;
  revenue: number;
  readOnly?: boolean;
}) {
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-3">
        <Stat label="Appunti caricati" value={notes.length} />
        <Stat label="Vendite totali" value={salesCount} />
        <Stat label="Incasso" value={formatPrice(revenue)} />
      </div>

      <div className="flex justify-end">
        <Link
          href={readOnly ? "/demo/caricamento" : "/dashboard/venditore/nuovo"}
          className="btn-primary"
        >
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
            <div key={note.id} className="flex flex-wrap items-center gap-4 px-5 py-5">
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
                    note.pages ? `${note.pages} pagine` : null,
                    formatFileSize(note.file_size),
                    `${salesByNote.get(note.id) ?? 0} vendite`,
                    `caricato il ${formatDate(note.created_at)}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {note.status === "rejected" && note.reject_reason && (
                  <p className="mt-1 text-xs text-red-600">Motivo: {note.reject_reason}</p>
                )}
              </div>

              {readOnly ? (
                <>
                  <button type="button" className="btn-secondary" disabled>
                    Modifica
                  </button>
                  <button type="button" className="btn-secondary" disabled>
                    Scarica
                  </button>
                  <button type="button" className="btn-danger" disabled>
                    Elimina
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={`/dashboard/venditore/${note.id}/modifica`}
                    className="btn-secondary"
                  >
                    Modifica
                  </Link>

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
                </>
              )}
            </div>
          ))
        )}
      </section>
    </>
  );
}
