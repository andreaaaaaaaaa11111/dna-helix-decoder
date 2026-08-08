import Link from "next/link";
import { notFound } from "next/navigation";

import { purchaseNote, downloadNote } from "@/app/actions/purchases";
import NoteCard from "@/components/note-card";
import { getSessionProfile } from "@/lib/auth";
import { decorateNotes, getRelatedNotes } from "@/lib/notes";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import {
  NOTE_TYPE_LABEL,
  formatDate,
  formatFileKind,
  formatFileSize,
  formatPrice,
  type Note,
} from "@/lib/types";

export default async function NoteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ errore?: string }>;
}) {
  const { id } = await params;
  const { errore } = await searchParams;

  if (!isSupabaseConfigured()) notFound();

  const supabase = await createClient();
  const { data } = await supabase.from("notes").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  const [note] = await decorateNotes([data as Note]);
  const [profile, related] = await Promise.all([
    getSessionProfile(),
    getRelatedNotes(data as Note),
  ]);

  let alreadyBought = false;
  if (profile) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("note_id", note.id)
      .eq("buyer_id", profile.id)
      .maybeSingle();
    alreadyBought = Boolean(purchase);
  }

  const isOwner = profile?.id === note.seller_id;
  const canDownload = alreadyBought || isOwner || profile?.role === "admin";

  const details = [
    { label: "Tipo di materiale", value: NOTE_TYPE_LABEL[note.note_type] ?? "Appunti" },
    { label: "Corso", value: note.course },
    { label: "Università", value: note.university },
    { label: "Docente", value: note.professor },
    { label: "Anno accademico", value: note.academic_year },
    { label: "Pagine", value: note.pages ? `${note.pages}` : null },
    { label: "Lingua", value: note.language },
    {
      label: "File",
      value: [formatFileKind(note.file_mime, note.file_path), formatFileSize(note.file_size)]
        .filter(Boolean)
        .join(" · "),
    },
    { label: "Pubblicato il", value: formatDate(note.created_at) },
    { label: "Copie vendute", value: note.sales_count > 0 ? `${note.sales_count}` : "Nessuna" },
  ].filter((row) => row.value);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/appunti" className="text-sm text-slate-500 hover:underline">
        ← Torna al catalogo
      </Link>

      {note.status !== "approved" && (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Questo annuncio non è pubblico (stato: {note.status}). Lo stai vedendo perché sei
          il venditore o un amministratore.
        </p>
      )}

      <div className="mt-4 grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        {/* colonna principale */}
        <div className="card overflow-hidden">
          {note.preview_url && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={note.preview_url}
              alt={`Anteprima di ${note.title}`}
              className="aspect-[16/9] w-full object-cover"
            />
          )}

          <div className="p-7 sm:p-8">
            <span className="badge bg-brand-50 text-brand-700">
              {NOTE_TYPE_LABEL[note.note_type] ?? "Appunti"}
            </span>
            <h1 className="mt-3 text-3xl font-bold">{note.title}</h1>
            <p className="mt-2 text-sm text-slate-500">
              di {note.seller?.full_name ?? "uno studente"}
              {note.seller?.university ? ` · ${note.seller.university}` : ""}
            </p>

            {note.description && (
              <p className="mt-6 max-w-prose whitespace-pre-line text-slate-700">
                {note.description}
              </p>
            )}

            <dl className="mt-8 grid gap-x-8 gap-y-4 border-t border-slate-100 pt-7 sm:grid-cols-2">
              {details.map((row) => (
                <div key={row.label}>
                  <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    {row.label}
                  </dt>
                  <dd className="mt-1 font-medium text-slate-900">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* riquadro acquisto */}
        <aside className="card p-7 lg:sticky lg:top-24">
          <p className="text-4xl font-bold tabular-nums text-slate-900">
            {formatPrice(note.price_cents)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {note.price_cents === 0
              ? "Download gratuito"
              : "Pagamento unico, download illimitati"}
          </p>

          {errore && (
            <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{errore}</p>
          )}

          <div className="mt-6">
            {!profile && (
              <Link href={`/login?next=/appunti/${note.id}`} className="btn-primary w-full">
                Accedi per acquistare
              </Link>
            )}

            {profile && canDownload && (
              <form action={downloadNote} className="flex flex-col gap-2">
                <input type="hidden" name="note_id" value={note.id} />
                <input type="hidden" name="back" value={`/appunti/${note.id}`} />
                <button type="submit" className="btn-primary w-full">
                  Scarica gli appunti
                </button>
                <span className="text-xs text-slate-500">
                  {isOwner ? "Sei il venditore di questi appunti." : "Già acquistato."}
                </span>
              </form>
            )}

            {profile && !canDownload && profile.role === "buyer" && (
              <form action={purchaseNote}>
                <input type="hidden" name="note_id" value={note.id} />
                <button type="submit" className="btn-primary w-full">
                  {note.price_cents === 0 ? "Ottieni gratis" : "Acquista ora"}
                </button>
                <p className="mt-3 text-xs text-slate-500">
                  Pagamento simulato in questa demo: l&apos;ordine viene registrato subito e
                  il file diventa scaricabile.
                </p>
              </form>
            )}

            {profile && !canDownload && profile.role === "seller" && (
              <p className="text-sm text-slate-600">
                Il tuo account è di tipo venditore. Per acquistare appunti serve un account
                acquirente: chiedi a un amministratore di cambiare il ruolo del tuo profilo.
              </p>
            )}
          </div>

          <ul className="mt-7 space-y-2 border-t border-slate-100 pt-6 text-xs text-slate-500">
            <li>Il file resta privato: link di download firmato e valido 60 secondi.</li>
            <li>Ogni annuncio è controllato da un amministratore prima di comparire qui.</li>
          </ul>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-6 text-2xl font-bold">Altri appunti dello stesso corso</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <NoteCard key={item.id} note={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
