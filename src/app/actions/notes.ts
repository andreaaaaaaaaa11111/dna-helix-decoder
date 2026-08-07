"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { NoteStatus } from "@/lib/types";

export type NoteFormState = { error?: string; message?: string };

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB
const ALLOWED_TYPES = ["application/pdf", "application/zip", "image/png", "image/jpeg"];

function parsePrice(raw: string): number | null {
  const normalized = raw.replace(",", ".").trim();
  if (normalized === "") return 0;
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0 || value > 1000) return null;
  return Math.round(value * 100);
}

/** Un venditore pubblica un nuovo set di appunti (file caricato su Storage). */
export async function createNote(
  _prev: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessione scaduta, effettua di nuovo l'accesso." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || (profile.role !== "seller" && profile.role !== "admin")) {
    return { error: "Solo gli account venditore possono caricare appunti." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const university = String(formData.get("university") ?? "").trim();
  const course = String(formData.get("course") ?? "").trim();
  const pagesRaw = String(formData.get("pages") ?? "").trim();
  const priceCents = parsePrice(String(formData.get("price") ?? "0"));
  const file = formData.get("file");

  if (title.length < 3) return { error: "Il titolo deve avere almeno 3 caratteri." };
  if (priceCents === null) return { error: "Prezzo non valido (0 – 1000 €)." };
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Carica il file degli appunti (PDF, ZIP o immagine)." };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { error: "Il file supera i 20 MB." };
  }
  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    return { error: "Formato non supportato: usa PDF, ZIP, PNG o JPG." };
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
  const path = `${user.id}/${crypto.randomUUID()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("notes")
    .upload(path, file, { contentType: file.type || "application/octet-stream" });

  if (uploadError) {
    return { error: `Caricamento fallito: ${uploadError.message}` };
  }

  const { error: insertError } = await supabase.from("notes").insert({
    seller_id: user.id,
    title,
    description: description || null,
    university: university || null,
    course: course || null,
    pages: pagesRaw ? Number(pagesRaw) : null,
    price_cents: priceCents,
    file_path: path,
  });

  if (insertError) {
    // Rollback del file per non lasciare orfani nello storage.
    await supabase.storage.from("notes").remove([path]);
    return { error: `Salvataggio fallito: ${insertError.message}` };
  }

  revalidatePath("/dashboard/venditore");
  revalidatePath("/appunti");
  return {
    message:
      "Appunti caricati. Saranno visibili nel catalogo dopo l'approvazione di un amministratore.",
  };
}

/** Il venditore (o un admin) elimina un annuncio e il relativo file. */
export async function deleteNote(formData: FormData) {
  const id = String(formData.get("note_id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { data: note } = await supabase
    .from("notes")
    .select("id, file_path")
    .eq("id", id)
    .maybeSingle();

  if (!note) return;

  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (!error) {
    await supabase.storage.from("notes").remove([note.file_path]);
  }

  revalidatePath("/dashboard/venditore");
  revalidatePath("/dashboard/admin");
  revalidatePath("/appunti");
}

/** Moderazione: solo gli admin passano le policy RLS su note altrui. */
export async function setNoteStatus(formData: FormData) {
  const id = String(formData.get("note_id") ?? "");
  const status = String(formData.get("status") ?? "") as NoteStatus;
  if (!id || !["pending", "approved", "rejected"].includes(status)) return;

  const supabase = await createClient();
  await supabase
    .from("notes")
    .update({
      status,
      reject_reason:
        status === "rejected"
          ? String(formData.get("reject_reason") ?? "").trim() || null
          : null,
    })
    .eq("id", id);

  revalidatePath("/dashboard/admin");
  revalidatePath("/appunti");
}
