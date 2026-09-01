// Há quanto tempo cada fonte externa parou de escrever.
//
// POR QUE ISTO EXISTE (01/09/2026): a coleta de métricas externas parou em
// 23/08 e ninguém percebeu por nove dias. O retrato diário continuou
// imprimindo os pacotes daquele dia como se fossem de hoje, e o relatório do
// Diretor quase publicou "Stripe: 0 assinaturas" com DOIS clientes reais
// pagando. Dado velho apresentado sem idade é pior que dado ausente: o
// ausente faz perguntar, o velho faz decidir errado.
//
// E tinha uma segunda armadilha, pior: a consulta do retrato pega só os
// últimos 10 dias. No dia 03/09 o pacote de 23/08 cairia fora da janela e a
// seção inteira sumiria em silêncio, sem distinguir "não há o que coletar" de
// "a coleta morreu". É exatamente a diferença entre ZERO e SEM MEDIÇÃO que a
// equipe já tinha decidido nunca mais confundir.
//
// Puro de propósito: sem Supabase, sem rede, conferível por
// scripts/verifica-frescor.ts sem subir nada.

/** A partir de quantos dias sem escrever uma fonte é considerada parada. */
export const DIAS_ATE_PARADA = 2;

export type PacoteDeFonte = { fonte: string; dia: string };

export type FrescorDaFonte = {
  fonte: string;
  /** O dia do pacote mais recente desta fonte (yyyy-mm-dd). */
  ultimoDia: string;
  /** Quantos dias se passaram desde ele. Zero é coleta de hoje. */
  diasParado: number;
  /** Passou de DIAS_ATE_PARADA: o valor não pode ser lido como atual. */
  parada: boolean;
};

function diasEntreDias(de: string, ate: string): number {
  const a = Date.parse(`${de}T00:00:00Z`);
  const b = Date.parse(`${ate}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86400000));
}

/**
 * O frescor de cada fonte, da mais parada para a mais fresca.
 *
 * A ORDEM É DELIBERADA: quem lê de cima para baixo bate primeiro no que está
 * quebrado. Ordenar por nome esconderia a fonte morta no meio do alfabeto.
 */
export function frescorDasFontes(linhas: PacoteDeFonte[], hoje: string): FrescorDaFonte[] {
  const ultimoPorFonte = new Map<string, string>();
  for (const l of linhas) {
    if (!l?.fonte || !l?.dia) continue;
    const atual = ultimoPorFonte.get(l.fonte);
    if (!atual || l.dia > atual) ultimoPorFonte.set(l.fonte, l.dia);
  }

  return [...ultimoPorFonte.entries()]
    .map(([fonte, ultimoDia]) => {
      const diasParado = diasEntreDias(ultimoDia, hoje);
      return { fonte, ultimoDia, diasParado, parada: diasParado > DIAS_ATE_PARADA };
    })
    .sort((a, b) => b.diasParado - a.diasParado || a.fonte.localeCompare(b.fonte));
}

/**
 * Uma frase para quem só vai ler uma linha.
 *
 * Devolve null quando está tudo em dia, porque aviso que aparece todo dia
 * vira paisagem e deixa de ser aviso.
 */
export function avisoDeColeta(frescor: FrescorDaFonte[]): string | null {
  const paradas = frescor.filter((f) => f.parada);
  if (!paradas.length) return null;
  if (paradas.length === frescor.length) {
    return `A coleta de fontes externas está PARADA há ${paradas[0].diasParado} dias (nenhuma fonte escreveu desde ${paradas[0].ultimoDia}). Os valores abaixo são daquele dia, não de hoje.`;
  }
  const nomes = paradas.map((f) => `${f.fonte} (${f.diasParado}d)`).join(", ");
  return `Fontes paradas: ${nomes}. Os valores delas são do último dia coletado, não de hoje.`;
}
