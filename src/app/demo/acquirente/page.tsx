import BuyerLibrary from "@/components/views/buyer-library";
import { DEMO_PURCHASES } from "@/lib/demo-data";

export const metadata = { title: "Demo acquirente — AppuntiUni" };

export default function DemoBuyer() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.14em] text-brand-700 uppercase">
          Studente acquirente
        </p>
        <h1 className="mt-2 text-2xl font-bold">Ciao Mario 👋</h1>
      </div>
      <BuyerLibrary purchases={DEMO_PURCHASES} readOnly />
    </div>
  );
}
