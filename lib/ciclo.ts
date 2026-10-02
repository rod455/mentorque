import type Stripe from "stripe";

// O ciclo de cobrança de uma assinatura do Stripe, e a pergunta "ele virou?".
//
// Mora num arquivo só de regra, sem tocar banco nem rede, por dois motivos: a
// conferência `npm run conferir:renovacao` exercita isto de verdade em vez de
// procurar texto no fonte, e quem LÊ o ciclo para reconhecer a renovação usa
// exatamente a mesma função que quem o GRAVA em `subscriptions`. Duas leituras
// diferentes do mesmo ciclo é como se inventa uma virada que não houve, ou se
// perde a que houve.

/**
 * Fim do ciclo atual, em segundos, como o Stripe manda.
 *
 * `current_period_end` migrou do objeto subscription para o ITEM nas versões
 * novas da API, e por isso os dois lugares são consultados nesta ordem.
 */
export function fimDoCiclo(sub: Stripe.Subscription): number | undefined {
  const item = sub.items?.data?.[0];
  return (
    (item as { current_period_end?: number } | undefined)?.current_period_end ??
    (sub as unknown as { current_period_end?: number }).current_period_end
  );
}

/**
 * O ciclo virou? Só quando o fim do ciclo ANDOU PARA FRENTE.
 *
 * É o que separa renovação de qualquer outro `customer.subscription.updated`,
 * e cada recusa aqui é um jeito de inventar receita que não houve:
 *
 *   · sem ciclo gravado não há virada: assinatura que o banco ainda não
 *     conhece é `assinou`, não `renovou`;
 *   · ciclo igual não é virada: é a REENTREGA do mesmo webhook, que o Stripe
 *     faz sempre que não recebe 2xx. É esta linha que faz a dedup existir sem
 *     índice nenhum no banco, e é por isso que quem chama precisa ler o ciclo
 *     ANTES de gravar o novo;
 *   · `>` e não `!==`: correção para TRÁS, feita na mão no painel, não é
 *     renovação.
 *
 * A folga de um minuto existe porque o banco guarda o instante como texto com
 * fuso e o Stripe manda segundos inteiros: sem ela, um arredondamento de ida e
 * volta viraria uma renovação inventada.
 */
export function viradaDeCiclo(cicloGravado: number | null, sub: Stripe.Subscription): boolean {
  const agora = fimDoCiclo(sub);
  if (!agora || !cicloGravado) return false;
  return agora > cicloGravado + 60;
}
