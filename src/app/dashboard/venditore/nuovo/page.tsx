import { requireRole } from "@/lib/auth";

import UploadForm from "./upload-form";

export const metadata = { title: "Carica appunti — AppuntiUni" };

export default async function NewNotePage() {
  const profile = await requireRole(["seller", "admin"], "/dashboard/venditore/nuovo");

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-semibold">Carica nuovi appunti</h2>
      <p className="mt-1 text-sm text-slate-600">
        Il file resta privato: viene consegnato solo a chi acquista, tramite link
        temporaneo. Un amministratore approva l&apos;annuncio prima della pubblicazione.
      </p>

      <div className="mt-6">
        <UploadForm defaultUniversity={profile.university ?? ""} />
      </div>
    </div>
  );
}
