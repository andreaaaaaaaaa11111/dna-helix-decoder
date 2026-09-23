import { requireProfile } from "@/lib/auth";
import BuyerLibrary, { type PurchaseRow } from "@/components/views/buyer-library";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "I miei acquisti — AppuntiUni" };

export default async function BuyerDashboard({
  searchParams,
}: {
  searchParams: Promise<{ acquistato?: string; errore?: string }>;
}) {
  const params = await searchParams;
  const profile = await requireProfile("/dashboard/acquisti");
  const supabase = await createClient();

  const { data } = await supabase
    .from("purchases")
    .select("*, note:notes(*)")
    .eq("buyer_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      {params.acquistato && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
          Acquisto completato: trovi il file qui sotto.
        </p>
      )}
      {params.errore && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{params.errore}</p>
      )}

      <BuyerLibrary purchases={(data ?? []) as PurchaseRow[]} />
    </div>
  );
}
