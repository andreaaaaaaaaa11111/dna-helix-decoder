"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

/**
 * Cambio ruolo di un utente. Passa solo se chi esegue è admin: il trigger SQL
 * `guard_role_change` annulla qualsiasi modifica al campo role fatta da altri.
 */
export async function updateUserRole(formData: FormData) {
  const userId = String(formData.get("user_id") ?? "");
  const role = String(formData.get("role") ?? "") as UserRole;

  if (!userId || !["buyer", "seller", "admin"].includes(role)) return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ role }).eq("id", userId);

  revalidatePath("/dashboard/admin");
}
