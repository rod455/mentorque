"use client";

// Eventos de funil (fire-and-forget, nunca bloqueia a UI).
//
// Registra os passos de COMPORTAMENTO: abriu o app, criou conta, viu o
// paywall, iniciou uma compra. Os passos financeiros (assinou, cancelou…)
// nascem nos webhooks, não aqui — a rota recusa se o cliente tentar.
//
// anon_id: identidade anônima do aparelho, criada antes de qualquer login,
// para o funil ligar "abriu → cadastrou" na mesma pessoa. Não identifica
// ninguém fora do app.
import { apiPost } from "./apiBase";
import { APP_VERSION } from "./content";
import { isNativeApp, nativePlatform } from "./wrapper";

export type EventoFunil = "abriu_app" | "cadastro" | "viu_paywall" | "iniciou_checkout";

const CHAVE_ANON = "mq-anon-id";
function anonId(): string {
  try {
    let v = window.localStorage.getItem(CHAVE_ANON);
    if (!v) {
      v = crypto.randomUUID();
      window.localStorage.setItem(CHAVE_ANON, v);
    }
    return v;
  } catch {
    return "sem-armazenamento";
  }
}

// Dedup por sessão: reabrir a mesma tela no mesmo pageview não conta de novo.
const enviados = new Set<string>();

export function funil(evento: EventoFunil, o?: { userId?: string | null; origem?: string; umaVez?: boolean }): void {
  try {
    if (typeof window === "undefined") return;
    if (o?.umaVez) {
      const k = `${evento}:${o?.origem ?? ""}`;
      if (enviados.has(k)) return;
      enviados.add(k);
    }
    void apiPost("/api/funil", {
      evento,
      anonId: anonId(),
      userId: o?.userId ?? null,
      plataforma: isNativeApp() ? nativePlatform() ?? "nativo" : "web",
      versao: APP_VERSION,
      origem: o?.origem ?? null,
    }).catch(() => undefined);
  } catch {
    // métricas nunca podem quebrar o app
  }
}
