import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./config";

const PROTECTED_PREFIXES = ["/dashboard"];

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Rinnova la sessione a ogni richiesta e protegge le rotte private.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Senza chiavi Supabase il sito resta navigabile in sola lettura: le pagine
  // private si proteggono comunque da sole (requireProfile → /login).
  if (!isSupabaseConfigured()) return response;

  const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Non inserire codice tra createServerClient e getUser(): serve a mantenere
  // la sessione allineata (vedi docs @supabase/ssr).
  let user = null;
  try {
    user = (await supabase.auth.getUser()).data.user;
  } catch {
    // Supabase irraggiungibile: trattiamo la richiesta come non autenticata
    // invece di far fallire tutte le pagine del sito.
    user = null;
  }

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && (pathname === "/login" || pathname === "/registrazione")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
