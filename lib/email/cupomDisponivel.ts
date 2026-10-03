// O cupom ainda tem vaga?
//
// POR QUE ISTO EXISTE (03/10/2026). O dono pediu que o convite do mês grátis
// vire rotina: quem cria conta e não cadastra o carro recebe a oferta, e
// "quando chegarmos nos 25 usos, decidimos se criamos outro cupom ou paramos
// de enviar". Rotina que oferece cupom esgotado não para sozinha: ela segue
// mandando "por nossa conta" e o checkout abre com o preço cheio, calado, para
// cada pessoa nova. O teto precisa ser uma regra do código, não uma lembrança
// de alguém.
//
// POR QUE O NÚMERO NÃO VEM DO STRIPE. A integração do Stripe não está
// autorizada nestas sessões, e mesmo que estivesse, uma rotina diária
// perguntando o resgate ao Stripe criaria dependência de rede para decidir o
// texto de um e-mail. O que a casa TEM é a própria coluna `subscriptions.cupom`,
// escrita pelo `upsertSubscription` a partir da metadata do checkout.
//
// E O LIMITE HONESTO DESSA CONTA, que precisa estar escrito: a coluna só
// enxerga resgate que virou assinatura NOSSA e que chegou pelo webhook. Ela
// não enxerga o que foi gasto antes de 02/10, quando o `upsertSubscription`
// ainda apagava o cupom na reescrita (as três assinaturas do lançamento estão
// com `cupom` nulo por causa disso). Por isso existe `USOS_ANTES_DA_CONTAGEM`:
// o dono lê UMA vez no painel do Stripe quantos resgates já foram e põe aqui.
// Enquanto for 0, a conta subestima o gasto, e subestimar aqui erra para o
// lado de oferecer demais. Está dito para ninguém confundir estimativa com
// medida.

/** O cupom da campanha, o mesmo do lançamento. */
export const CUPOM_DA_CAMPANHA = "LANCAMENTO1MES";

/** Preço do mês seguinte, como a pessoa lê. */
export const PRECO_MENSAL = "R$ 29,90";

/**
 * O teto do cupom no Stripe.
 *
 * 25, e ele NÃO é editável: `max_redemptions` é imutável depois da criação
 * (registrado em docs/lancamento/email-lista-de-espera.md, 03/09, quando subir
 * de 10 para 25 só foi possível criando cupom novo). Trocar o teto aqui sem
 * trocar o cupom lá é mentira que vira preço cheio na tela de alguém.
 */
export const TETO_DO_CUPOM = 25;

/**
 * Quantos resgates já tinham sido gastos antes de a contagem existir.
 *
 * Lido UMA vez no painel do Stripe e escrito aqui. Zero significa "ninguém
 * leu ainda", e não "ninguém usou".
 */
export const USOS_ANTES_DA_CONTAGEM = 0;

export type OfertaDeCupom = { cupom: string; precoMensal: string };

/**
 * Ainda cabe mais um resgate?
 *
 * `resgatesContados` são as assinaturas com este cupom no nosso banco. A folga
 * de um é de propósito: a conta é uma estimativa por baixo, e o último resgate
 * é justamente o que viraria preço cheio para alguém.
 */
export function cupomAindaTemVaga(resgatesContados: number): boolean {
  const usados = USOS_ANTES_DA_CONTAGEM + Math.max(0, resgatesContados);
  return usados < TETO_DO_CUPOM;
}

/** A oferta para o e-mail, ou `null` quando o cupom acabou. */
export function ofertaDoCupom(resgatesContados: number): OfertaDeCupom | null {
  return cupomAindaTemVaga(resgatesContados) ? { cupom: CUPOM_DA_CAMPANHA, precoMensal: PRECO_MENSAL } : null;
}

/**
 * A frase do retrato, para o fim do cupom não ser descoberto por um cliente.
 *
 * Sem ela, o dia em que a oferta sumir dos e-mails passa em silêncio, e a
 * decisão que o dono reservou para si ("criar outro cupom ou parar de enviar")
 * chega como surpresa em vez de aviso.
 */
export function linhaDoCupom(resgatesContados: number): string {
  const usados = USOS_ANTES_DA_CONTAGEM + Math.max(0, resgatesContados);
  const restam = Math.max(0, TETO_DO_CUPOM - usados);
  const base = `Cupom ${CUPOM_DA_CAMPANHA}: ${usados} de ${TETO_DO_CUPOM} usados, ${restam} vaga(s)`;
  const ressalva =
    USOS_ANTES_DA_CONTAGEM === 0
      ? ". CONTA POR BAIXO: so enxerga resgate que virou assinatura nossa depois de 02/10, e o que foi gasto antes nao esta aqui (USOS_ANTES_DA_CONTAGEM = 0). O numero do painel do Stripe e que manda"
      : "";
  if (restam === 0) {
    return `${base}. A OFERTA PAROU DE SAIR nos e-mails novos, e a decisao e do dono: criar cupom novo (o teto nao sobe, so criando outro) ou encerrar a campanha${ressalva}`;
  }
  return `${base}${ressalva}`;
}
