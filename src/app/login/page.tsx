import Link from "next/link";

import LoginForm from "./login-form";

export const metadata = { title: "Accedi — AppuntiUni" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; registrato?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-14">
      <div>
        <h1 className="text-2xl font-bold">Accedi</h1>
        <p className="mt-1 text-sm text-slate-600">
          Entra nel tuo account per gestire acquisti e appunti in vendita.
        </p>
      </div>

      {params.registrato && (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
          Account creato. Conferma l&apos;email e poi accedi.
        </p>
      )}

      <LoginForm next={params.next ?? "/dashboard"} />

      <p className="text-sm text-slate-600">
        Non hai un account?{" "}
        <Link href="/registrazione" className="font-semibold text-brand-700 hover:underline">
          Registrati
        </Link>
      </p>
    </div>
  );
}
