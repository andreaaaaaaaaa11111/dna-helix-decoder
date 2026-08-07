import Link from "next/link";

import RegisterForm from "./register-form";

export const metadata = { title: "Registrati — AppuntiUni" };

export default function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-14">
      <div>
        <h1 className="text-2xl font-bold">Crea il tuo account</h1>
        <p className="mt-1 text-sm text-slate-600">
          Scegli subito come vuoi usare AppuntiUni: potrai comprare appunti oppure
          caricarli e venderli.
        </p>
      </div>

      <RegisterForm />

      <p className="text-sm text-slate-600">
        Hai già un account?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Accedi
        </Link>
      </p>
    </div>
  );
}
