import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { fetchComPrazo, PRAZO_POR_CONSULTA_MS } from "./prazo";

// Server-only Supabase client using the service role key. Bypasses RLS — use
// ONLY in trusted server routes (e.g. the Stripe webhook). Never expose to the
// browser. Returns null when env vars aren't set.
let cached: SupabaseClient | null | undefined;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  cached = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return cached;
}

// O mesmo cliente, com prazo em cada pedido (21/10/2026). Separado de
// propósito: webhook de pagamento e gravação de evento não podem desistir no
// meio por causa de um teto pensado para o retrato. Ver lib/prazo.ts.
let comPrazo: SupabaseClient | null | undefined;

export function getSupabaseAdminComPrazo(): SupabaseClient | null {
  if (comPrazo !== undefined) return comPrazo;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  comPrazo = url && key
    ? createClient(url, key, { auth: { persistSession: false }, global: { fetch: fetchComPrazo(PRAZO_POR_CONSULTA_MS) } })
    : null;
  return comPrazo;
}
