"use client";

// O segundo (e último) pedido de conta, para o convidado que já tem algo a perder.
//
// POR QUE ELE EXISTE (30/10/2026, aposta
// a-conta-e-pedida-de-novo-a-quem-ja-tem-algo-a-perder). Medido no banco em
// 30/10: a folha "Salve sua garagem" apareceu para 312 aparelhos na semana de
// 19 a 25/10, e 126 tocaram em "Agora não". Dos 225 recusantes desde 17/10, 73
// depois fizeram algo de valor no app e só 7 criaram conta; cinco desses sete
// pela MESMA folha, que reaparece quando a pessoa cadastra outro carro. Fora
// esse caso, a folha nasce só do cadastro de carro, e quem já tem carro nunca
// mais a dispara.
//
// Quem toca em "Agora não" na primeira vez está certo: naquele instante ela
// acabou de digitar marca, modelo e ano, e a folha oferece proteção contra
// perder o aparelho algum dia. Não há nada no app que doa perder ainda. Depois
// de um serviço registrado, um abastecimento ou uma aula vista, "está só neste
// aparelho" para de ser hipótese e passa a nomear algo que existe.
//
// QUEM É ALCANÇADO (correção da revisão de 30/10). O contador de recusas só
// existe a partir deste código. Na primeira escrita, "sem contador" valia
// "nunca recusou", e isso deixava de fora os 225 recusantes que motivaram a
// aposta, mais quem saiu da folha sem responder: nenhum deles tem contador.
// Quem chega aqui é convidado COM carro (a folha confere as duas coisas), e
// todo convidado com carro já recebeu a folha no cadastro dele. Então sem
// contador vale UMA recusa, a não ser que a folha tenha sido pedida NESTA
// sessão, que é o caso do aparelho novo que acabou de cadastrar o carro.
//
// E É O CONSERTO QUE O DONO NOMEOU EM 17/10, ao corrigir a frase "o momento não
// volta": "a de hoje melhora o pedido; a outra REPETE o pedido a quem volta".
//
// ── A DISCIPLINA CONTRA A PRAGA ────────────────────────────────────────────
//
// `lib/app/marcasDeConvite.ts` diz que a marca do convite morre com a sessão de
// propósito, porque "pedido que ressuscita dias depois vira praga". Isto NÃO
// desfaz aquilo: a marca do cadastro continua morrendo com a sessão. O que
// existe aqui é UM segundo pedido, com travas no molde do convite de permissão
// (que tem 4 dias entre pedidos e 3 na vida):
//
//   1. no máximo UM repique na vida do aparelho;
//   2. nunca na mesma sessão em que a conta já foi pedida (recusa inclusa);
//   3. nunca depois de dois "não".
//
// Quem disser não duas vezes não é perguntado mais, nunca.
const CHAVE_RECUSAS = "mq-conta-recusas";
const CHAVE_REPIQUE = "mq-conta-repique";
/** No sessionStorage: a conta já foi pedida nesta sessão. Morre com ela. */
const CHAVE_PEDIDA_NA_SESSAO = "mq-conta-pedida";

/**
 * Marca que a folha de conta foi pedida nesta sessão. Chamado pelo cadastro de
 * carro, ANTES de a folha abrir: é o que impede o aparelho novo, que ainda não
 * tem contador, de ganhar o repique por cima do primeiro pedido.
 */
export function marcaPedidoDeContaNaSessao(): void {
  try {
    window.sessionStorage.setItem(CHAVE_PEDIDA_NA_SESSAO, "1");
  } catch {
    /* sem armazenamento: cabeSegundoPedido também não lê, e diz não */
  }
}

/**
 * Marca uma recusa da folha de conta, e diz quantas já houve.
 *
 * `jaFoiPedidaAntes` cobre o aparelho sem contador (o de antes deste código):
 * se ele já tem outro carro, ou já gastou o repique, esta não é a primeira
 * folha que ele recusa, e contar 1 deixaria passar um terceiro pedido e
 * etiquetaria o segundo "não" como o primeiro no funil.
 */
export function marcaRecusaDeConta(jaFoiPedidaAntes = false): number {
  try {
    const cru = window.localStorage.getItem(CHAVE_RECUSAS);
    const antes = jaFoiPedidaAntes || !!window.localStorage.getItem(CHAVE_REPIQUE) ? 1 : 0;
    const n = cru === null ? antes : Number(cru);
    const total = (Number.isFinite(n) ? n : 0) + 1;
    window.localStorage.setItem(CHAVE_RECUSAS, String(total));
    // A sessão da recusa fica marcada: o repique nunca acontece dentro dela.
    window.sessionStorage.setItem(CHAVE_PEDIDA_NA_SESSAO, "1");
    return total;
  } catch {
    return 0;
  }
}

/**
 * Cabe um segundo pedido agora?
 *
 * `temAlgoAPerder` é a decisão de quem chama: ela depende do estado do app
 * (serviço, abastecimento, aula), e este arquivo fica puro para a conferência
 * de linha de comando poder exercitar as três travas sem navegador. Quem chama
 * também garante convidado com carro: é isso que faz "sem contador" valer uma
 * recusa (ver QUEM É ALCANÇADO, no topo).
 */
export function cabeSegundoPedido(temAlgoAPerder: boolean): boolean {
  if (!temAlgoAPerder) return false;
  try {
    // Trava 2: nunca na sessão em que a conta já foi pedida. Vem primeiro
    // porque é ela que separa o aparelho novo (sem contador, folha pedida
    // agora) do recusante antigo (sem contador, folha pedida antes de existir
    // contador).
    if (window.sessionStorage.getItem(CHAVE_PEDIDA_NA_SESSAO)) return false;
    // Trava 3: dois "não" encerram o assunto. Sem contador vale uma recusa.
    const cru = window.localStorage.getItem(CHAVE_RECUSAS);
    const recusas = cru === null ? 1 : Number(cru);
    if (!Number.isFinite(recusas) || recusas < 1 || recusas >= 2) return false;
    // Trava 1: um repique na vida do aparelho.
    if (window.localStorage.getItem(CHAVE_REPIQUE)) return false;
    return true;
  } catch {
    return false;
  }
}

/** Gasta o repique. Chamado quando o segundo pedido É mostrado. */
export function gastaSegundoPedido(): void {
  try {
    window.localStorage.setItem(CHAVE_REPIQUE, String(Date.now()));
  } catch {
    /* sem armazenamento: o pedido simplesmente não se repete */
  }
}
