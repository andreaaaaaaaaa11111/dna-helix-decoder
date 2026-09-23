import Link from "next/link";

import { downloadNote } from "@/app/actions/purchases";
import Stat from "@/components/stat";
import {
  NOTE_TYPE_LABEL,
  formatDate,
  formatFileKind,
  formatPrice,
  type Note,
  type Purchase,
} from "@/lib/types";

export type PurchaseRow = Purchase & { note: Note | null };

/**
 * Vista della dashboard acquirente. La pagina si occupa dei dati, questo
 * componente solo di come appaiono — così la stessa vista serve anche la
 * modalità dimostrativa, dove i pulsanti sono inattivi.
 */
export default function BuyerLibrary({
  purchases,
  readOnly = false,
}: {
  purchases: PurchaseRow[];
  readOnly?: boolean;
}) {
  const totalSpent = purchases.reduce((sum, p) => sum + p.amount_cents, 0);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <Stat label="Appunti acquistati" value={purchases.length} />
        <Stat label="Totale speso" value={formatPrice(totalSpent)} />
      </div>

      <section className="card divide-y divide-slate-200">
        <header className="px-5 py-4">
          <h2 className="font-semibold">Libreria</h2>
        </header>

        {purchases.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-600">
            Non hai ancora acquistato nulla.{" "}
            <Link href="/appunti" className="font-semibold text-brand-700 hover:underline">
              Sfoglia il catalogo
            </Link>
            .
          </p>
        ) : (
          purchases.map((purchase) => (
            <div key={purchase.id} className="flex flex-wrap items-center gap-4 px-5 py-5">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{purchase.note?.title ?? "Appunto rimosso"}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {[
                    purchase.note ? NOTE_TYPE_LABEL[purchase.note.note_type] : null,
                    purchase.note?.course,
                    purchase.note?.pages ? `${purchase.note.pages} pagine` : null,
                    purchase.note
                      ? formatFileKind(purchase.note.file_mime, purchase.note.file_path)
                      : null,
                    `acquistato il ${formatDate(purchase.created_at)}`,
                    formatPrice(purchase.amount_cents),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>

              {purchase.note &&
                (readOnly ? (
                  <button type="button" className="btn-secondary" disabled>
                    Scarica
                  </button>
                ) : (
                  <form action={downloadNote}>
                    <input type="hidden" name="note_id" value={purchase.note.id} />
                    <input type="hidden" name="back" value="/dashboard/acquisti" />
                    <button type="submit" className="btn-secondary">
                      Scarica
                    </button>
                  </form>
                ))}
            </div>
          ))
        )}
      </section>
    </>
  );
}
