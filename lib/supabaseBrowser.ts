"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Browser Supabase client for auth + per-user sync. Persists the session in the
// browser and picks up the OAuth callback in the URL. Returns null when the
// public env vars aren't set (auth simply stays disabled → guest-only).
let client: SupabaseClient | null | undefined;

export function getBrowserSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  client = url && key
    ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
    : null;
  return client;
}
