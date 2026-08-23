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
import { anonId } from "./anon";
import { variantesAtivas } from "./experimentos";

export type EventoFunil =
  | "abriu_app"
  | "cadastro"
  | "viu_paywall"
  | "iniciou_checkout"
  | "abriu_trilha"
  | "cadastrou_carro";

// Dedup por sessão: reabrir a mesma tela no mesmo pageview não conta de novo.
const enviados = new Set<string>();

// A etiqueta de campanha que a LP (/landing) guardou no aparelho. É ela que
// liga anúncio a cadastro e a assinatura: sem UTM no evento, mídia paga vira
// chute. Só existe na web (a LP e o app web dividem a mesma origem); no app
// da loja a atribuição de instalação é outro capítulo.
function utmGuardada(): Record<string, string> | null {
  try {
    const bruto = window.localStorage.getItem("mq-utm");
    if (!bruto) return null;
    const u = JSON.parse(bruto) as Record<string, string>;
    return u && typeof u === "object" ? u : null;
  } catch {
    return null;
  }
}

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
      utm: utmGuardada(),
      // Os testes A/B que esta pessoa está vendo: é o carimbo que permite
      // ler conversão por variante (view experimentos_resultados).
      exp: variantesAtivas(),
    }).catch(() => undefined);
  } catch {
    // métricas nunca podem quebrar o app
  }
}
