"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Acquisto di un set di appunti.
 *
 * NOTA: qui il pagamento è simulato — l'ordine viene registrato direttamente.
 * Per andare in produzione basta sostituire l'insert con la creazione di una
 * sessione di checkout (es. Stripe) e scrivere la riga in `purchases` dal
 * webhook di pagamento confermato.
 */
export async function purchaseNote(formData: FormData) {
  const noteId = String(formData.get("note_id") ?? "");
  if (!noteId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/appunti/${noteId}`);

  const { error } = await supabase
    .from("purchases")
    .insert({ note_id: noteId, buyer_id: user.id, amount_cents: 0 });

  if (error) {
    // 23505 = unique_violation: l'appunto è già stato acquistato.
    if (error.code !== "23505") {
      redirect(`/appunti/${noteId}?errore=${encodeURIComponent(error.message)}`);
    }
  }

  revalidatePath("/dashboard/acquisti");
  redirect("/dashboard/acquisti?acquistato=1");
}

/**
 * Genera un link di download temporaneo. Le policy sullo storage lasciano
 * passare solo proprietario, acquirente o admin: se l'utente non ha diritto,
 * Supabase rifiuta la firma.
 */
export async function downloadNote(formData: FormData) {
  const noteId = String(formData.get("note_id") ?? "");
  const back = String(formData.get("back") ?? "/dashboard/acquisti");
  if (!noteId) redirect(back);

  const supabase = await createClient();
  const { data: note } = await supabase
    .from("notes")
    .select("file_path")
    .eq("id", noteId)
    .maybeSingle();

  if (!note) redirect(`${back}?errore=Appunto+non+trovato`);

  const { data, error } = await supabase.storage
    .from("notes")
    .createSignedUrl(note.file_path, 60, { download: true });

  if (error || !data) {
    redirect(`${back}?errore=${encodeURIComponent(error?.message ?? "Download non autorizzato")}`);
  }

  redirect(data.signedUrl);
}
