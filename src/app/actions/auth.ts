"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  MISSING_CONFIG_MESSAGE,
  isSupabaseConfigured,
  siteUrl,
} from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

export type AuthState = { error?: string; message?: string };

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  // Solo path interni: evita open redirect.
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!isSupabaseConfigured()) return { error: MISSING_CONFIG_MESSAGE };
  if (!email || !password) {
    return { error: "Inserisci email e password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      error:
        error.message === "Invalid login credentials"
          ? "Email o password non corretti."
          : error.message,
    };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const university = String(formData.get("university") ?? "").trim();
  const roleRaw = String(formData.get("role") ?? "");

  if (!isSupabaseConfigured()) return { error: MISSING_CONFIG_MESSAGE };
  if (!email || !password || !fullName) {
    return { error: "Nome, email e password sono obbligatori." };
  }
  if (password.length < 8) {
    return { error: "La password deve avere almeno 8 caratteri." };
  }
  // Il ruolo admin non è selezionabile in registrazione (lo impone anche il
  // trigger SQL handle_new_user).
  if (roleRaw !== "buyer" && roleRaw !== "seller") {
    return { error: "Scegli se vuoi comprare o vendere appunti." };
  }
  const role: UserRole = roleRaw;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, university, role },
      emailRedirectTo: `${siteUrl()}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.session) {
    return {
      message:
        "Registrazione completata. Controlla la tua email e conferma l'indirizzo per accedere.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
