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

// ── QUANTO ENTROU DE VERDADE, E NÃO O PREÇO DO PLANO (02/10/2026) ──────────
//
// POR QUE ISTO EXISTE. O bloco do `renovou` no webhook nasceu em 01/10 sem
// valor, e a nota lá dizia o porquê: o que a rota tem em mãos é PREÇO DE
// PLANO, e preço não é caixa (um cupom de 100% produz a mesma virada de ciclo
// com fatura de R$ 0,00, e foi o que aconteceu em 01/09). A conclusão de lá
// foi que, para saber quanto entrou, o dono precisaria acrescentar
// `invoice.paid` à lista de eventos do endpoint do Stripe.
//
// ERA UMA SAÍDA, E NÃO A ÚNICA. A assinatura que chega no evento carrega
// `latest_invoice`, e a fatura pode ser BUSCADA na hora da virada, com a
// chave que esta casa já tem. Nada de painel, nada de evento novo: é a mesma
// entrega que já funciona, mais uma pergunta.
//
// `amount_paid` é dinheiro recebido, em centavos, na moeda da fatura. Zero é
// uma resposta legítima (cupom de 100%) e é diferente de "não sei", que é o
// `null`. Essa diferença é o ponto: `null` nunca pode virar zero no caminho,
// senão a receita some com cara de cortesia.

/** O que a fatura da virada diz que entrou. `null` quando não deu para saber. */
export type FaturaDaVirada = { centavos: number; moeda: string; fatura: string } | null;

/** O id da fatura mais recente da assinatura, venha ele como texto ou objeto. */
export function idDaUltimaFatura(sub: Stripe.Subscription): string | null {
  const li = (sub as unknown as { latest_invoice?: string | { id?: string } }).latest_invoice;
  if (typeof li === "string") return li || null;
  return li?.id ?? null;
}

/**
 * Lê a fatura da virada e devolve o que foi PAGO.
 *
 * Recebe o buscador em vez do cliente do Stripe para a conferência poder
 * exercitar isto sem rede: régua que só roda com a internet de pé é régua que
 * ninguém testa.
 *
 * NUNCA LANÇA. Perder o valor é ruim; perder o evento de renovação por causa
 * do valor seria trocar um problema por outro pior, e o `renovou` é o fato que
 * a casa passou um mês sem registrar.
 */
export async function faturaDaVirada(
  sub: Stripe.Subscription,
  buscar: (id: string) => Promise<{ status?: string | null; amount_paid?: number | null; currency?: string | null } | null>,
): Promise<FaturaDaVirada> {
  const id = idDaUltimaFatura(sub);
  if (!id) return null;
  try {
    const f = await buscar(id);
    // Só fatura PAGA vira receita. `open` e `draft` são promessa, e `void` é
    // fatura que deixou de existir: contar qualquer uma delas seria afirmar
    // caixa que ninguém recebeu.
    if (!f || f.status !== "paid") return null;
    const centavos = Number(f.amount_paid);
    if (!Number.isFinite(centavos) || centavos < 0) return null;
    return { centavos, moeda: String(f.currency ?? "brl").toLowerCase(), fatura: id };
  } catch {
    return null;
  }
}

// ── O CICLO QUE VENCEU E NINGUEM MEXEU (02/10/2026) ────────────────────────
//
// POR QUE ISTO EXISTE. O conserto do `renovou` de 01/10 e TEORIA EM PRODUCAO:
// nenhuma renovacao passou por ele. Pior, em 02/10 os tres assinantes do
// Stripe sairam, entao as duas renovacoes que iam prova-lo (04/10 e 09/10) nao
// vao acontecer. Nao da para fabricar uma renovacao, e esperar uma sem rede
// nenhuma e o jeito de o conserto ficar quebrado em silencio por mais um mes.
//
// O QUE ESTA REGUA PEGA: assinatura que o banco acha ATIVA e cujo ciclo JA
// VENCEU. Se o Stripe tivesse renovado, o webhook teria empurrado o ciclo para
// frente; se tivesse falhado o pagamento, o status teria virado `past_due`. As
// duas coisas passam pela mesma entrega. Ciclo vencido com status ativo
// significa que NENHUMA das duas chegou, e aí ninguem esta medindo nada.
//
// E O MESMO formato das outras redes desta semana: nao e opiniao, e subtracao
// de duas coisas que o banco ja guarda. A folga de um dia existe porque o
// webhook do Stripe chega minutos depois da virada e um alarme que dispara no
// minuto exato grita todo mes a toa.
export const FOLGA_DO_CICLO_DIAS = 1;

export function cicloVencido(
  fimDoCicloISO: string | null | undefined,
  hojeISO: string,
  folgaDias = FOLGA_DO_CICLO_DIAS,
): boolean {
  if (!fimDoCicloISO) return false;
  const fim = Date.parse(String(fimDoCicloISO));
  const hoje = Date.parse(`${String(hojeISO).slice(0, 10)}T00:00:00Z`);
  if (!Number.isFinite(fim) || !Number.isFinite(hoje)) return false;
  return fim + folgaDias * 86400000 < hoje;
}

/**
 * A frase do retrato sobre ciclo vencido.
 *
 * Zero e o normal e e dito como normal. Acima de zero nao e necessariamente
 * dinheiro perdido, e a frase nao afirma que e: pode ser webhook parado, pode
 * ser assinatura que acabou e ninguem avisou. O que ela afirma e que ninguem
 * esta medindo, que e o problema que esta casa passou setembro inteiro tendo.
 */
export function linhaDeCiclosVencidos(
  vencidas: { fim: string | null | undefined }[],
): { deveAvisar: boolean; texto: string; silencio: string } {
  if (vencidas.length === 0) {
    return { deveAvisar: false, texto: "", silencio: "nenhuma assinatura ativa com ciclo vencido" };
  }
  const datas = vencidas
    .map((v) => String(v.fim ?? "").slice(0, 10))
    .filter(Boolean)
    .sort();
  return {
    deveAvisar: true,
    texto:
      `ASSINATURA ATIVA COM CICLO VENCIDO: ${vencidas.length}. O ciclo delas terminou` +
      `${datas.length ? ` (o mais antigo em ${datas[0]})` : ""} e o banco segue dizendo ativa.` +
      ` O Stripe empurraria o ciclo numa renovacao e marcaria past_due numa falha de pagamento,` +
      ` e nenhuma das duas chegou: ou o webhook parou, ou a renovacao aconteceu sem ser registrada.` +
      ` Conferir Stripe, Developers, Webhooks, e o campo current_period_end em subscriptions.`,
    silencio: "",
  };
}
