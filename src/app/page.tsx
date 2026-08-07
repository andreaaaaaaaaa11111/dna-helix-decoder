import Link from "next/link";

import NoteCard from "@/components/note-card";
import { getSessionProfile, dashboardPath } from "@/lib/auth";
import { getCatalog } from "@/lib/notes";

export default async function HomePage() {
  const [profile, catalog] = await Promise.all([
    getSessionProfile(),
    getCatalog({ limit: 6 }),
  ]);

  return (
    <div>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Gli appunti giusti, dagli studenti che hanno già dato l&apos;esame.
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Compra appunti verificati o vendi i tuoi. Scegli il tipo di account in
              registrazione e usa la dashboard dedicata per acquistare, caricare e
              scaricare i file.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/appunti" className="btn-primary">
                Sfoglia il catalogo
              </Link>
              {profile ? (
                <Link href={dashboardPath(profile.role)} className="btn-secondary">
                  Vai alla dashboard
                </Link>
              ) : (
                <Link href="/registrazione" className="btn-secondary">
                  Registrati gratis
                </Link>
              )}
            </div>
          </div>

          <ul className="grid gap-4">
            {[
              {
                title: "1. Scegli il ruolo",
                body: "In fase di registrazione decidi se vuoi comprare appunti o venderli.",
              },
              {
                title: "2. Carica o acquista",
                body: "I venditori caricano PDF e impostano il prezzo, gli acquirenti comprano in un clic.",
              },
              {
                title: "3. Scarica quando vuoi",
                body: "Ogni download passa da un link firmato e temporaneo: i file restano privati.",
              },
            ].map((step) => (
              <li key={step.title} className="card p-5">
                <p className="font-semibold text-slate-900">{step.title}</p>
                <p className="mt-1 text-sm text-slate-600">{step.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Ultimi appunti pubblicati</h2>
          <Link href="/appunti" className="text-sm font-semibold text-brand-700 hover:underline">
            Vedi tutti →
          </Link>
        </div>

        {catalog.notes.length === 0 ? (
          <p className="card p-8 text-center text-sm text-slate-600">
            Nessun appunto pubblicato al momento. Se sei un venditore, sei il primo:{" "}
            <Link href="/registrazione" className="font-semibold text-brand-700 hover:underline">
              carica i tuoi appunti
            </Link>
            .
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
