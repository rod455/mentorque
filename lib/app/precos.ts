"use client";

import { apiPost } from "./apiBase";
import { APP_VERSION } from "./content";
import { observacaoDePreco } from "./faixaDePreco";
import { isNativeApp, nativePlatform } from "./wrapper";

export { FAIXAS_NACIONAIS, faixaDaRegiao, posicaoNaFaixa, type FaixaDaRegiao, type PosicaoNaFaixa } from "./faixaDePreco";

// "Quanto costuma custar na minha região?", na hora em que a pessoa registra
// um serviço com valor.
//
// POR QUE (10/09/2026). Registrar um serviço é a segunda ação de valor do app
// e a única que carrega dinheiro. Até aqui ela terminava numa lista. Agora
// termina numa resposta: a faixa que esse serviço costuma custar na região
// da pessoa, e onde o valor dela caiu. É o momento em que o app devolve algo
// pelo que a pessoa acabou de dar.
//
// AS FAIXAS SÃO REFERÊNCIA, NÃO DADO (ver faixaDePreco.ts), e a tela diz
// isso. O dado real nasce do próprio registro: cada valor pago vai, sem nome
// nem placa, para a tabela precos_observados (supabase/precos_observados.sql,
// rota /api/precos), e quando um par (serviço, estado) tiver observações
// suficientes a faixa de referência dá lugar à mediana observada. Hoje
// (10/09) são 4 contas com serviço: isso leva meses, e por isso a comparação
// nasce como referência em vez de esperar.

// ── a comparação viaja do formulário para a tela do histórico ─────────────
//
// O serviço é salvo numa tela e a lista aparece na seguinte (root history),
// então a comparação viaja numa marca de módulo, como o convite de conta e
// o de aviso. Vale para UMA montagem.
export type Comparacao = { tipo: string; valor: number };
let pendente: Comparacao | null = null;
export function guardarComparacao(c: Comparacao): void {
  pendente = c;
}
export function consumirComparacao(): Comparacao | null {
  const r = pendente;
  pendente = null;
  return r;
}

/**
 * Manda o valor observado para a tabela, sem ninguém dentro (fire-and-forget).
 * Nunca bloqueia nem quebra a tela: se falhar, só a faixa de referência
 * demora mais para virar dado real.
 */
export function observarPreco(o: Parameters<typeof observacaoDePreco>[0]): void {
  try {
    const corpo = observacaoDePreco(o, { plataforma: isNativeApp() ? nativePlatform() ?? "nativo" : "web", versao: APP_VERSION });
    if (!corpo) return;
    void apiPost("/api/precos", corpo).catch(() => undefined);
  } catch { /* nunca por causa disto */ }
}
