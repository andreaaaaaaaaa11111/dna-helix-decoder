import AdminOverview from "@/components/views/admin-overview";
import { DEMO_NOTES } from "@/lib/demo-data";
import { formatPrice } from "@/lib/types";

export const metadata = { title: "Demo admin — AppuntiUni" };

export default function DemoAdmin() {
  const stats = [
    { label: "Utenti registrati", value: 248 },
    { label: "Venditori", value: 61 },
    { label: "Appunti totali", value: DEMO_NOTES.length },
    { label: "In attesa di revisione", value: DEMO_NOTES.filter((n) => n.status === "pending").length },
    { label: "Acquisti", value: 512 },
    { label: "Volume vendite", value: formatPrice(418_000) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.14em] text-brand-700 uppercase">
          Amministratore
        </p>
        <h1 className="mt-2 text-2xl font-bold">Ciao Andrea 👋</h1>
      </div>
      <AdminOverview stats={stats} notes={DEMO_NOTES} readOnly />
    </div>
  );
}
