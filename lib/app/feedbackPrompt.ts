"use client";

import type { FeedbackState } from "./store";

// Quando o app pode perguntar "o que você acha?".
//
// Um pedido mal dosado custa mais que não pedir: vira motivo de nota baixa
// sozinho. Por isso toda a decisão mora aqui, num lugar só — espalhar `if` de
// data pelas telas é como uma janela de espera acaba valendo num caminho e não
// no outro, e ninguém percebe lendo o código.
//
// A pergunta em si é NEUTRA: cinco estrelas, sem citar a loja antes da resposta.
// Quem manda para a loja é a nota, e mesmo aí é um botão — nunca um redirect.
// Filtrar quem está insatisfeito para longe da App Store é o que a Apple trata
// como manipulação de avaliação, e é por isso que o caminho de nota baixa
// também tem um link para a loja.

/** Momento que armou o pedido. Vai junto no e-mail, para saber o que converte. */
export type MotivoFeedback = "primeiro-servico" | "tres-aulas-trilha" | "biela-util";

const DIA = 24 * 60 * 60 * 1000;

export const ESPERA = {
  /** Teto geral entre dois pedidos, para quem respondeu. */
  respondeu: 90,
  /** Nota de 1 a 3: só volta a perguntar quando houver tempo de algo mudar. */
  notaBaixa: 180,
  /** Fechou sem responder é momento ruim, não recusa — merece nova chance. */
  semResposta: 30,
  /** Antes disso a pessoa não tem opinião formada, e a nota é ruído. */
  diasMinimosDeApp: 3,
} as const;

/**
 * Já perguntamos nesta sessão?
 *
 * Fica na memória do módulo de propósito: "sessão" aqui é o app aberto, e
 * reiniciar zera. Dois pedidos numa mesma sessão é o que faz o app parecer
 * insistente, e nenhuma janela em dias pega esse caso.
 */
let perguntouNestaSessao = false;

/** Só para os testes: devolve o módulo ao estado de app recém-aberto. */
export function _zerarSessao(): void {
  perguntouNestaSessao = false;
}

function diasEntre(iso: string | null | undefined, agora: number): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return Math.floor((agora - t) / DIA);
}

/**
 * Pode perguntar agora?
 *
 * `startedAt` é o primeiro dia no app. Ele sobrevive a login em outro aparelho
 * e a reinstalação porque o merge da sessão guarda sempre a data mais antiga
 * entre nuvem e local.
 */
export function podePerguntar(
  entrada: { startedAt: string | null; feedback?: FeedbackState },
  agora: number = Date.now()
): boolean {
  if (perguntouNestaSessao) return false;

  const diasDeApp = diasEntre(entrada.startedAt, agora);
  if (diasDeApp == null || diasDeApp < ESPERA.diasMinimosDeApp) return false;

  const fb = entrada.feedback;
  if (!fb) return true;

  // Já foi para a loja: acabou. Pedir de novo a quem já avaliou só irrita, e
  // não temos como saber se avaliou mesmo — a Apple não conta.
  if (fb.foiParaLoja) return false;

  const desdeOPedido = diasEntre(fb.perguntadoEm, agora);
  if (desdeOPedido == null) return true;

  if (fb.respondidoEm) {
    const limite = (fb.nota ?? 5) <= 3 ? ESPERA.notaBaixa : ESPERA.respondeu;
    return desdeOPedido >= limite;
  }
  return desdeOPedido >= ESPERA.semResposta;
}

/** Nome do evento que a folha de estrelas escuta, montada no Shell. */
export const EVENTO = "mq-pedir-feedback";

/**
 * Pede a nota, se for a hora.
 *
 * Devolve `true` quando a folha foi disparada — quem chama não precisa saber
 * de nenhuma regra, só avisar que um bom momento aconteceu.
 */
export function pedirFeedback(
  entrada: { startedAt: string | null; feedback?: FeedbackState },
  motivo: MotivoFeedback
): boolean {
  if (typeof window === "undefined") return false;
  if (!podePerguntar(entrada)) return false;
  perguntouNestaSessao = true;
  window.dispatchEvent(new CustomEvent<MotivoFeedback>(EVENTO, { detail: motivo }));
  return true;
}
