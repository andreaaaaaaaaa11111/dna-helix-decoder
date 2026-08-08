"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { createNote, type NoteFormState } from "@/app/actions/notes";
import { NOTE_TYPES, NOTE_TYPE_LABEL, formatFileSize, formatPrice } from "@/lib/types";

const PRICE_SHORTCUTS = ["0", "2.50", "5", "9.90", "14.90"];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full sm:w-auto" disabled={pending}>
      {pending ? "Caricamento in corso…" : "Pubblica appunti"}
    </button>
  );
}

function Section({
  step,
  title,
  hint,
  children,
}: {
  step: number;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-6 sm:p-7">
      <header className="mb-5 flex gap-3.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
          {step}
        </span>
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-sm text-slate-500">{hint}</p>
        </div>
      </header>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

export default function UploadForm({ defaultUniversity }: { defaultUniversity: string }) {
  const [state, formAction] = useActionState<NoteFormState, FormData>(createNote, {});
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<File | null>(null);
  const [price, setPrice] = useState("0");

  const priceCents = (() => {
    const value = Number(price.replace(",", "."));
    return Number.isFinite(value) && value >= 0 ? Math.round(value * 100) : null;
  })();

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* 1 · file --------------------------------------------------------- */}
      <Section
        step={1}
        title="Il file"
        hint="Resta privato: lo riceve solo chi acquista, con un link temporaneo."
      >
        <label
          htmlFor="file"
          className="flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-9 text-center transition hover:border-brand-400 hover:bg-brand-50"
        >
          {file ? (
            <>
              <span className="font-semibold text-slate-900">{file.name}</span>
              <span className="text-sm text-slate-500">
                {formatFileSize(file.size)} · tocca per cambiare file
              </span>
            </>
          ) : (
            <>
              <span className="font-semibold text-slate-900">Scegli il file da vendere</span>
              <span className="text-sm text-slate-500">PDF, ZIP, PNG o JPG — fino a 20 MB</span>
            </>
          )}
        </label>
        <input
          id="file"
          name="file"
          type="file"
          required
          accept=".pdf,.zip,.png,.jpg,.jpeg"
          className="sr-only"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        <div>
          <span className="label">
            Copertina <span className="font-normal normal-case">(facoltativa)</span>
          </span>
          <label
            htmlFor="preview"
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 transition hover:border-brand-400 hover:bg-brand-50"
          >
            <span className="badge bg-slate-100 text-slate-600">Immagine</span>
            <span className="min-w-0 flex-1 truncate text-sm text-slate-600">
              {preview
                ? `${preview.name} · ${formatFileSize(preview.size)}`
                : "Scegli un'immagine della prima pagina"}
            </span>
            <span className="text-sm font-semibold text-brand-700">
              {preview ? "Cambia" : "Sfoglia"}
            </span>
          </label>
          <input
            id="preview"
            name="preview"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(e) => setPreview(e.target.files?.[0] ?? null)}
          />
          <p className="mt-1.5 text-xs text-slate-500">
            Gli annunci con copertina vengono aperti molto più spesso. PNG, JPG o WEBP, max 4 MB.
          </p>
        </div>
      </Section>

      {/* 2 · dettagli ----------------------------------------------------- */}
      <Section
        step={2}
        title="I dettagli"
        hint="Sono i campi su cui gli studenti cercano e decidono se comprare."
      >
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
            placeholder="Analisi Matematica I — teoria ed esercizi svolti"
          />
        </div>

        <div>
          <label className="label" htmlFor="note_type">
            Tipo di materiale
          </label>
          <select id="note_type" name="note_type" defaultValue="appunti" className="input">
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
              className="input"
              placeholder="Analisi Matematica I"
            />
          </div>
          <div>
            <label className="label" htmlFor="university">
              Università
            </label>
            <input
              id="university"
              name="university"
              defaultValue={defaultUniversity}
              className="input"
              placeholder="Politecnico di Milano"
            />
          </div>
          <div>
            <label className="label" htmlFor="professor">
              Docente
            </label>
            <input id="professor" name="professor" className="input" placeholder="Prof. Bianchi" />
          </div>
          <div>
            <label className="label" htmlFor="academic_year">
              Anno accademico
            </label>
            <input
              id="academic_year"
              name="academic_year"
              className="input"
              placeholder="2025/2026"
            />
          </div>
          <div>
            <label className="label" htmlFor="pages">
              Numero di pagine
            </label>
            <input id="pages" name="pages" type="number" min={1} max={5000} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="language">
              Lingua
            </label>
            <input id="language" name="language" defaultValue="Italiano" className="input" />
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
            className="input"
            placeholder="Cosa contengono, se includono esercizi d'esame svolti, se sono scritti a mano o al computer, com'è andato l'esame…"
          />
        </div>
      </Section>

      {/* 3 · prezzo ------------------------------------------------------- */}
      <Section
        step={3}
        title="Il prezzo"
        hint="Puoi cambiarlo quando vuoi dalla dashboard, anche dopo la pubblicazione."
      >
        <div>
          <label className="label" htmlFor="price">
            Prezzo di vendita
          </label>
          <div className="flex items-center gap-2">
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
                  ? "Lo pubblichi gratuitamente"
                  : `Gli studenti vedranno ${formatPrice(priceCents)}`}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {PRICE_SHORTCUTS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setPrice(value)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  price === value
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {value === "0" ? "Gratis" : formatPrice(Math.round(Number(value) * 100))}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}
      {state.message && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">{state.message}</p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton />
        <p className="text-sm text-slate-500">
          Un amministratore controlla l&apos;annuncio prima della pubblicazione.
        </p>
      </div>
    </form>
  );
}
