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
//
// LIDO EM 03/10/2026: zero resgates no cupom de teto 25. A estimativa e a
// medida coincidem hoje, e o `LEITURA_DO_PAINEL` guarda a data para que o
// retrato diga de onde o numero veio em vez de deixar o leitor supor.

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
 * A leitura do painel do Stripe: quando foi lida e quanto dizia.
 *
 * `null` é "ninguém leu ainda". Objeto é "alguém leu, nesta data, e deu este
 * número", INCLUSIVE quando o número é zero. A primeira versão disto era uma
 * constante solta em 0 e o comentário dela precisava explicar que zero queria
 * dizer "não lido": duas coisas diferentes no mesmo valor, que é como um dado
 * medido e a falta dele viram a mesma frase no retrato.
 *
 * LIDO EM 03/10/2026, no painel, pelo dono: Product catalog > Coupons, a linha
 * de 100% off once com teto 25, em **0/25**. É o cupom `MENSAL-LANCAMENTO100-25`
 * criado em 03/09 junto com o código `LANCAMENTO1MES`, os dois com teto 25
 * (`docs/lancamento/email-lista-de-espera.md`); os outros "1 mês grátis" do
 * painel têm teto 10 e são os do lançamento, com 3 resgates somados, que são as
 * três assinaturas pagantes de setembro.
 *
 * Então as 25 vagas estão INTEIRAS, e o e-mail de 03/10 para 32 pessoas ainda
 * não produziu resgate nenhum.
 */
export const LEITURA_DO_PAINEL: { em: string; resgates: number } | null = { em: "03/10/2026", resgates: 0 };

/** Quantos resgates já tinham sido gastos antes de a contagem do banco existir. */
export const USOS_ANTES_DA_CONTAGEM = LEITURA_DO_PAINEL?.resgates ?? 0;

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
  const ressalva = LEITURA_DO_PAINEL
    ? `. Painel do Stripe lido em ${LEITURA_DO_PAINEL.em}: ${LEITURA_DO_PAINEL.resgates} de ${TETO_DO_CUPOM}. Daquele dia para ca a conta e a do banco`
    : ". CONTA POR BAIXO: so enxerga resgate que virou assinatura nossa depois de 02/10, e o que foi gasto antes nao esta aqui (ninguem leu o painel ainda). O numero do painel do Stripe e que manda";
  if (restam === 0) {
    return `${base}. A OFERTA PAROU DE SAIR nos e-mails novos, e a decisao e do dono: criar cupom novo (o teto nao sobe, so criando outro) ou encerrar a campanha${ressalva}`;
  }
  return `${base}${ressalva}`;
}
