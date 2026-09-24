import AdminOverview from "@/components/views/admin-overview";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, type Note } from "@/lib/types";

export const metadata = { title: "Amministrazione — AppuntiUni" };

export default async function AdminDashboard() {
  await requireRole(["admin"], "/dashboard/admin");
  const supabase = await createClient();

  const [notesRes, usersRes, purchasesRes] = await Promise.all([
    supabase.from("notes").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, role"),
    supabase.from("purchases").select("amount_cents"),
  ]);

  const notes = (notesRes.data ?? []) as Note[];
  const users = usersRes.data ?? [];
  const purchases = purchasesRes.data ?? [];
  const gmv = purchases.reduce((sum, p) => sum + (p.amount_cents ?? 0), 0);

  const stats = [
    { label: "Utenti registrati", value: users.length },
    { label: "Venditori", value: users.filter((u) => u.role === "seller").length },
    { label: "Appunti totali", value: notes.length },
    { label: "In attesa di revisione", value: notes.filter((n) => n.status === "pending").length },
    { label: "Acquisti", value: purchases.length },
    { label: "Volume vendite", value: formatPrice(gmv) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminOverview stats={stats} notes={notes} />
    </div>
  );
}
