export type UserRole = "buyer" | "seller" | "admin";
export type NoteStatus = "pending" | "approved" | "rejected";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  university: string | null;
  role: UserRole;
  created_at: string;
};

export const NOTE_TYPES = [
  "appunti",
  "riassunti",
  "esercizi",
  "slide",
  "formulario",
  "tesi",
] as const;

export type NoteType = (typeof NOTE_TYPES)[number];

export const NOTE_TYPE_LABEL: Record<NoteType, string> = {
  appunti: "Appunti di lezione",
  riassunti: "Riassunti",
  esercizi: "Esercizi svolti",
  slide: "Slide",
  formulario: "Formulario",
  tesi: "Tesi",
};

export type Note = {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  university: string | null;
  course: string | null;
  professor: string | null;
  academic_year: string | null;
  note_type: NoteType;
  language: string | null;
  pages: number | null;
  price_cents: number;
  file_path: string;
  file_size: number | null;
  file_mime: string | null;
  preview_path: string | null;
  status: NoteStatus;
  reject_reason: string | null;
  created_at: string;
};

export type NoteWithSeller = Note & {
  seller: Pick<Profile, "id" | "full_name" | "university"> | null;
  sales_count: number;
  preview_url: string | null;
};

export type Purchase = {
  id: string;
  note_id: string;
  buyer_id: string;
  amount_cents: number;
  created_at: string;
};

export const ROLE_LABEL: Record<UserRole, string> = {
  buyer: "Studente acquirente",
  seller: "Venditore",
  admin: "Amministratore",
};

export const STATUS_LABEL: Record<NoteStatus, string> = {
  pending: "In revisione",
  approved: "Pubblicato",
  rejected: "Rifiutato",
};

export function formatPrice(cents: number) {
  if (cents === 0) return "Gratis";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

/** Dimensione file leggibile: 1,4 MB invece di 1468006. */
export function formatFileSize(bytes: number | null) {
  if (!bytes || bytes <= 0) return null;
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1).replace(".", ",")} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Estensione mostrata all'utente, ricavata dal tipo MIME o dal nome file. */
export function formatFileKind(mime: string | null, path?: string) {
  const byMime: Record<string, string> = {
    "application/pdf": "PDF",
    "application/zip": "ZIP",
    "image/png": "PNG",
    "image/jpeg": "JPG",
  };
  if (mime && byMime[mime]) return byMime[mime];
  const ext = path?.split(".").pop();
  return ext && ext.length <= 4 ? ext.toUpperCase() : "File";
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}
