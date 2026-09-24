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
      <section className="paper-grid border-b border-slate-200">
        <div className="mx-auto grid max-w-6xl gap-14 px-4 py-20 md:grid-cols-[1.05fr_1fr] md:items-center md:gap-16 md:py-24">
          <div>
            <p className="mb-5 text-xs font-semibold tracking-[0.16em] text-brand-700 uppercase">
              Appunti universitari, da studente a studente
            </p>
            <h1 className="text-4xl font-bold sm:text-5xl">
              Gli appunti giusti, da chi{" "}
              <span className="marker">ha già dato l&apos;esame</span>.
            </h1>
            <p className="mt-6 max-w-prose text-lg text-slate-600">
              Compra appunti verificati o vendi i tuoi. Scegli il tipo di account in
              registrazione e usa la dashboard dedicata per acquistare, caricare e
              scaricare i file.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
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

          <ol className="grid gap-5">
            {[
              {
                title: "Scegli il ruolo",
                body: "In fase di registrazione decidi se vuoi comprare appunti o venderli.",
              },
              {
                title: "Carica o acquista",
                body: "I venditori caricano PDF e impostano il prezzo, gli acquirenti comprano in un clic.",
              },
              {
                title: "Scarica quando vuoi",
                body: "Ogni download passa da un link firmato e temporaneo: i file restano privati.",
              },
            ].map((step, index) => (
              <li key={step.title} className="card flex gap-4 p-6">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                  {index + 1}
                </span>
                <span>
                  <span className="block font-semibold text-slate-900">{step.title}</span>
                  <span className="mt-1.5 block text-sm text-slate-600">{step.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
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
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
