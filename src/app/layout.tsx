import type { Metadata } from "next";

import Navbar from "@/components/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "AppuntiUni — Compra e vendi appunti universitari",
  description:
    "Marketplace di appunti universitari: gli studenti caricano e vendono i propri appunti, gli altri li acquistano e li scaricano subito.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-500">
            AppuntiUni — progetto demo con Next.js, Supabase e Vercel.
          </div>
        </footer>
      </body>
    </html>
  );
}
