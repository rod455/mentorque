// As duas regras de DATA de uma aula. Sem import nenhum, de propósito.
//
// Elas moravam no `content.ts`, que importa meio mundo e sem extensão de
// arquivo. O node puro não resolve aquele import, então uma conferência que
// quisesse exercitar estas regras teria de copiá-las, e regra copiada é regra
// que diverge: um dia alguém conserta um lado só e a conferência passa a
// aprovar um comportamento que o app não tem mais.
//
// Aqui elas ficam num arquivo folha, importável por qualquer um, e o
// `content.ts` reexporta para quem já as usava. Ninguém precisou mudar.

/**
 * `addedAt` É A DATA DE PUBLICAÇÃO, e desde 03/09/2026 ela também AGENDA.
 *
 * Aula com data no futuro ainda não saiu: ela fica escrita no repositório, some
 * do catálogo remoto e não aparece no app até o dia chegar. Foi o que permitiu
 * casar a aula com a estreia do vídeo no YouTube, que é agendado lá e precisava
 * ser agendado aqui.
 *
 * Um campo só, e não um `publicaEm` novo ao lado: duas datas por aula seriam
 * duas chances de elas discordarem, e a pergunta "qual delas manda?" não tem
 * resposta boa. "O dia em que isto foi ao ar" já era o significado de `addedAt`.
 *
 * Os dois casos de borda vão para o lado de PUBLICAR, e é deliberado: sem data
 * é conteúdo antigo, e data ilegível é engano de digitação. Sumir com uma aula
 * boa por causa de um campo torto seria pior que mostrá-la.
 */
export function lessonPublicada(l: { addedAt?: string }, now = new Date()): boolean {
  if (!l.addedAt) return true;
  const d = new Date(l.addedAt + "T00:00:00");
  if (isNaN(d.getTime())) return true;
  return d.getTime() <= now.getTime();
}

/**
 * Conteúdo "Novo": publicado (addedAt) há no máximo 7 dias. Enquanto durar, vai
 * para a 1ª posição do "Para você" com o selo, e some antes se o usuário
 * concluir ou salvar a aula.
 */
export function isNewLesson(l: { addedAt?: string }, now = new Date()): boolean {
  if (!l.addedAt) return false;
  const d = new Date(l.addedAt + "T00:00:00");
  if (isNaN(d.getTime())) return false;
  // A data no futuro precisa ser barrada AQUI também, e não é preciosismo: a
  // conta `agora - data` fica NEGATIVA para o futuro, e negativo é menor que
  // sete dias. Sem esta linha, aula agendada seria a mais "nova" de todas e
  // subiria para o topo do "Para você" antes de existir.
  if (!lessonPublicada(l, now)) return false;
  return now.getTime() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
}
