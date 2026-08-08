import Link from "next/link";

import { formatPrice, type NoteWithSeller } from "@/lib/types";

export default function NoteCard({ note }: { note: NoteWithSeller }) {
  return (
    <Link
      href={`/appunti/${note.id}`}
      className="card group flex flex-col gap-4 p-6 transition duration-150 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg leading-snug font-semibold text-slate-900 group-hover:text-brand-700">
          {note.title}
        </h3>
        <span className="badge shrink-0 bg-brand-50 text-brand-700">
          {formatPrice(note.price_cents)}
        </span>
      </div>

      {note.description && (
        <p className="line-clamp-3 text-sm text-slate-600">{note.description}</p>
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
          {note.pages ? ` · ${note.pages} pagine` : ""}
        </div>
      </dl>
    </Link>
  );
}
