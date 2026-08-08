import Link from "next/link";

import {
  NOTE_TYPE_LABEL,
  formatFileKind,
  formatPrice,
  type NoteWithSeller,
} from "@/lib/types";

export default function NoteCard({ note }: { note: NoteWithSeller }) {
  const meta = [
    note.pages ? `${note.pages} pagine` : null,
    formatFileKind(note.file_mime, note.file_path),
    note.sales_count > 0 ? `${note.sales_count} venduti` : null,
  ].filter(Boolean);

  return (
    <Link
      href={`/appunti/${note.id}`}
      className="card group flex flex-col overflow-hidden transition duration-150 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
        {note.preview_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={note.preview_url}
            alt=""
            className="size-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="paper-grid flex size-full items-center justify-center">
            <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              {formatFileKind(note.file_mime, note.file_path)}
            </span>
          </div>
        )}
        <span className="badge absolute top-3 left-3 bg-white/95 text-slate-700 shadow-sm">
          {NOTE_TYPE_LABEL[note.note_type] ?? "Appunti"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg leading-snug font-semibold text-slate-900 group-hover:text-brand-700">
            {note.title}
          </h3>
          <span className="badge shrink-0 bg-brand-50 text-brand-700">
            {formatPrice(note.price_cents)}
          </span>
        </div>

        {note.description && (
          <p className="line-clamp-2 text-sm text-slate-600">{note.description}</p>
        )}

        <dl className="mt-auto space-y-1.5 border-t border-slate-100 pt-4 text-xs text-slate-500">
          {note.course && (
            <div>
              <span className="font-medium text-slate-600">Corso:</span> {note.course}
            </div>
          )}
          {note.university && (
            <div>
              <span className="font-medium text-slate-600">Ateneo:</span> {note.university}
            </div>
          )}
          <div>
            <span className="font-medium text-slate-600">Venditore:</span>{" "}
            {note.seller?.full_name ?? "Studente"}
          </div>
          {meta.length > 0 && <div>{meta.join(" · ")}</div>}
        </dl>
      </div>
    </Link>
  );
}
