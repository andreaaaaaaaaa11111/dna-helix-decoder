import Link from "next/link";

import { requireProfile } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile();

  const links =
    profile.role === "admin"
      ? [
          { href: "/dashboard/admin", label: "Panoramica" },
          { href: "/dashboard/admin/utenti", label: "Utenti" },
          { href: "/dashboard/acquisti", label: "I miei acquisti" },
        ]
      : profile.role === "seller"
        ? [
            { href: "/dashboard/venditore", label: "I miei appunti" },
            { href: "/dashboard/venditore/nuovo", label: "Carica appunti" },
            { href: "/dashboard/venditore/vendite", label: "Vendite" },
          ]
        : [
            { href: "/dashboard/acquisti", label: "I miei acquisti" },
            { href: "/appunti", label: "Cerca appunti" },
          ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-7">
        <p className="text-xs font-semibold tracking-[0.14em] text-brand-700 uppercase">
          {ROLE_LABEL[profile.role]}
        </p>
        <h1 className="mt-2 text-2xl font-bold">
          Ciao {profile.full_name?.split(" ")[0] ?? "studente"} 👋
        </h1>
      </div>

      <nav className="mb-9 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
