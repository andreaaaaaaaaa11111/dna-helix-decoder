import NoteCard from "@/components/note-card";
import { getCatalog } from "@/lib/notes";

export const metadata = { title: "Catalogo appunti — AppuntiUni" };

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; ateneo?: string; gratis?: string }>;
}) {
  const params = await searchParams;
  const { notes, error } = await getCatalog({
    q: params.q,
    university: params.ateneo,
    free: params.gratis === "1",
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Catalogo appunti</h1>
      <p className="mt-1 text-sm text-slate-600">
        Tutti gli appunti approvati dalla redazione.
      </p>

      <form className="card mt-6 grid gap-3 p-4 sm:grid-cols-[1fr_1fr_auto_auto]">
        <input
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Cerca per materia, titolo, corso…"
          className="input"
        />
        <input
          name="ateneo"
          defaultValue={params.ateneo ?? ""}
          placeholder="Università"
          className="input"
        />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="gratis"
            value="1"
            defaultChecked={params.gratis === "1"}
            className="h-4 w-4 rounded border-slate-300"
          />
          Solo gratis
        </label>
        <button type="submit" className="btn-primary">
          Filtra
        </button>
      </form>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>

      {!error && notes.length === 0 && (
        <p className="card mt-8 p-8 text-center text-sm text-slate-600">
          Nessun risultato per i filtri selezionati.
        </p>
      )}
    </div>
  );
}
