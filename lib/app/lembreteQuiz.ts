"use client";

import { AVISO, agendar, cancelar, notificacoesDisponiveis, permissaoConcedida } from "./notificacoes";
import { QUIZ_ZERADO, respondeuHoje, type EstadoQuiz } from "./quiz/sequencia";

// O aviso do quiz na bandeja do celular.
//
// Hora do dia. Nove da manhã: o quiz é de um minuto e vive de virar rotina, e
// rotina se instala no começo do dia, não no meio dele. Cedo demais chega com
// a pessoa dormindo; à noite disputa com o resto da vida dela.
const HORA = 9;

/**
 * QUANDO avisar, ou null se não cabe aviso agora.
 *
 * Separada da parte que fala com o sistema para poder ser conferida sozinha.
 * A regra: o próximo horário das 9h em que a pessoa ainda NÃO tiver respondido.
 * Se hoje ainda não respondeu e ainda não deu 9h, é hoje; caso contrário,
 * amanhã.
 */
export function quandoAvisarQuiz(e: EstadoQuiz, agora = new Date()): Date | null {
  const alvo = new Date(agora);
  alvo.setHours(HORA, 0, 0, 0);

  const hoje = `${alvo.getFullYear()}-${String(alvo.getMonth() + 1).padStart(2, "0")}-${String(alvo.getDate()).padStart(2, "0")}`;
  const feito = respondeuHoje(e, hoje);

  // Hoje ainda serve se a hora não passou E a pessoa não respondeu.
  if (!feito && alvo.getTime() > agora.getTime()) return alvo;

  alvo.setDate(alvo.getDate() + 1);
  return alvo;
}

/**
 * Põe o aviso do quiz em dia com o estado atual.
 *
 * UM AVISO POR VEZ, reagendado a cada abertura do app e a cada resposta, em
 * vez de um agendamento diário que se repete sozinho. A diferença é o caso
 * chato: com repetição, quem responde às 8h toda manhã levaria um "responda a
 * pergunta do dia" às 9h todo dia, sobre uma coisa que já fez. Um aviso que
 * chega errado todo dia é um aviso que a pessoa desliga.
 *
 * O preço dessa escolha é honesto: quem para de abrir o app recebe UM aviso e
 * depois silêncio, porque não há nada rearmando. Isso é o certo. Notificação
 * local não persegue ninguém, e a essa altura a sequência já quebrou de
 * qualquer jeito — insistir seria cobrança, não lembrete.
 */
export async function sincronizarLembreteQuiz(o: {
  quer: boolean;
  quiz: EstadoQuiz | undefined;
  textos: { titulo: string; corpo: string };
}): Promise<void> {
  if (!notificacoesDisponiveis()) return;

  if (!o.quer) {
    await cancelar(AVISO.quizDoDia);
    return;
  }

  // Sem permissão não adianta agendar, e também não é hora de pedir: pedir
  // fora de um toque da pessoa é o caminho mais curto para o "não" definitivo
  // do sistema. Quem convida é o ConviteDeAviso, depois do quiz.
  if (!(await permissaoConcedida())) return;

  const quando = quandoAvisarQuiz(o.quiz ?? QUIZ_ZERADO);
  if (!quando) {
    await cancelar(AVISO.quizDoDia);
    return;
  }

  // `rota: "quiz"` é o que faz o toque abrir a PERGUNTA, e não a tela inicial.
  // Até 03/09/2026 o aviso não carregava destino nenhum: ele trazia a pessoa de
  // volta ao app e a largava no Início, com o chip do quiz esperando um segundo
  // toque. Ver lib/app/rotaPendente.ts.
  await agendar({ id: AVISO.quizDoDia, titulo: o.textos.titulo, corpo: o.textos.corpo, quando, rota: "quiz" });
}
