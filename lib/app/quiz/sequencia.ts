// A extensão ".ts" no import é deliberada: scripts/verifica-quiz.ts roda este
// arquivo no node puro, e lá o caminho precisa ser explícito. O compilador
// aceita por causa de `allowImportingTsExtensions` no tsconfig, e com `noEmit`
// nada disso chega ao pacote gerado.
import { diasEntre } from "../datas.ts";
import type { Pergunta } from "./perguntas";

export { diaLocal, diasEntre } from "../datas.ts";

// A regra do quiz diário: qual pergunta sai hoje e o que acontece com a
// sequência quando a pessoa responde.
//
// Está separada da tela de propósito. É uma regra de data, e regra de data
// errada aqui destrói o único ativo que o quiz constrói: a sequência de dias.
// Quem perde 40 dias seguidos por um bug de fuso não volta.

export type EstadoQuiz = {
  /** Último dia em que respondeu, yyyy-mm-dd. */
  ultimoDia: string | null;
  /** Dias seguidos até `ultimoDia`. Só vale COMO ESTAVA naquele dia. */
  sequencia: number;
  /** Maior sequência já alcançada. Nunca diminui. */
  recorde: number;
  /** Dia em que o último perdão foi gasto. */
  perdaoEm: string | null;
  /** Total de respostas e de acertos, para marcos e para o próprio orgulho. */
  respostas: number;
  acertos: number;
};

export const QUIZ_ZERADO: EstadoQuiz = {
  ultimoDia: null,
  sequencia: 0,
  recorde: 0,
  perdaoEm: null,
  respostas: 0,
  acertos: 0,
};

/**
 * De quantos em quantos dias a pessoa ganha um perdão.
 *
 * O perdão existe porque sequência sem perdão é uma armadilha: o dia que a
 * pessoa perde não é o dia em que ela desistiu do app, é o dia em que ela
 * viajou, adoeceu ou simplesmente esqueceu. Zerar 40 dias por causa disso
 * transforma o melhor usuário no mais frustrado, e ele não recomeça.
 *
 * Sete dias, um perdão. Menos que isso e a sequência deixa de significar
 * hábito; mais que isso e o perdão nunca chega quando é preciso.
 */
const DIAS_POR_PERDAO = 7;

/** Tem perdão disponível para gastar em `hoje`? */
export function temPerdao(e: EstadoQuiz, hoje: string): boolean {
  if (!e.perdaoEm) return true;
  return diasEntre(e.perdaoEm, hoje) >= DIAS_POR_PERDAO;
}

/**
 * A sequência COMO ELA ESTÁ HOJE, que é o que a tela mostra.
 *
 * Diferente de `e.sequencia`, que é o valor congelado do último dia
 * respondido. Sem esta função a tela mostraria "12 dias seguidos" para quem
 * sumiu há duas semanas, e a pessoa descobriria a verdade só depois de
 * responder — a pior hora possível para dar uma má notícia.
 */
export function sequenciaHoje(e: EstadoQuiz, hoje: string): number {
  if (!e.ultimoDia) return 0;
  const dias = diasEntre(e.ultimoDia, hoje);
  if (dias <= 0) return e.sequencia;          // já respondeu hoje
  if (dias === 1) return e.sequencia;          // responder hoje continua
  if (dias === 2 && temPerdao(e, hoje)) return e.sequencia; // dá para salvar
  return 0;
}

/** Já respondeu o quiz de hoje? */
export function respondeuHoje(e: EstadoQuiz, hoje: string): boolean {
  return !!e.ultimoDia && diasEntre(e.ultimoDia, hoje) <= 0;
}

/**
 * Aplica a resposta do dia e devolve o estado novo.
 *
 * Só a sequência depende de acertar ou errar? Não: NADA depende. Errar mantém
 * a sequência. O hábito que o quiz constrói é o de aparecer todo dia, e punir
 * o erro faria a pessoa evitar as perguntas difíceis — justamente as que ela
 * precisa. O acerto entra no total, não na sequência.
 */
export function aoResponder(e: EstadoQuiz, hoje: string, acertou: boolean): EstadoQuiz {
  // Idempotente: responder duas vezes no mesmo dia não conta duas vezes. Vale
  // para toque duplo, para a tela remontando e para dois aparelhos ao mesmo
  // tempo com o estado ainda por sincronizar.
  if (respondeuHoje(e, hoje)) return e;

  const dias = e.ultimoDia ? diasEntre(e.ultimoDia, hoje) : Infinity;
  let sequencia: number;
  let perdaoEm = e.perdaoEm;

  if (dias === 1) {
    sequencia = e.sequencia + 1;
  } else if (dias === 2 && temPerdao(e, hoje)) {
    // Faltou exatamente um dia e havia perdão: a sequência segue, e o perdão
    // é gasto. Só um dia é perdoável — dois dias de silêncio não são um
    // tropeço, são uma saída.
    sequencia = e.sequencia + 1;
    perdaoEm = hoje;
  } else {
    sequencia = 1;
  }

  return {
    ultimoDia: hoje,
    sequencia,
    recorde: Math.max(e.recorde, sequencia),
    perdaoEm,
    respostas: e.respostas + 1,
    acertos: e.acertos + (acertou ? 1 : 0),
  };
}

