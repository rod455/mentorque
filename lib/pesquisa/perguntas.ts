// A pesquisa curta dentro do app (16/11/2026, plano de receita). Pura.
//
// POR QUE. Toda decisão de preço da casa até aqui foi tomada sem perguntar a
// ninguém quanto gasta com o carro. Esta pesquisa junta, em uma folha, as
// quatro coisas que o plano precisa saber antes de pôr dinheiro em mídia:
//   1. o teste de Sean Ellis ("como se sentiria se o app deixasse de
//      existir?"): 40% ou mais de "muito decepcionado" é o sinal de que o
//      produto encaixou;
//   2. quanto a pessoa gastou com o carro nos últimos 3 meses (passado, não
//      "pagaria?", como manda o livro The Mom Test);
//   3. se o carro tem seguro (o denominador da frente do seguro);
//   4. quanto pagaria por "Resolver este problema". É a ÚNICA pergunta
//      hipotética, e vale como faixa, não como preço. A pesquisa completa de
//      Van Westendorp tem quatro perguntas de preço; aqui ficou uma, porque
//      folha longa não junta as 40 respostas de que o plano precisa.
// E um campo livre, opcional.
//
// QUEM VÊ: quem já voltou ao app (começou há 3 dias ou mais), uma vez só.
// Respondida ou dispensada, some para sempre.
//
// `npm run conferir:pesquisa` executa as funções daqui com entradas conhecidas.

export const PESQUISA_ID = "receita-2026-11";

export const PERGUNTAS = {
  sentir: ["muito", "pouco", "nada"],
  gasto: ["nada", "ate500", "ate2000", "mais"],
  seguro: ["sim", "nao", "naosei"],
  preco: ["nada", "ate5", "ate10", "ate20", "mais"],
} as const;

export type Pergunta = keyof typeof PERGUNTAS;
export type Respostas = { [K in Pergunta]?: (typeof PERGUNTAS)[K][number] } & { livre?: string };

export const DIAS_PARA_PERGUNTAR = 3;
export const CHAVE_FEITA = "mentorque.pesquisaReceita";
export const TETO_DO_LIVRE = 500;

/** Só o que é resposta de verdade passa; o resto é descartado em silêncio. */
export function respostasValidas(entrada: unknown): Respostas {
  const e = (entrada && typeof entrada === "object" ? entrada : {}) as Record<string, unknown>;
  const fora: Respostas = {};
  for (const p of Object.keys(PERGUNTAS) as Pergunta[]) {
    const v = e[p];
    if (typeof v === "string" && (PERGUNTAS[p] as readonly string[]).includes(v)) {
      (fora as Record<string, string>)[p] = v;
    }
  }
  if (typeof e.livre === "string" && e.livre.trim()) fora.livre = e.livre.trim().slice(0, TETO_DO_LIVRE);
  return fora;
}

/** A folha só pode ser enviada com as quatro perguntas de escolha respondidas. */
export function completa(r: Respostas): boolean {
  return (Object.keys(PERGUNTAS) as Pergunta[]).every((p) => r[p] !== undefined);
}

export function mostrarPesquisa(o: { comecouEm: string | null | undefined; agora: Date; jaFeita: boolean }): boolean {
  if (o.jaFeita || !o.comecouEm) return false;
  const desde = new Date(o.comecouEm).getTime();
  if (!Number.isFinite(desde)) return false;
  return o.agora.getTime() - desde >= DIAS_PARA_PERGUNTAR * 86_400_000;
}
