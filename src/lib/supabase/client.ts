import { createBrowserClient } from "@supabase/ssr";

import { supabaseAnonKey, supabaseUrl } from "./config";

/** Client Supabase per i Client Components. */
export function createClient() {
  return createBrowserClient(supabaseUrl(), supabaseAnonKey());
}
