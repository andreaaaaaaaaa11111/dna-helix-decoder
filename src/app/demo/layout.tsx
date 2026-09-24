import Link from "next/link";

const TABS = [
  { href: "/demo", label: "Panoramica" },
  { href: "/demo/catalogo", label: "Catalogo" },
  { href: "/demo/acquirente", label: "Acquirente" },
  { href: "/demo/venditore", label: "Venditore" },
  { href: "/demo/caricamento", label: "Caricamento" },
  { href: "/demo/admin", label: "Admin" },
  { href: "/demo/utenti", label: "Utenti" },
];

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="card border-brand-200 bg-brand-50 p-5">
        <p className="font-semibold text-brand-900">Modalità dimostrativa</p>
        <p className="mt-1 text-sm text-brand-900/80">
          Queste pagine mostrano le schermate dell&apos;app con dati di esempio e pulsanti
          disattivati, senza bisogno di collegare un database. Per usare il sito davvero —
          registrazione, caricamento, acquisti — configura Supabase come spiegato nel README.
        </p>
      </div>

      <nav className="mt-6 mb-8 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
