// O que vale tentar de novo, e o que não vale. Puro.
//
// POR QUE EXISTE (14/09/2026). O Diretor achou o funil PERDENDO EVENTO: seis
// `comecou_onboarding` de seis pessoas diferentes recusados entre 12 e 14/09
// com "Gateway Timeout" e "Bad Gateway". A requisição chegava ao nosso
// servidor, o insert falhava na ponte até o banco, e o cliente é
// fire-and-forget: evento não gravado não volta. No mesmo período o
// /api/dados levava 504 em parte das consultas. É a mesma ponte (a API da
// Supabase) tropeçando, e nenhuma das duas rotas tentava de novo.
//
// A LINHA QUE IMPORTA é entre erro PASSAGEIRO e erro DEFINITIVO:
//
//   passageiro  → a ponte engasgou (502, 503, 504, fila de conexão cheia,
//                 conexão caída). A mesma chamada, um instante depois, passa.
//   definitivo  → o banco entendeu e RECUSOU (chave repetida, restrição de
//                 evento desconhecido, campo inválido). Tentar de novo é
//                 repetir o mesmo erro três vezes e atrasar a resposta.
//
// Confundir os dois nas duas direções custa: tentar de novo um definitivo é
// desperdício, e desistir de um passageiro é o dado perdido que o Diretor
// encontrou. Por isso a lista de passageiros é FECHADA, e o padrão é não
// tentar de novo.
//
// Conferido por `npm run conferir:funil`.

export type RespostaDoBanco = {
  error?: { message?: string; code?: string } | null;
  status?: number;
};

/** Códigos HTTP em que a ponte engasgou, não o banco recusou. */
const HTTP_PASSAGEIRO = new Set([502, 503, 504]);

/** Códigos do PostgREST e do Postgres que são aperto, não recusa. */
const CODIGO_PASSAGEIRO = new Set([
  "PGRST003", // fila de conexão cheia ("Timed out acquiring connection from connection pool")
  "57014", // statement_timeout: a consulta passou do teto sob carga
  "08006", // conexão caiu no meio
  "53300", // conexões demais
]);

/**
 * Frases das camadas que ficam ANTES do Postgres (gateway, rede, undici).
 * Fechada de propósito: mensagem de recusa do banco nunca cai aqui.
 */
const FRASE_PASSAGEIRA = /\b(gateway timeout|bad gateway|service unavailable|upstream|fetch failed|socket hang up|econnreset|etimedout|timed out acquiring|connection pool|network error)\b/i;

/** O erro é da ponte (vale tentar de novo) ou é recusa do banco (não vale)? */
export function transitorio(r: RespostaDoBanco | null | undefined): boolean {
  if (!r || !r.error) return false;
  if (typeof r.status === "number" && HTTP_PASSAGEIRO.has(r.status)) return true;
  if (r.error.code && CODIGO_PASSAGEIRO.has(r.error.code)) return true;
  return FRASE_PASSAGEIRA.test(r.error.message ?? "");
}

export type Tentativas = {
  /** Quantas vezes no total, a primeira incluída. */
  vezes?: number;
  /** Pausa da segunda tentativa em diante; dobra a cada uma. */
  pausaMs?: number;
  /** Injetável para a conferência não esperar de verdade. */
  dormir?: (ms: number) => Promise<void>;
};

const DORMIR = (ms: number) => new Promise<void>((ok) => setTimeout(ok, ms));

/**
 * Roda de novo enquanto o erro for passageiro, até o teto de tentativas.
 *
 * Recebe uma FÁBRICA, não uma promessa: promessa já começou e não dá para
 * repetir. Devolve a última resposta, com erro e tudo, para quem chamou
 * decidir o que registrar.
 */
export async function comTentativas<T extends RespostaDoBanco>(
  fabrica: () => PromiseLike<T>,
  o: Tentativas = {},
): Promise<T> {
  const vezes = Math.max(1, o.vezes ?? 3);
  const pausaMs = o.pausaMs ?? 200;
  const dormir = o.dormir ?? DORMIR;
  let r = await fabrica();
  for (let i = 2; i <= vezes && transitorio(r); i++) {
    await dormir(pausaMs * Math.pow(2, i - 2));
    r = await fabrica();
  }
  return r;
}
