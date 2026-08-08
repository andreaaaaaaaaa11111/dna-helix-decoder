function required(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(
      `Variabile d'ambiente mancante: ${name}. Copia .env.example in .env.local (o impostala su Vercel) prima di avviare l'app.`,
    );
  }
  return value;
}

// Funzioni (non costanti) così l'errore scatta a runtime sulla richiesta e non
// durante la build di Vercel, dove le variabili potrebbero non essere ancora
// state configurate.
export function supabaseUrl() {
  return required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function supabaseAnonKey() {
  return required("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * true se le variabili Supabase sono presenti. Serve a far partire il sito
 * anche senza configurazione (le pagine pubbliche restano navigabili) invece
 * di far fallire ogni richiesta.
 */
export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export const MISSING_CONFIG_MESSAGE =
  "Supabase non è configurato: crea il file .env.local con NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY (vedi README).";

/** Origine pubblica del sito, usata per i redirect di conferma email. */
export function siteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  return "http://localhost:3000";
}
