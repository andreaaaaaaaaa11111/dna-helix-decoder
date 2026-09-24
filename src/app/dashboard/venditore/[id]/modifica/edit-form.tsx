"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { updateNote, type NoteFormState } from "@/app/actions/notes";
import { NOTE_TYPES, NOTE_TYPE_LABEL, formatPrice, type Note } from "@/lib/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Salvataggio…" : "Salva modifiche"}
    </button>
  );
}

export default function EditForm({ note }: { note: Note }) {
  const [state, formAction] = useActionState<NoteFormState, FormData>(updateNote, {});
  const [price, setPrice] = useState((note.price_cents / 100).toFixed(2).replace(".", ","));

  const priceCents = (() => {
    const value = Number(price.replace(",", "."));
    return Number.isFinite(value) && value >= 0 ? Math.round(value * 100) : null;
  })();

  return (
    <form action={formAction} className="card flex flex-col gap-5 p-7">
      <input type="hidden" name="note_id" value={note.id} />

      <div>
        <label className="label" htmlFor="price">
          Prezzo
        </label>
        <div className="flex items-center gap-3">
          <div className="relative w-40">
            <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400">
              €
            </span>
            <input
              id="price"
              name="price"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input pl-8 text-lg font-semibold"
            />
          </div>
          <p className="text-sm text-slate-500">
            {priceCents === null
              ? "Importo non valido"
              : priceCents === 0
                ? "Verrà offerto gratis"
                : `In catalogo come ${formatPrice(priceCents)}`}
          </p>
        </div>
      </div>

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
          defaultValue={note.title}
          className="input"
        />
      </div>

      <div>
        <label className="label" htmlFor="note_type">
          Tipo di materiale
        </label>
        <select
          id="note_type"
          name="note_type"
          defaultValue={note.note_type ?? "appunti"}
          className="input"
        >
          {NOTE_TYPES.map((type) => (
            <option key={type} value={type}>
              {NOTE_TYPE_LABEL[type]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="course">
            Corso o materia
          </label>
          <input
            id="course"
            name="course"
            required
            defaultValue={note.course ?? ""}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="university">
            Università
          </label>
          <input
            id="university"
            name="university"
            defaultValue={note.university ?? ""}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="professor">
            Docente
          </label>
          <input
            id="professor"
            name="professor"
            defaultValue={note.professor ?? ""}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="academic_year">
            Anno accademico
          </label>
          <input
            id="academic_year"
            name="academic_year"
            defaultValue={note.academic_year ?? ""}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="pages">
            Pagine
          </label>
          <input
            id="pages"
            name="pages"
            type="number"
            min={1}
            max={5000}
            defaultValue={note.pages ?? ""}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="language">
            Lingua
          </label>
          <input
            id="language"
            name="language"
            defaultValue={note.language ?? "Italiano"}
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="description">
          Descrizione
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={note.description ?? ""}
          className="input"
        />
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}
      {state.message && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">{state.message}</p>
      )}

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
