// Prazo por consulta e orçamento da rota inteira, para o /api/dados (21/10/2026).
//
// POR QUE EXISTE. Em 21/10, às 7h30, o Vigia esperou 30 s pelo /api/dados e
// desistiu: "o vigia está cego". Nesses 30 s nenhuma consulta da rota chegou à
// borda da Supabase (logs de borda, 10:25 a 10:35 UTC), e às 6h a mesma rota
// tinha respondido em 6,3 s. Uma das duas causas possíveis, a conexão até o
// banco travada, não tinha teto nenhum: as consultas não tinham prazo, e a rota
// esperava até os 60 s do `maxDuration` enquanto o Vigia já tinha ido embora.
// Os logs da Vercel no Hobby duram 1 hora, e a outra causa (a função não ter
// rodado) não ficou provada nem descartada. Isto cobre a que dava para cobrir.
//
// OS NÚMEROS vêm dos 43 retratos de 15/09 a 21/10: a consulta mais lenta levou
// 2,7 s e a rota inteira 7,1 s. O prazo é três vezes a pior consulta, e o
// orçamento passa duas vezes a pior rota. Com o orçamento esgotado as consultas
// que faltam nem começam, então o pior caso é orçamento + um prazo, abaixo dos
// 30 s do Vigia: a rota responde com `falhas` dizendo o buraco, em vez de calar.
//
// Conferido por `npm run conferir:prazo`.

export const PRAZO_POR_CONSULTA_MS = 8000;
export const ORCAMENTO_DA_ROTA_MS = 18000;

/**
 * Um `fetch` que desiste depois de `prazoMs`. O relógio continua valendo
 * enquanto o corpo é lido (a consulta pode travar depois do cabeçalho), e não
 * segura a função viva: abortar um pedido que já terminou não faz nada.
 *
 * O aborto sai como `AbortError` de propósito. Com esse nome o cliente da
 * Supabase NÃO tenta de novo sozinho (ele repete qualquer outra falha de rede
 * em GET, até três vezes) e devolve `{ error }` em vez de estourar.
 */
export function fetchComPrazo(prazoMs: number, base: typeof fetch = fetch): typeof fetch {
  return (entrada, init) => {
    const controle = new AbortController();
    const relogio = setTimeout(() => controle.abort(), prazoMs);
    (relogio as { unref?: () => void }).unref?.();
    const deFora = init?.signal;
    if (deFora) {
      if (deFora.aborted) controle.abort();
      else deFora.addEventListener("abort", () => controle.abort(), { once: true });
    }
    return base(entrada, { ...init, signal: controle.signal });
  };
}

/** A resposta é de uma consulta que o prazo cortou? */
export function foiOPrazo(r: { error?: { message?: string } | null } | null | undefined): boolean {
  return /^AbortError\b/.test(r?.error?.message ?? "");
}

/** Ainda cabe começar uma consulta nova? */
export function cabeMaisUma(inicioDaRota: number, agora: number, orcamentoMs = ORCAMENTO_DA_ROTA_MS): boolean {
  return agora - inicioDaRota < orcamentoMs;
}
