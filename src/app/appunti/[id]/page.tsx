import Link from "next/link";
import { notFound } from "next/navigation";

import { purchaseNote, downloadNote } from "@/app/actions/purchases";
import { getSessionProfile } from "@/lib/auth";
import { attachSellers } from "@/lib/notes";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPrice, type Note } from "@/lib/types";

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

  const [note] = await attachSellers([data as Note]);
  const profile = await getSessionProfile();

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

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/appunti" className="text-sm text-slate-500 hover:underline">
        ← Torna al catalogo
      </Link>

      <div className="card mt-4 p-8">
        {note.status !== "approved" && (
          <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Questo annuncio non è pubblico (stato: {note.status}). Lo stai vedendo perché
            sei il venditore o un amministratore.
          </p>
        )}

        <h1 className="text-3xl font-bold">{note.title}</h1>
        <p className="mt-2 text-2xl font-semibold text-brand-700">
          {formatPrice(note.price_cents)}
        </p>

        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Venditore</dt>
            <dd className="font-medium">{note.seller?.full_name ?? "Studente"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Università</dt>
            <dd className="font-medium">{note.university ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Corso</dt>
            <dd className="font-medium">{note.course ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Pagine</dt>
            <dd className="font-medium">{note.pages ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Pubblicato il</dt>
            <dd className="font-medium">{formatDate(note.created_at)}</dd>
          </div>
        </dl>

        {note.description && (
          <p className="mt-6 whitespace-pre-line text-slate-700">{note.description}</p>
        )}

        {errore && (
          <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{errore}</p>
        )}

        <div className="mt-8 border-t border-slate-200 pt-6">
          {!profile && (
            <Link href={`/login?next=/appunti/${note.id}`} className="btn-primary">
              Accedi per acquistare
            </Link>
          )}

          {profile && canDownload && (
            <form action={downloadNote} className="flex items-center gap-3">
              <input type="hidden" name="note_id" value={note.id} />
              <input type="hidden" name="back" value={`/appunti/${note.id}`} />
              <button type="submit" className="btn-primary">
                Scarica gli appunti
              </button>
              <span className="text-sm text-slate-500">
                {isOwner ? "Sei il venditore di questi appunti." : "Già acquistato."}
              </span>
            </form>
          )}

          {profile && !canDownload && profile.role === "buyer" && (
            <form action={purchaseNote}>
              <input type="hidden" name="note_id" value={note.id} />
              <button type="submit" className="btn-primary">
                Acquista per {formatPrice(note.price_cents)}
              </button>
              <p className="mt-2 text-xs text-slate-500">
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
      </div>
    </div>
  );
}
