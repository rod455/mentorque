"use client";

// O segundo (e último) pedido de conta, para o convidado que já tem algo a perder.
//
// POR QUE ELE EXISTE (30/10/2026, aposta
// a-conta-e-pedida-de-novo-a-quem-ja-tem-algo-a-perder). Medido no banco em
// 30/10: a folha "Salve sua garagem" apareceu para 312 aparelhos na semana de
// 19 a 25/10, e 126 tocaram em "Agora não". Desses que recusaram, **73 depois
// fizeram algo de valor no app e NENHUM criou conta**, e **nenhum dos 224
// recusantes foi perguntado uma segunda vez**: a folha nasce só do cadastro de
// carro, e quem já tem carro nunca mais a dispara.
//
// Quem toca em "Agora não" na primeira vez está certo: naquele instante ela
// acabou de digitar marca, modelo e ano, e a folha oferece proteção contra
// perder o aparelho algum dia. Não há nada no app que doa perder ainda. Depois
// de um serviço registrado, um abastecimento ou uma aula vista, "está só neste
// aparelho" para de ser hipótese e passa a nomear algo que existe.
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
//   2. nunca na mesma sessão da recusa;
//   3. nunca depois de dois "não".
//
// Quem disser não duas vezes não é perguntado mais, nunca.
const CHAVE_RECUSAS = "mq-conta-recusas";
const CHAVE_REPIQUE = "mq-conta-repique";

/** Marca uma recusa da folha de conta, e diz quantas já houve. */
export function marcaRecusaDeConta(): number {
  try {
    const n = Number(window.localStorage.getItem(CHAVE_RECUSAS) ?? "0");
    const total = (Number.isFinite(n) ? n : 0) + 1;
    window.localStorage.setItem(CHAVE_RECUSAS, String(total));
    // A sessão da recusa fica marcada: o repique nunca acontece dentro dela.
    window.sessionStorage.setItem(CHAVE_RECUSAS, "1");
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
 * de linha de comando poder exercitar as três travas sem navegador.
 */
export function cabeSegundoPedido(temAlgoAPerder: boolean): boolean {
  if (!temAlgoAPerder) return false;
  try {
    // Trava 3: dois "não" encerram o assunto.
    const recusas = Number(window.localStorage.getItem(CHAVE_RECUSAS) ?? "0");
    if (!Number.isFinite(recusas) || recusas < 1 || recusas >= 2) return false;
    // Trava 1: um repique na vida do aparelho.
    if (window.localStorage.getItem(CHAVE_REPIQUE)) return false;
    // Trava 2: nunca na sessão em que a pessoa disse não.
    if (window.sessionStorage.getItem(CHAVE_RECUSAS)) return false;
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