/**
 * Junta o quiz da nuvem com o do aparelho.
 *
 * Chamada no login e em toda abertura de app com sessão aberta, porque é aí
 * que as duas cópias se encontram. Sem ela, uma das duas simplesmente vencia e
 * a outra sumia — foi assim que uma resposta dada e recarregada em seguida
 * voltou ao estado de não respondida.
 *
 * As regras vêm do que cada campo significa:
 *
 * - `ultimoDia` e `sequencia` andam JUNTOS. Uma sequência é sempre "tantos
 *   dias até o dia X"; pegar o dia de um lado e o número do outro produziria
 *   um número que nunca existiu. Ganha o lado que respondeu por último;
 * - `recorde` é o máximo dos dois. Recorde não diminui, nem trocando de
 *   aparelho;
 * - `perdaoEm` é o mais recente. Perdão gasto num celular está gasto no outro,
 *   senão bastaria alternar aparelhos para nunca perder uma sequência;
 * - `respostas` e `acertos` são o MÁXIMO, nunca a soma. É a mesma pessoa
 *   respondendo uma vez por dia: somar contaria de novo cada resposta que já
 *   estava nos dois lados.
 */
export function mesclarQuiz(nuvem?: EstadoQuiz, local?: EstadoQuiz): EstadoQuiz | undefined {
  if (!nuvem) return local;
  if (!local) return nuvem;

  // Quem respondeu por último leva o par (dia, sequência). Empate no mesmo dia
  // fica com a sequência maior: as duas descrevem o mesmo dia, e a menor só
  // pode ser uma cópia que ficou para trás.
  const dias = !nuvem.ultimoDia
    ? local
    : !local.ultimoDia
      ? nuvem
      : diasEntre(nuvem.ultimoDia, local.ultimoDia) > 0
        ? local
        : diasEntre(nuvem.ultimoDia, local.ultimoDia) < 0
          ? nuvem
          : nuvem.sequencia >= local.sequencia
            ? nuvem
            : local;

  const perdaoMaisNovo =
    !nuvem.perdaoEm
      ? local.perdaoEm
      : !local.perdaoEm
        ? nuvem.perdaoEm
        : diasEntre(nuvem.perdaoEm, local.perdaoEm) > 0
          ? local.perdaoEm
          : nuvem.perdaoEm;

  return {
    ultimoDia: dias.ultimoDia,
    sequencia: dias.sequencia,
    recorde: Math.max(nuvem.recorde, local.recorde),
    perdaoEm: perdaoMaisNovo,
    respostas: Math.max(nuvem.respostas, local.respostas),
    acertos: Math.max(nuvem.acertos, local.acertos),
  };
}

// ---- Qual pergunta sai hoje -------------------------------------------------

/**
 * Primeiro dia da rotação. Todo mundo no mundo vê a MESMA pergunta no mesmo
 * dia, e é só por isso que dá para dizer "62% acertaram hoje" — a frase seria
 * mentira se cada um tivesse a sua.
 *
 * Mexer nesta data embaralha a rotação de quem já está no meio dela. Depois
 * do lançamento, não se mexe.
 */
const EPOCA = "2026-09-01";

/**
 * A pergunta 1 fica FORA da rotação diária: ela é a do onboarding, respondida
 * por todo mundo no primeiro minuto de app. Sem esta reserva, um dia por ciclo
 * o quiz do dia seria uma pergunta que a pessoa já respondeu, e a explicação
 * repetida é o tipo de coisa que faz alguém parar de abrir.
 */
export function perguntaDoOnboarding(perguntas: Pergunta[]): Pergunta | null {
  return perguntas[0] ?? null;
}

/** A pergunta do dia, igual para todo mundo naquela data. */
export function perguntaDoDia(perguntas: Pergunta[], dia: string): Pergunta | null {
  const rotacao = perguntas.slice(1);
  if (!rotacao.length) return perguntas[0] ?? null;
  const n = diasEntre(EPOCA, dia);
  // `%` de JavaScript devolve negativo para entrada negativa (alguém com a
  // data do aparelho antes da época, ou testando no passado). O `+ tamanho`
  // traz de volta para dentro da lista.
  const i = ((n % rotacao.length) + rotacao.length) % rotacao.length;
  return rotacao[i];
}
