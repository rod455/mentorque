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
  | "cadastrou_carro"
  // A PRIMEIRA SESSÃO, medida em 01/09/2026. Entre "abriu o app" e
  // "cadastrou o carro" não havia evento nenhum: quem abria e ia embora
  // sumia sem deixar em que tela. Com anúncio pago no ar, a pergunta passou a
  // valer dinheiro, e ela tem dois consertos opostos: ninguém ACHA o
  // formulário, ou acha e DESISTE no meio.
  | "comecou_onboarding"
  | "terminou_onboarding"
  | "abriu_cadastro_de_carro"
  // Único evento técnico da lista: o desfecho da subida do SDK de atribuição
  // (lib/app/atribuicao.ts). Ele não mede comportamento de ninguém, mede se a
  // nossa própria medição está viva no aparelho.
  | "atribuicao";

// Dedup por sessão: reabrir a mesma tela no mesmo pageview não conta de novo.
const enviados = new Set<string>();

// Dedup por APARELHO, para os eventos que só fazem sentido uma vez na vida.
//
// `umaVez` guarda em memória e morre com a sessão, que é o certo para "viu o
// paywall nesta visita". Já "terminou o onboarding" acontece uma vez e ponto:
// contar de novo a cada abertura transformaria a etapa num número que só
// cresce, e a taxa da primeira sessão viraria ficção. Por isso estes gravam a
// marca no localStorage.
//
// Aparelho sem armazenamento cai de volta na dedup por sessão, e isso é
// aceitável: esses ids já não contam como gente (ver lib/app/anon.ts e a
// função public.identidade no banco). O piso de verdade é o índice único
// `funil_eventos_primeira_sessao_unica`, no banco.
const MARCA = "mq-funil-";
function jaFoiNesteAparelho(evento: string): boolean {
  try {
    return window.localStorage.getItem(MARCA + evento) === "1";
  } catch {
    return false;
  }
}
function marcaNesteAparelho(evento: string): void {
  try {
    window.localStorage.setItem(MARCA + evento, "1");
  } catch {
    /* sem armazenamento: a dedup de sessão já segurou o repetido do dia */
  }
}

// A chave de dedup é `evento:origem` por padrão, e isso é PROPOSITAL onde a
// origem faz parte do que está sendo contado (abriu_trilha conta uma vez por
// trilha, cadastrou_carro uma vez por tipo de cadastro). Onde a origem é só o
// contexto de ENTRADA da mesma tela, contar por origem infla a etapa: quem
// chega ao paywall pelo onboarding e volta a ele pela Biela vira duas pessoas
// na leitura do funil. Esses casos passam `chave` e deduplicam por evento.

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

export function funil(
  evento: EventoFunil,
  o?: { userId?: string | null; origem?: string; umaVez?: boolean; chave?: string; umaVezPorAparelho?: boolean },
): void {
  try {
    if (typeof window === "undefined") return;
    if (o?.umaVezPorAparelho) {
      if (jaFoiNesteAparelho(evento)) return;
      // A marca vai ANTES do envio, de propósito. Marcar só depois de
      // confirmar exigiria esperar a resposta, e este caminho é
      // fire-and-forget por decisão: métrica não pode segurar a tela. O risco
      // aceito é perder um evento quando a rede cai na hora exata; o risco
      // recusado é contar a mesma pessoa toda semana e achar que a etapa
      // cresceu.
      marcaNesteAparelho(evento);
    }
    if (o?.umaVez) {
      const k = o?.chave ?? `${evento}:${o?.origem ?? ""}`;
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
