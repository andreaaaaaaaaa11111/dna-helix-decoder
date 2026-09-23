import UploadForm from "@/app/dashboard/venditore/nuovo/upload-form";

export const metadata = { title: "Demo caricamento — AppuntiUni" };

export default function DemoUpload() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Carica nuovi appunti</h1>
      <p className="mt-1 text-sm text-slate-600">
        È il modulo vero dell&apos;app: puoi compilarlo e provare le scorciatoie di prezzo. La
        pubblicazione, però, richiede un account venditore e il database collegato.
      </p>

      <div className="mt-6">
        <UploadForm defaultUniversity="Università di Bologna" />
      </div>
    </div>
  );
}
