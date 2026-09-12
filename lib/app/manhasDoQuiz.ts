// As manhãs em que o quiz avisa: até três, uma por dia, às 9h.
//
// APROVADO PELO DONO EM 12/09/2026, depois de ele ficar dias sem aviso no
// iPhone. Até aqui o lembrete agendava UM aviso para as próximas 9h e só
// reagendava quando a pessoa abria o app ou respondia: quem sumia recebia um
// e depois silêncio, que é o caso que mais precisava do lembrete. Três é o
// meio do caminho entre "um e acabou" e perseguir: quem responde todo dia
// continua vendo um por dia (a abertura refaz a lista); quem some recebe
// três manhãs e depois o silêncio.
//
// Pura, para `npm run conferir:aviso` exercitar: quem já respondeu hoje não
// recebe o de hoje; a lista começa na próxima manhã livre e segue dia a dia.

import { respondeuHoje, type EstadoQuiz } from "./quiz/sequencia.ts";

export const HORA_DO_QUIZ = 9;
export const MANHAS_DO_QUIZ = 3;

const dia = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

/**
 * A próxima manhã em que cabe aviso: hoje às 9h se ainda não passou e a
 * pessoa não respondeu; senão, amanhã às 9h. Igual à regra de sempre.
 */
export function proximaManha(e: EstadoQuiz, agora = new Date()): Date {
  const alvo = new Date(agora);
  alvo.setHours(HORA_DO_QUIZ, 0, 0, 0);
  const feito = respondeuHoje(e, dia(alvo));
  if (!feito && alvo.getTime() > agora.getTime()) return alvo;
  alvo.setDate(alvo.getDate() + 1);
  return alvo;
}

/** As próximas `n` manhãs, a partir da próxima livre, uma por dia. */
export function manhasDoQuiz(e: EstadoQuiz, agora = new Date(), n = MANHAS_DO_QUIZ): Date[] {
  const primeira = proximaManha(e, agora);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(primeira);
    d.setDate(d.getDate() + i);
    return d;
  });
}

/**
 * O texto de confirmação ao ligar os avisos: "hoje às 9h" ou "amanhã às 9h".
 * Devolve "hoje" ou "amanha" para a tela escolher a frase.
 */
export function quandoSaiOProximo(e: EstadoQuiz, agora = new Date()): "hoje" | "amanha" {
  return dia(proximaManha(e, agora)) === dia(agora) ? "hoje" : "amanha";
}
