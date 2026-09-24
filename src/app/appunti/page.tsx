import Link from "next/link";

import NoteCard from "@/components/note-card";
import { SORT_OPTIONS, getCatalog, isSortKey } from "@/lib/notes";
import { NOTE_TYPES, NOTE_TYPE_LABEL } from "@/lib/types";

export const metadata = { title: "Catalogo appunti — AppuntiUni" };

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    ateneo?: string;
    tipo?: string;
    max?: string;
    gratis?: string;
    ordina?: string;
  }>;
}) {
  const params = await searchParams;
  const { notes, error } = await getCatalog({
    q: params.q,
    university: params.ateneo,
    type: params.tipo,
    maxPrice: params.max,
    free: params.gratis === "1",
    sort: isSortKey(params.ordina) ? params.ordina : "recenti",
  });

  const hasFilters = Boolean(
    params.q || params.ateneo || params.tipo || params.max || params.gratis,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Catalogo appunti</h1>
      <p className="mt-2 text-slate-600">
        Tutti gli appunti approvati dalla redazione, con corso, ateneo e dettagli del file.
      </p>

      <form className="card mt-8 flex flex-col gap-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="q">
              Cerca
            </label>
            <input
              id="q"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Materia, titolo, corso o docente"
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="ateneo">
              Università
            </label>
            <input
              id="ateneo"
              name="ateneo"
              defaultValue={params.ateneo ?? ""}
              placeholder="Tutte"
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="tipo">
              Tipo di materiale
            </label>
            <select id="tipo" name="tipo" defaultValue={params.tipo ?? ""} className="input">
              <option value="">Tutti</option>
              {NOTE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {NOTE_TYPE_LABEL[type]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="max">
              Prezzo massimo (€)
            </label>
            <input
              id="max"
              name="max"
              type="number"
              min={0}
              step="0.5"
              defaultValue={params.max ?? ""}
              placeholder="Nessun limite"
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="ordina">
              Ordina per
            </label>
            <select
              id="ordina"
              name="ordina"
              defaultValue={params.ordina ?? "recenti"}
              className="input"
            >
              {Object.entries(SORT_OPTIONS).map(([key, option]) => (
                <option key={key} value={key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="gratis"
              value="1"
              defaultChecked={params.gratis === "1"}
              className="size-4 rounded border-slate-300"
            />
            Solo appunti gratuiti
          </label>
          <div className="ml-auto flex gap-2">
            {hasFilters && (
              <Link href="/appunti" className="btn-secondary">
                Azzera
              </Link>
            )}
            <button type="submit" className="btn-primary">
              Applica filtri
            </button>
          </div>
        </div>
      </form>

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {!error && (
        <p className="mt-8 text-sm text-slate-500">
          {notes.length === 0
            ? "Nessun risultato"
            : `${notes.length} ${notes.length === 1 ? "risultato" : "risultati"}`}
          {hasFilters ? " per i filtri selezionati" : ""}
        </p>
      )}

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>

      {!error && notes.length === 0 && (
        <div className="card mt-5 p-10 text-center">
          <p className="font-semibold text-slate-900">Nessun appunto trovato</p>
          <p className="mt-2 text-sm text-slate-600">
            {hasFilters
              ? "Prova ad allargare la ricerca: togli il prezzo massimo o cambia ateneo."
              : "Il catalogo è ancora vuoto. Se sei un venditore, puoi essere il primo a pubblicare."}
          </p>
        </div>
      )}
    </div>
  );
}
