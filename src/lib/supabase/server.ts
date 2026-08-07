import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import { supabaseAnonKey, supabaseUrl } from "./config";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Client Supabase per Server Components, Server Actions e Route Handlers.
 * Legge/scrive la sessione nei cookie della richiesta corrente.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Chiamato da un Server Component: il refresh dei cookie è gestito
          // dal middleware, qui possiamo ignorare l'errore.
        }
      },
    },
  });
}
