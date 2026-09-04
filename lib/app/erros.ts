"use client";

// Coletor de erros do app (fire-and-forget, nunca bloqueia nem quebra a UI).
//
// A Sentinela vigia o Mentorque por fora; isto aqui é a visão de DENTRO: um
// erro de JavaScript ou uma promessa rejeitada no aparelho de um usuário vira
// uma linha em public.app_erros, que o agente de QA lê para achar tela
// quebrada antes de virar avaliação de uma estrela.
//
// Sem fornecedor externo de propósito: o app é quase todo WebView, então o
// window.onerror enxerga o que importa. Crash NATIVO (raro, na casca do
// Capacitor) não passa por aqui — esse aparece nos Android vitals e no App
// Store Connect. Se um dia precisarmos de mais, a troca por Sentry é isolada
// neste arquivo.
import { apiPost } from "./apiBase";
import { APP_VERSION } from "./content";
import { isNativeApp, nativePlatform } from "./wrapper";
import { fechamentoAnterior } from "./ultimoPasso";

// Tetos que protegem o servidor de um aparelho em loop de erro: no máximo 10
// envios por sessão e nunca a mesma mensagem duas vezes.
const MAX_POR_SESSAO = 10;
let enviados = 0;
const vistos = new Set<string>();
let ligado = false;

function reportar(tipo: "erro" | "promessa" | "fechou", mensagem: string, stack?: string, origem?: string): void {
  try {
    if (!mensagem || enviados >= MAX_POR_SESSAO) return;
    const chave = mensagem.slice(0, 120);
    if (vistos.has(chave)) return;
    vistos.add(chave);
    enviados += 1;
    void apiPost("/api/erros", {
      tipo,
      mensagem: mensagem.slice(0, 500),
      stack: (stack ?? "").slice(0, 2000),
      origem: (origem ?? (typeof location !== "undefined" ? location.pathname : "")).slice(0, 200),
      plataforma: isNativeApp() ? nativePlatform() ?? "nativo" : "web",
      versao: APP_VERSION,
    }).catch(() => undefined);
  } catch { /* o coletor jamais pode causar o que coleta */ }
}

/**
 * A sessão anterior morreu em uso? Então relata, com o passo em que estava.
 *
 * Este é o único relato que nasce de uma AUSÊNCIA: ninguém viu o erro, porque
 * quando o app fecha o JavaScript vai junto. A migalha de lib/app/ultimoPasso.ts
 * é o que sobra, e é ela que diz em cima de qual passo o app desapareceu.
 *
 * Chamar na abertura, ANTES do primeiro `passo()` desta sessão, senão a
 * migalha nova apaga a antiga e o fechamento some.
 */
export function relatarFechamentoAnterior(): void {
  try {
    const f = fechamentoAnterior();
    if (!f) return;
    // A mensagem fica ESTÁVEL (sem os segundos) de propósito: é ela que agrupa
    // no "top" de /api/erros, e um número no meio faria cada fechamento virar
    // uma linha única, escondendo justamente a repetição que prova o defeito.
    // O tempo vai no campo do rastro.
    reportar("fechou", `app fechou sozinho em: ${f.nome}`, `${f.segundos}s depois do passo`, f.nome);
  } catch {
    /* o coletor jamais pode causar o que coleta */
  }
}

/**
 * A tela quebrou e o AppBoundary segurou.
 *
 * ESTE É O ERRO QUE MAIS IMPORTA E O ÚNICO QUE NÃO CHEGAVA AQUI. Erro dentro
 * do render é capturado pelo boundary, e boundary que captura NÃO deixa o erro
 * chegar no `window.onerror`: para o navegador não houve erro nenhum. Então a
 * pessoa via "Algo travou por aqui" e a `app_erros` não ganhava uma linha.
 *
 * Descoberto em 04/09/2026 investigando por que a web tinha 16 onboardings
 * começados e nenhum terminado. A resposta "não há erro registrado" tinha sido
 * usada como prova de que o problema era de produto, e ela não provava nada:
 * ninguém estava olhando.
 */
export function relatarQuebraDeTela(erro: unknown, componente?: string): void {
  const e = erro as { message?: string; stack?: string } | undefined;
  reportar("erro", `tela quebrou: ${e?.message ?? String(erro ?? "sem motivo")}`, e?.stack, componente);
}

/** Liga os ouvintes globais de erro. Chamar uma vez, na montagem do app. */
export function vigiarErros(): void {
  if (ligado || typeof window === "undefined") return;
  ligado = true;
  window.addEventListener("error", (e) => {
    const err = (e as ErrorEvent).error as { stack?: string } | undefined;
    const onde = (e as ErrorEvent).filename ? `${(e as ErrorEvent).filename}:${(e as ErrorEvent).lineno}` : undefined;
    reportar("erro", (e as ErrorEvent).message ?? "erro sem mensagem", err?.stack, onde);
  });
  window.addEventListener("unhandledrejection", (e) => {
    const r = (e as PromiseRejectionEvent).reason as { message?: string; stack?: string } | undefined;
    reportar("promessa", r?.message ?? String((e as PromiseRejectionEvent).reason ?? "rejeição sem motivo"), r?.stack);
  });
}
