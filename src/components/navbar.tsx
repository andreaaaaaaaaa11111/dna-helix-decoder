import Link from "next/link";

import { dashboardPath, getSessionProfile } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/types";
import { signOut } from "@/app/actions/auth";

export default async function Navbar() {
  const profile = await getSessionProfile();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight text-brand-700">
          Appunti<span className="text-slate-900">Uni</span>
        </Link>

        <Link
          href="/appunti"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          Catalogo
        </Link>

        <div className="ml-auto flex items-center gap-3">
          {profile ? (
            <>
              <span className="hidden text-xs text-slate-500 sm:inline">
                {profile.full_name || profile.email} · {ROLE_LABEL[profile.role]}
              </span>
              <Link href={dashboardPath(profile.role)} className="btn-secondary">
                Dashboard
              </Link>
              <form action={signOut}>
                <button type="submit" className="btn-secondary">
                  Esci
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary">
                Accedi
              </Link>
              <Link href="/registrazione" className="btn-primary">
                Registrati
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
