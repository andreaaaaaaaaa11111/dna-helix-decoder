import Link from "next/link";

const SCREENS = [
  { href: "/demo/catalogo", title: "Catalogo", body: "Ricerca, filtri per ateneo, tipo e prezzo, ordinamento." },
  { href: "/demo/acquirente", title: "Dashboard acquirente", body: "Libreria degli acquisti, totale speso, download." },
  { href: "/demo/venditore", title: "Dashboard venditore", body: "Annunci, stato, vendite per annuncio e incasso." },
  { href: "/demo/caricamento", title: "Caricamento appunti", body: "File, dettagli e prezzo in tre passaggi." },
  { href: "/demo/admin", title: "Dashboard admin", body: "Statistiche e moderazione degli annunci." },
  { href: "/demo/utenti", title: "Gestione utenti", body: "Elenco degli iscritti e cambio ruolo." },
];

export const metadata = { title: "Demo — AppuntiUni" };

export default function DemoIndex() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Guarda com&apos;è fatto il sito</h1>
      <p className="mt-2 max-w-prose text-slate-600">
        Ogni scheda apre una schermata reale dell&apos;applicazione, riempita con appunti,
        vendite e utenti di esempio.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SCREENS.map((screen) => (
          <Link
            key={screen.href}
            href={screen.href}
            className="card p-6 transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
          >
            <p className="font-semibold text-slate-900">{screen.title}</p>
            <p className="mt-1.5 text-sm text-slate-600">{screen.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
