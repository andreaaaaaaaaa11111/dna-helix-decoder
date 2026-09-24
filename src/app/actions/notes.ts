"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { NOTE_TYPES, type NoteStatus, type NoteType } from "@/lib/types";

export type NoteFormState = { error?: string; message?: string };

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB
const MAX_PREVIEW_BYTES = 4 * 1024 * 1024; // 4 MB
const ALLOWED_TYPES = ["application/pdf", "application/zip", "image/png", "image/jpeg"];
const ALLOWED_PREVIEW_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_PRICE_EUR = 300;

/** "12,50" o "12.50" → 1250 centesimi. null se il valore non è accettabile. */
function parsePrice(raw: string): number | null {
  const normalized = raw.replace(/\s|€/g, "").replace(",", ".");
  if (normalized === "") return 0;
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0 || value > MAX_PRICE_EUR) return null;
  return Math.round(value * 100);
}

function storagePath(userId: string, file: File) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
  return `${userId}/${crypto.randomUUID()}-${safeName}`;
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
  const professor = String(formData.get("professor") ?? "").trim();
  const academicYear = String(formData.get("academic_year") ?? "").trim();
  const language = String(formData.get("language") ?? "Italiano").trim() || "Italiano";
  const noteTypeRaw = String(formData.get("note_type") ?? "appunti");
  const pagesRaw = String(formData.get("pages") ?? "").trim();
  const priceCents = parsePrice(String(formData.get("price") ?? "0"));
  const file = formData.get("file");
  const preview = formData.get("preview");

  if (title.length < 3) return { error: "Il titolo deve avere almeno 3 caratteri." };
  if (title.length > 140) return { error: "Il titolo non può superare i 140 caratteri." };
  if (!course) return { error: "Indica il corso o la materia: è il dato più cercato." };
  if (!NOTE_TYPES.includes(noteTypeRaw as NoteType)) {
    return { error: "Tipo di materiale non valido." };
  }
  if (priceCents === null) {
    return { error: `Prezzo non valido: inserisci un importo tra 0 e ${MAX_PRICE_EUR} €.` };
  }
  const pages = pagesRaw ? Number(pagesRaw) : null;
  if (pages !== null && (!Number.isInteger(pages) || pages <= 0 || pages > 5000)) {
    return { error: "Il numero di pagine non è valido." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Carica il file degli appunti (PDF, ZIP o immagine)." };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { error: "Il file supera i 20 MB. Comprimilo o dividilo in più parti." };
  }
  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    return { error: "Formato non supportato: usa PDF, ZIP, PNG o JPG." };
  }

  const hasPreview = preview instanceof File && preview.size > 0;
  if (hasPreview) {
    if (preview.size > MAX_PREVIEW_BYTES) {
      return { error: "La copertina supera i 4 MB." };
    }
    if (preview.type && !ALLOWED_PREVIEW_TYPES.includes(preview.type)) {
      return { error: "La copertina deve essere un'immagine PNG, JPG o WEBP." };
    }
  }

  const path = storagePath(user.id, file);
  const { error: uploadError } = await supabase.storage
    .from("notes")
    .upload(path, file, { contentType: file.type || "application/octet-stream" });

  if (uploadError) {
    return { error: `Caricamento fallito: ${uploadError.message}` };
  }

  let previewPath: string | null = null;
  if (hasPreview) {
    const target = storagePath(user.id, preview);
    const { error: previewError } = await supabase.storage
      .from("note-previews")
      .upload(target, preview, { contentType: preview.type || "image/jpeg" });
    // La copertina è facoltativa: se fallisce, l'annuncio si pubblica lo stesso.
    if (!previewError) previewPath = target;
  }

  const { error: insertError } = await supabase.from("notes").insert({
    seller_id: user.id,
    title,
    description: description || null,
    university: university || null,
    course,
    professor: professor || null,
    academic_year: academicYear || null,
    note_type: noteTypeRaw,
    language,
    pages,
    price_cents: priceCents,
    file_path: path,
    file_size: file.size,
    file_mime: file.type || null,
    preview_path: previewPath,
  });

  if (insertError) {
    // Rollback dei file per non lasciare orfani nello storage.
    await supabase.storage.from("notes").remove([path]);
    if (previewPath) await supabase.storage.from("note-previews").remove([previewPath]);
    return { error: `Salvataggio fallito: ${insertError.message}` };
  }

  revalidatePath("/dashboard/venditore");
  revalidatePath("/appunti");
  return {
    message:
      "Appunti caricati. Saranno visibili nel catalogo dopo l'approvazione di un amministratore.",
  };
}

/** Il venditore aggiorna prezzo e dettagli di un annuncio già pubblicato. */
export async function updateNote(
  _prev: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const id = String(formData.get("note_id") ?? "");
  if (!id) return { error: "Annuncio non trovato." };

  const title = String(formData.get("title") ?? "").trim();
  const course = String(formData.get("course") ?? "").trim();
  const priceCents = parsePrice(String(formData.get("price") ?? "0"));
  const pagesRaw = String(formData.get("pages") ?? "").trim();
  const noteTypeRaw = String(formData.get("note_type") ?? "appunti");

  if (title.length < 3) return { error: "Il titolo deve avere almeno 3 caratteri." };
  if (!course) return { error: "Indica il corso o la materia." };
  if (priceCents === null) {
    return { error: `Prezzo non valido: inserisci un importo tra 0 e ${MAX_PRICE_EUR} €.` };
  }
  if (!NOTE_TYPES.includes(noteTypeRaw as NoteType)) {
    return { error: "Tipo di materiale non valido." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("notes")
    .update({
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      university: String(formData.get("university") ?? "").trim() || null,
      course,
      professor: String(formData.get("professor") ?? "").trim() || null,
      academic_year: String(formData.get("academic_year") ?? "").trim() || null,
      language: String(formData.get("language") ?? "Italiano").trim() || "Italiano",
      note_type: noteTypeRaw,
      pages: pagesRaw ? Number(pagesRaw) : null,
      price_cents: priceCents,
    })
    .eq("id", id);

  if (error) return { error: `Modifica non salvata: ${error.message}` };

  revalidatePath("/dashboard/venditore");
  revalidatePath(`/appunti/${id}`);
  revalidatePath("/appunti");
  return { message: "Modifiche salvate." };
}

/** Il venditore (o un admin) elimina un annuncio e i relativi file. */
export async function deleteNote(formData: FormData) {
  const id = String(formData.get("note_id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { data: note } = await supabase
    .from("notes")
    .select("id, file_path, preview_path")
    .eq("id", id)
    .maybeSingle();

  if (!note) return;

  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (!error) {
    await supabase.storage.from("notes").remove([note.file_path]);
    if (note.preview_path) {
      await supabase.storage.from("note-previews").remove([note.preview_path]);
    }
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
