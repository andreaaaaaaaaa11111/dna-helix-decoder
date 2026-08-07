import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/types";

/** Utente + profilo, oppure null se non autenticato. */
export async function getSessionProfile(): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    return (data as Profile | null) ?? null;
  } catch {
    // Configurazione mancante o Supabase irraggiungibile: l'utente viene
    // considerato non autenticato e le pagine pubbliche restano navigabili.
    return null;
  }
}

/** Come sopra, ma reindirizza al login se manca la sessione. */
export async function requireProfile(nextPath = "/dashboard"): Promise<Profile> {
  const profile = await getSessionProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return profile;
}

/** Richiede uno dei ruoli indicati, altrimenti rimanda alla dashboard giusta. */
export async function requireRole(
  roles: UserRole[],
  nextPath = "/dashboard",
): Promise<Profile> {
  const profile = await requireProfile(nextPath);
  if (!roles.includes(profile.role)) redirect(dashboardPath(profile.role));
  return profile;
}

export function dashboardPath(role: UserRole) {
  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "seller":
      return "/dashboard/venditore";
    default:
      return "/dashboard/acquisti";
  }
}
