import type { Note, NoteWithSeller, Profile, Purchase } from "@/lib/types";

/**
 * Dati finti per la modalità dimostrativa (`/demo`): servono a far vedere
 * com'è fatta l'app senza collegare Supabase. Non vengono mai usati dalle
 * pagine reali.
 */

const SELLER = { id: "demo-giulia", full_name: "Giulia Rinaldi", university: "Politecnico di Milano" };

function note(fields: Partial<Note> & Pick<Note, "id" | "title">): Note {
  return {
    seller_id: SELLER.id,
    description: null,
    university: "Politecnico di Milano",
    course: null,
    professor: null,
    academic_year: "2025/2026",
    note_type: "appunti",
    language: "Italiano",
    pages: null,
    price_cents: 0,
    file_path: "demo/appunti.pdf",
    file_size: 2_400_000,
    file_mime: "application/pdf",
    preview_path: null,
    status: "approved",
    reject_reason: null,
    created_at: "2026-09-08T10:00:00.000Z",
    ...fields,
  };
}

export const DEMO_NOTES: Note[] = [
  note({
    id: "demo-1",
    title: "Analisi Matematica I — teoria ed esercizi svolti",
    description:
      "Appunti completi del corso, riscritti al computer e integrati con il libro di testo.\nIncludono tutti i temi d'esame degli ultimi tre anni risolti passo passo.",
    course: "Analisi Matematica I",
    professor: "Prof.ssa Bianchi",
    pages: 148,
    price_cents: 1200,
    file_size: 4_250_000,
  }),
  note({
    id: "demo-2",
    title: "Diritto Privato — schemi riassuntivi",
    description: "Mappe concettuali per ripassare il manuale in una settimana.",
    note_type: "riassunti",
    course: "Diritto Privato",
    university: "Università di Bologna",
    professor: "Prof. Ferrari",
    pages: 62,
    price_cents: 850,
    file_size: 1_800_000,
  }),
  note({
    id: "demo-3",
    title: "Economia Aziendale — formulario d'esame",
    description: "Tutte le formule dell'esame in quattro pagine, pronte da stampare.",
    note_type: "formulario",
    course: "Economia Aziendale",
    pages: 4,
    price_cents: 0,
    file_size: 320_000,
  }),
  note({
    id: "demo-4",
    title: "Fisica II — relazioni di laboratorio",
    description: "Le sei relazioni complete consegnate durante il corso.",
    note_type: "esercizi",
    course: "Fisica II",
    professor: "Prof. Neri",
    pages: 88,
    price_cents: 900,
    status: "pending",
    file_size: 6_100_000,
  }),
  note({
    id: "demo-5",
    title: "Chimica Organica — appunti a mano",
    course: "Chimica Organica",
    pages: 54,
    price_cents: 500,
    status: "rejected",
    reject_reason: "Scansioni poco leggibili",
  }),
];

export const DEMO_CATALOG: NoteWithSeller[] = DEMO_NOTES.filter(
  (n) => n.status === "approved",
).map((n, i) => ({
  ...n,
  seller: SELLER,
  sales_count: [24, 7, 51][i] ?? 0,
  preview_url: null,
}));

export const DEMO_PURCHASES: (Purchase & { note: Note | null })[] = [
  {
    id: "p1",
    note_id: "demo-1",
    buyer_id: "demo-mario",
    amount_cents: 1200,
    created_at: "2026-09-14T09:30:00.000Z",
    note: DEMO_NOTES[0],
  },
  {
    id: "p2",
    note_id: "demo-2",
    buyer_id: "demo-mario",
    amount_cents: 850,
    created_at: "2026-09-02T16:10:00.000Z",
    note: DEMO_NOTES[1],
  },
  {
    id: "p3",
    note_id: "demo-3",
    buyer_id: "demo-mario",
    amount_cents: 0,
    created_at: "2026-08-19T11:05:00.000Z",
    note: DEMO_NOTES[2],
  },
];

export const DEMO_SALES_BY_NOTE = new Map<string, number>([
  ["demo-1", 24],
  ["demo-2", 7],
  ["demo-3", 51],
]);

export const DEMO_USERS: Profile[] = [
  {
    id: "demo-giulia",
    email: "giulia@studenti.it",
    full_name: "Giulia Rinaldi",
    university: "Politecnico di Milano",
    role: "seller",
    created_at: "2026-03-11T10:00:00.000Z",
  },
  {
    id: "demo-mario",
    email: "mario.rossi@studenti.it",
    full_name: "Mario Rossi",
    university: "Università di Bologna",
    role: "buyer",
    created_at: "2026-05-02T10:00:00.000Z",
  },
  {
    id: "demo-marco",
    email: "marco@studenti.it",
    full_name: "Marco Turrini",
    university: "Università di Bologna",
    role: "seller",
    created_at: "2026-06-21T10:00:00.000Z",
  },
  {
    id: "demo-admin",
    email: "admin@appuntiuni.it",
    full_name: "Amministratore",
    university: null,
    role: "admin",
    created_at: "2026-01-09T10:00:00.000Z",
  },
];
