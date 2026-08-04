"use client";

import { getBrowserSupabase } from "@/lib/supabaseBrowser";

// Registro de engajamento por conteúdo (fire-and-forget, nunca bloqueia a UI).
// Vai para public.content_events; leitura só pelo painel (RLS sem SELECT).
export type ContentEvent = "open" | "complete" | "uncomplete" | "save" | "unsave" | "pin" | "unpin";

// Dedup de "open" na sessão: reabrir a mesma aula no mesmo pageview não conta.
const openedThisSession = new Set<string>();

// Orçamento real informado pelo usuário (sintoma + região + valor) —
// alimenta a calibração dos fatores regionais de preço.
export function trackPriceReport(o: { symptomId: string; uf?: string | null; city?: string | null; shop?: string | null; totalBrl: number }): void {
  try {
    if (!(o.totalBrl > 0)) return;
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => {
      void supabase
        .from("price_reports")
        .insert({
          user_id: data.session?.user?.id ?? null,
          symptom_id: o.symptomId,
          uf: o.uf?.trim().toUpperCase() || null,
          city: o.city?.trim() || null,
          shop: o.shop?.trim() || null,
          total_brl: Math.round(o.totalBrl),
        })
        .then(() => undefined);
    });
  } catch {
    // métricas nunca podem quebrar o app
  }
}

export function trackContent(lessonId: string, event: ContentEvent, source?: string): void {
  try {
    if (event === "open") {
      if (openedThisSession.has(lessonId)) return;
      openedThisSession.add(lessonId);
    }
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => {
      const userId = data.session?.user?.id ?? null;
      void supabase
        .from("content_events")
        .insert({ user_id: userId, lesson_id: lessonId, event, source: source ?? null })
        .then(() => undefined);
    });
  } catch {
    // métricas nunca podem quebrar o app
  }
}
