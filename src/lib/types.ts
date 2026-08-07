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

export type Note = {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  university: string | null;
  course: string | null;
  pages: number | null;
  price_cents: number;
  file_path: string;
  status: NoteStatus;
  reject_reason: string | null;
  created_at: string;
};

export type NoteWithSeller = Note & {
  seller: Pick<Profile, "id" | "full_name" | "university"> | null;
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

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}
