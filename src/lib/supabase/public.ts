import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/config";

/**
 * Anonymous server client for public catalog reads.
 * Does not touch cookies, so store routes can use ISR/static rendering.
 * Never use this for authenticated or admin operations.
 */
export function createSupabasePublicClient() {
  const { url, anonKey } = getSupabaseEnv();

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
