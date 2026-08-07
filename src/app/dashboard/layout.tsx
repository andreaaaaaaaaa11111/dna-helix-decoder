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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          {ROLE_LABEL[profile.role]}
        </p>
        <h1 className="text-2xl font-bold">
          Ciao {profile.full_name?.split(" ")[0] ?? "studente"} 👋
        </h1>
      </div>

      <nav className="mb-8 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
