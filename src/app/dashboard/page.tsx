import { redirect } from "next/navigation";

import { dashboardPath, requireProfile } from "@/lib/auth";

/** Smista ogni utente sulla dashboard del proprio ruolo. */
export default async function DashboardIndex() {
  const profile = await requireProfile();
  redirect(dashboardPath(profile.role));
}
