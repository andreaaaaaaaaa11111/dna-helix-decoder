import SellerNotes from "@/components/views/seller-notes";
import { DEMO_NOTES, DEMO_SALES_BY_NOTE } from "@/lib/demo-data";

export const metadata = { title: "Demo venditore — AppuntiUni" };

export default function DemoSeller() {
  const salesCount = [...DEMO_SALES_BY_NOTE.values()].reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.14em] text-brand-700 uppercase">
          Venditore
        </p>
        <h1 className="mt-2 text-2xl font-bold">Ciao Giulia 👋</h1>
      </div>
      <SellerNotes
        notes={DEMO_NOTES}
        salesByNote={DEMO_SALES_BY_NOTE}
        salesCount={salesCount}
        revenue={41_150}
        readOnly
      />
    </div>
  );
}
