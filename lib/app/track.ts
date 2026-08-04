"use client";

import { getBrowserSupabase } from "@/lib/supabaseBrowser";

// Registro de engajamento por conteúdo (fire-and-forget, nunca bloqueia a UI).
// Vai para public.content_events; leitura só pelo painel (RLS sem SELECT).
export type ContentEvent = "open" | "complete" | "uncomplete" | "save" | "unsave";

// Dedup de "open" na sessão: reabrir a mesma aula no mesmo pageview não conta.
const openedThisSession = new Set<string>();

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
