import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Note } from "@/lib/types";

import EditForm from "./edit-form";

export const metadata = { title: "Modifica annuncio — AppuntiUni" };

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireRole(["seller", "admin"], `/dashboard/venditore/${id}/modifica`);

  const supabase = await createClient();
  const { data } = await supabase.from("notes").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  const note = data as Note;
  if (note.seller_id !== profile.id && profile.role !== "admin") notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/venditore" className="text-sm text-slate-500 hover:underline">
        ← Torna ai miei appunti
      </Link>
      <h2 className="mt-3 text-xl font-semibold">Modifica annuncio</h2>
      <p className="mt-1 text-sm text-slate-600">
        Puoi cambiare prezzo e dettagli quando vuoi. Il file caricato resta invariato: per
        sostituirlo, elimina l&apos;annuncio e ricaricalo.
      </p>

      <div className="mt-6">
        <EditForm note={note} />
      </div>
    </div>
  );
}
