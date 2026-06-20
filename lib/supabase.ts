import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Returns a Supabase client if the env vars are configured, otherwise null so
 * callers can degrade gracefully. The publishable (anon) key is safe on the
 * client/server; row-level security on the `waitlist` table governs access.
 */
let cached: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  cached = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return cached;
}

export const isSupabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
