import NoteCard from "@/components/note-card";
import { SORT_OPTIONS } from "@/lib/notes";
import { DEMO_CATALOG } from "@/lib/demo-data";
import { NOTE_TYPES, NOTE_TYPE_LABEL } from "@/lib/types";

export const metadata = { title: "Demo catalogo — AppuntiUni" };

export default function DemoCatalog() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Catalogo appunti</h1>
      <p className="mt-2 text-slate-600">
        Tutti gli appunti approvati dalla redazione, con corso, ateneo e dettagli del file.
      </p>

      <div className="card mt-8 flex flex-col gap-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <span className="label">Cerca</span>
            <p className="input text-slate-400">Materia, titolo, corso o docente</p>
          </div>
          <div>
            <span className="label">Università</span>
            <p className="input text-slate-400">Tutte</p>
          </div>
          <div>
            <span className="label">Tipo di materiale</span>
            <select disabled className="input" defaultValue="">
              <option value="">Tutti</option>
              {NOTE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {NOTE_TYPE_LABEL[type]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className="label">Prezzo massimo (€)</span>
            <p className="input text-slate-400">Nessun limite</p>
          </div>
          <div>
            <span className="label">Ordina per</span>
            <select disabled className="input" defaultValue="recenti">
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
            <input type="checkbox" disabled className="size-4 rounded border-slate-300" />
            Solo appunti gratuiti
          </label>
          <button type="button" className="btn-primary ml-auto" disabled>
            Applica filtri
          </button>
        </div>
      </div>

      <p className="mt-8 text-sm text-slate-500">{DEMO_CATALOG.length} risultati</p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {DEMO_CATALOG.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}
