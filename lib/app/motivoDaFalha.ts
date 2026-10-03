// Por que o SDK da atribuição não subiu, em formato que cabe na coluna.
//
// MORA SOZINHO, SEM IMPORT NENHUM, de propósito: assim a `npm run conferir:midia`
// exercita a regra de verdade em vez de procurar texto no fonte. É o mesmo
// desenho de `lib/ciclo.ts`, pelo mesmo motivo.
//
/**
 * O motivo da falha, em formato que cabe na coluna e dá para agrupar.
 *
 * POR QUE ISTO NASCEU (03/10/2026): o `catch` antigo jogava o erro fora. A casa
 * sabia que 23% falhavam e NÃO tinha como saber por quê, porque o diagnóstico
 * era descartado na linha seguinte à da falha. Alarme que não diz o motivo faz
 * a rodada seguinte adivinhar, e adivinhar causa já custou build inteiro aqui.
 *
 * A rota do funil corta `origem` em 32 caracteres, então o slug é curto de
 * propósito: `erro:` mais 27. Não é classificação fina, é o bastante para a
 * próxima rodada ver a distribuição e aí sim classificar com dado na mão.
 */
export function motivoDaFalha(e: unknown): string {
  const bruto =
    e instanceof Error ? `${e.name} ${e.message}` : typeof e === "string" ? e : JSON.stringify(e ?? "");
  const slug = String(bruto)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 27);
  return `erro:${slug || "sem-mensagem"}`;
}
