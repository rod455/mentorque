// A venda avulsa no retrato: a frase que os agentes leem todo dia. Pura.
//
// POR QUE (14/11/2026). A 3.4 foi a produção com a compra avulsa pelo Stripe
// e o retrato não lia nada dela. A view `venda_avulsa_resumo` traz os degraus
// em 7 e 30 dias (supabase/venda_avulsa_resumo.sql); esta função escreve a
// frase, e `npm run conferir:avulsa` a EXECUTA com entradas conhecidas.
//
// Duas ressalvas vão na frase sempre, porque sem elas o número engana:
//   - `viram` e `tocaram` só existem desde 14/11 21h50 UTC (antes, o banco
//     recusava o evento); um zero anterior é buraco, não desinteresse;
//   - quem levou recusa numa versão ABAIXO da 3.4 não viu oferta nenhuma, só
//     o Premium: as recusas medem demanda, não a oferta.

export type LinhaVendaAvulsa = {
  janela: string;
  podiam_ver: number;
  viram: number;
  tocaram: number;
  toques_por_produto: Record<string, number> | null;
  compras: number;
  compras_por_produto: Record<string, number> | null;
  receita_centavos: number;
  recusas: number;
};

export const EVENTOS_MEDIDOS_DESDE = "2026-11-14T21:50:00Z";

function reais(centavos: number): string {
  return `R$ ${Math.floor(centavos / 100)},${String(Math.abs(centavos) % 100).padStart(2, "0")}`;
}

function porProduto(m: Record<string, number> | null | undefined): string {
  const partes = Object.entries(m ?? {}).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`);
  return partes.length ? ` (${partes.join(", ")})` : "";
}

export function fraseDaVendaAvulsa(linhas: LinhaVendaAvulsa[] | null | undefined): { texto: string; semLeitura: boolean } {
  const l7 = (linhas ?? []).find((l) => l.janela === "7d");
  const l30 = (linhas ?? []).find((l) => l.janela === "30d");
  if (!l7 || !l30) {
    return { texto: "Venda avulsa: SEM LEITURA hoje (a view venda_avulsa_resumo nao respondeu); sem leitura nao e zero", semLeitura: true };
  }
  const um = (l: LinhaVendaAvulsa) =>
    `${l.podiam_ver} podiam ver os pacotes, ${l.viram} viram, ${l.tocaram} abriram o checkout${porProduto(l.toques_por_produto)}, ` +
    `${l.compras} compraram${porProduto(l.compras_por_produto)} (${reais(l.receita_centavos)}), ${l.recusas} voltaram e levaram recusa de limite`;
  return {
    texto:
      `Venda avulsa, 7 dias: ${um(l7)}. 30 dias: ${um(l30)}. ` +
      `"Viram" e "abriram" so medem desde 14/11 21h50 UTC. Recusa em versao abaixo da 3.4 nao viu oferta, so o Premium.`,
    semLeitura: false,
  };
}
