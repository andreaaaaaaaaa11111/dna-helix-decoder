"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { signUp, type AuthState } from "@/app/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Creazione account…" : "Crea account"}
    </button>
  );
}

const ROLES = [
  {
    value: "buyer",
    title: "Voglio comprare appunti",
    description:
      "Sfoglia il catalogo, acquista gli appunti che ti servono e scaricali dalla tua dashboard.",
  },
  {
    value: "seller",
    title: "Voglio vendere i miei appunti",
    description:
      "Carica i tuoi file, imposta il prezzo e segui le vendite dalla dashboard venditore.",
  },
] as const;

export default function RegisterForm() {
  const [state, formAction] = useActionState<AuthState, FormData>(signUp, {});
  const [role, setRole] = useState<string>("buyer");

  return (
    <form action={formAction} className="card flex flex-col gap-5 p-6">
      <fieldset>
        <legend className="label">Tipo di account</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {ROLES.map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer rounded-xl border p-4 transition ${
                role === option.value
                  ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200"
                  : "border-slate-300 hover:border-slate-400"
              }`}
            >
              <input
                type="radio"
                name="role"
                value={option.value}
                checked={role === option.value}
                onChange={(e) => setRole(e.target.value)}
                className="sr-only"
              />
              <span className="block text-sm font-semibold text-slate-900">
                {option.title}
              </span>
              <span className="mt-1 block text-xs text-slate-600">
                {option.description}
              </span>
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Gli account amministratore non sono aperti alla registrazione: vengono
          assegnati da un admin esistente.
        </p>
      </fieldset>

      <div>
        <label className="label" htmlFor="full_name">
          Nome e cognome
        </label>
        <input id="full_name" name="full_name" required className="input" />
      </div>

      <div>
        <label className="label" htmlFor="university">
          Università <span className="font-normal text-slate-400">(facoltativo)</span>
        </label>
        <input
          id="university"
          name="university"
          className="input"
          placeholder="Es. Università di Bologna"
        />
      </div>

      <div>
        <label className="label" htmlFor="email">
          Email
        </label>
        <input id="email" name="email" type="email" required className="input" />
      </div>

      <div>
        <label className="label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
          className="input"
        />
        <p className="mt-1 text-xs text-slate-500">Almeno 8 caratteri.</p>
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state.message && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          {state.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
