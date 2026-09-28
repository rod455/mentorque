// As regras da lista de "Versão / motor", separadas da rota que busca na FIPE.
//
// POR QUE ISTO EXISTE (28/09/2026). Chegou um relato com foto: a pessoa estava
// cadastrando um Hyundai Creta Ultimate 2.0 22/23, a lista de versões terminava
// em "Creta Limited 1.0 TB 12V Flex Aut." e o carro dela não estava lá. O dono
// perguntou por que a gente não tinha aquele modelo.
//
// A gente tinha. A FIPE tem, e a NOSSA rota devolvia: `Creta Ultimate 2.0 16V
// Flex Aut.` vinha na lista, na posição 29 de 29. O app jogava fora antes de
// desenhar, porque a tela cortava em 12. O último item que a pessoa via era
// exatamente o décimo segundo.
//
// Tinha mais de um corte, e nenhum deles sabia do outro:
//
//   1. a TELA cortava em 12 (`Cars.tsx`);
//   2. a ROTA cortava em 30, e o Gol voltava com exatos 30, ou seja, cortado;
//   3. e o filtro por ANO só rodava para modelos com até 20 versões, então
//      justamente os carros populares (Creta 29, Gol 30+) perdiam o filtro e
//      recebiam uma lista com versões de todos os anos desde os anos 90.
//
// O terceiro é o pior dos três, e é contraintuitivo: o modelo com MAIS versões
// é o que mais precisa de filtro, e era o único que não recebia.
//
// A REGRA QUE FICA, e ela vale para qualquer lista de escolha deste app:
// **na dúvida, MOSTRA.** O custo de exibir uma versão a mais é a pessoa rolar
// mais um pouco; o custo de esconder a dela é ela ir embora achando que o
// carro não cabe aqui, sem erro, sem relato e sem aparecer em métrica nenhuma.
// É a mesma lição do catálogo de carro (04/09, Fiesta e Celta) e da de moto
// (27/09, a família CG sem nome de tanque), agora num terceiro lugar.

/**
 * Quantas versões a rota devolve, no máximo.
 *
 * Existe para não mandar uma lista sem fim quando a FIPE tem centenas de
 * variações do mesmo nome. Sessenta cobre com folga o maior caso que medimos
 * (Gol, mais de 30 antes do filtro de ano), e é o MESMO número dos dois lados:
 * um teto na tela menor que o da rota é o defeito de 28/09 voltando.
 */
export const MAX_VERSOES = 60;

/**
 * Até quantas versões vale pagar a conferência de ano.
 *
 * Cada conferência é uma chamada HTTP à FIPE, e por isso existia um teto. Ele
 * era 20, que é MENOS do que os modelos populares têm: o teto desligava o
 * filtro exatamente onde ele era mais necessário. Agora ele vale para todas as
 * versões que a rota pode devolver, e quem segura o custo é o orçamento de
 * tempo abaixo, não um número que exclui o Gol.
 */
export const TETO_PARA_FILTRAR_POR_ANO = MAX_VERSOES;

/**
 * Quanto tempo a rota gasta conferindo anos antes de desistir.
 *
 * A rota tem `maxDuration = 15`. Sete segundos deixam folga para a resposta, e
 * o que não deu tempo de conferir NÃO é descartado: vira dúvida, e dúvida
 * mostra. Na segunda chamada o cache do dia já responde na hora.
 */
export const ORCAMENTO_DE_ANO_MS = 7000;

/** De quantas em quantas versões a rota pergunta o ano à FIPE. */
export const LOTE_DE_ANO = 8;

/**
 * Esta versão serve para o ano que a pessoa escolheu?
 *
 * `anos` é a resposta da FIPE para aquela versão (códigos como "2022-1"), ou
 * `null` quando não deu para saber: a chamada falhou, ou o orçamento de tempo
 * acabou antes dela.
 *
 * **Na dúvida devolve `true`.** Não é descuido, é a regra: esconder a versão
 * de alguém por causa de um timeout nosso é o defeito mais caro que esta tela
 * pode ter, e é silencioso dos dois lados (a pessoa não reclama, a gente não
 * mede).
 */
export function versaoServeParaOAno(anos: string[] | null | undefined, ano: number | null): boolean {
  if (!ano) return true;
  if (!anos || anos.length === 0) return true;
  return anos.some((c) => String(c).startsWith(String(ano)));
}
