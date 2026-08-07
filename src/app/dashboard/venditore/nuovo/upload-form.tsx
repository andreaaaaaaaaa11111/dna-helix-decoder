"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createNote, type NoteFormState } from "@/app/actions/notes";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Caricamento…" : "Pubblica appunti"}
    </button>
  );
}

export default function UploadForm({ defaultUniversity }: { defaultUniversity: string }) {
  const [state, formAction] = useActionState<NoteFormState, FormData>(createNote, {});

  return (
    <form action={formAction} className="card flex flex-col gap-4 p-6">
      <div>
        <label className="label" htmlFor="title">
          Titolo
        </label>
        <input
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={140}
          className="input"
          placeholder="Appunti completi di Analisi Matematica I"
        />
      </div>

      <div>
        <label className="label" htmlFor="description">
          Descrizione
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="input"
          placeholder="Cosa contengono, anno accademico, professore, se includono esercizi svolti…"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="university">
            Università
          </label>
          <input
            id="university"
            name="university"
            defaultValue={defaultUniversity}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="course">
            Corso / materia
          </label>
          <input id="course" name="course" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="pages">
            Numero di pagine
          </label>
          <input id="pages" name="pages" type="number" min={1} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="price">
            Prezzo in € (0 = gratis)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            max={1000}
            step="0.5"
            defaultValue={0}
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="file">
          File degli appunti
        </label>
        <input
          id="file"
          name="file"
          type="file"
          required
          accept=".pdf,.zip,.png,.jpg,.jpeg"
          className="input py-1.5"
        />
        <p className="mt-1 text-xs text-slate-500">PDF, ZIP, PNG o JPG — massimo 20 MB.</p>
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state.message && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          {state.message}
        </p>
      )}

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
