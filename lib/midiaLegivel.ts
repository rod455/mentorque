// O gasto de anúncio dito de um jeito que não esconde campanha parada.
//
// POR QUE ISTO EXISTE (02/10/2026). Em 24/09 o agente de Mídia leu o gasto da
// busca como "uns R$ 20 por dia" e propôs etiquetar a URL dela com argumento de
// R$ 640 por mês. A campanha tinha PARADO naquele mesmo dia. O número que ele
// leu era R$ 163,59 numa janela de oito datas, e o dinheiro estava todo nas
// primeiras: o total estava certo e a leitura estava errada. Custou uma proposta
// inteira, e oito dias depois a ação ainda estava na lista do dono, já
// condicionada.
//
// É a MESMA doença de setembro, em outro instrumento: número que parece medida
// e é artefato da janela. A cura que esta casa já escolheu é a fonte mandar a
// frase pronta e o leitor só imprimir, como em lib/retratoLegivel.ts (coortes) e
// lib/alarmeDeErros.ts (erros). Aqui a frase diz três coisas que o total sozinho
// nunca diz: a janela de verdade, o ritmo dos últimos dias contra o dos
// primeiros, e a data da leitura.
//
// E A IMPRESSÃO ANTES DO GASTO, que foi a prova independente de 02/10: quando
// uma campanha para de entregar, a impressão cai PRIMEIRO e o gasto ainda
// escorre por uns dias. Então impressão em queda com gasto parecido é aviso
// adiantado, e é dito como suspeita, não como prova: a causa mora no painel
// (orçamento, lance, negativa ampla, outra campanha atendendo a mesma busca) e
// daqui não dá para saber qual é.

/** Um dia de gasto, como as duas fontes entregam (os nomes diferem). */
export type DiaDeGasto = {
  dia: string;
  /** `custo` no Google, `gasto` no Meta. */
  custo?: number | null;
  gasto?: number | null;
  impressoes?: number | null;
  cliques?: number | null;
};

export type RitmoDeGasto = {
  /** Reais por dia nos primeiros dias da janela. */
  inicio: number;
  /** Reais por dia nos últimos dias da janela. */
  fim: number;
  /** Quanto o ritmo caiu, de 0 a 1. Zero quando subiu. */
  queda: number;
};

/** Quantos dias de cada ponta entram na comparação de ritmo. */
export const DIAS_DA_PONTA = 3;

/**
 * Abaixo disto, não é economia: é parada.
 *
 * 0,7 (ritmo caiu 70% ou mais) e não 0,5, porque gasto de anúncio oscila por
 * dia da semana e leilão, e alarme que dispara com oscilação normal é alarme
 * que alguém desliga. A busca de 24/09 caiu mais de 95%.
 */
export const QUEDA_QUE_E_PARADA = 0.7;

/** O gasto do dia, qualquer que seja o nome da coluna na fonte. */
/**
 * A segunda prova de parada, e ela nasceu de a primeira não bastar.
 *
 * Nos números reais de 24/09 a queda do ritmo de três dias deu 67%, abaixo do
 * limiar, porque o dia 22 ainda tinha gastado R$ 18,78: a média de três dias
 * DILUI o fim. O sinal que existia de verdade era outro, e mais simples: nos
 * dois últimos dias não saiu praticamente nada, contra R$ 15 por dia de média
 * na janela.
 *
 * Então são dois gatilhos independentes, de propósito. "O ritmo caiu muito" e
 * "o dinheiro secou agora" não são a mesma frase, e a segunda é a que pega
 * parada recente, que é justamente a que a janela esconde.
 */
export const DIAS_DO_FIM = 2;

/** O fim da janela é "seco" quando gasta até isto da média diária dela. */
export const FIM_SECO = 0.1;

export function gastoDoDia(d: DiaDeGasto): number {
  const v = Number(d?.custo ?? d?.gasto ?? 0);
  return Number.isFinite(v) ? v : 0;
}

const media = (ns: number[]) => (ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : 0);

/**
 * O ritmo das duas pontas da janela.
 *
 * `null` quando a janela é curta demais para ter duas pontas, e nesse caso a
 * frase diz isso em vez de comparar três dias com eles mesmos.
 */
export function ritmoDeGasto(porDia: DiaDeGasto[], dias = DIAS_DA_PONTA): RitmoDeGasto | null {
  const ordenada = [...(porDia ?? [])].filter((d) => d?.dia).sort((a, b) => a.dia.localeCompare(b.dia));
  if (ordenada.length < dias * 2) return null;
  const inicio = media(ordenada.slice(0, dias).map(gastoDoDia));
  const fim = media(ordenada.slice(-dias).map(gastoDoDia));
  const queda = inicio > 0 ? Math.max(0, (inicio - fim) / inicio) : 0;
  return { inicio, fim, queda };
}

const real = (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`;
const pct = (n: number) => `${Math.round(n * 100)}%`;

/**
 * A frase do retrato sobre uma fonte de gasto.
 *
 * Sempre carrega a janela (primeiro e último dia com dado) e a data da leitura,
 * porque número de plataforma muda depois de publicado: em 02/10 a semana de 17
 * a 23/09 leu R$ 8,89 menos do que tinha lido na semana anterior, porque o
 * Google revisa dia fechado para baixo. Citar a data da leitura é o que
 * transforma essa diferença em revisão conhecida em vez de contradição.
 */
export function linhaDeGasto(
  fonte: string,
  porDia: DiaDeGasto[],
  lidoEm: string,
): { texto: string; parada: boolean; motivo: string } {
  const ordenada = [...(porDia ?? [])].filter((d) => d?.dia).sort((a, b) => a.dia.localeCompare(b.dia));
  if (!ordenada.length) {
    return { texto: `${fonte}: nenhum dia de gasto no pacote lido em ${lidoEm}.`, parada: false, motivo: "sem dado" };
  }

  const total = ordenada.reduce((s, d) => s + gastoDoDia(d), 0);
  const janela = `${ordenada[0]!.dia} a ${ordenada[ordenada.length - 1]!.dia}`;
  const base = `${fonte}: ${real(total)} em ${ordenada.length} dia(s), janela ${janela}, lido em ${lidoEm}`;

  const r = ritmoDeGasto(ordenada);
  if (!r) {
    return {
      texto: `${base}. Janela curta demais para dizer se o ritmo caiu (precisa de ${DIAS_DA_PONTA * 2} dias).`,
      parada: false,
      motivo: "janela curta",
    };
  }

  const ritmo = `Ritmo: ${real(r.inicio)} por dia nos ${DIAS_DA_PONTA} primeiros dias contra ${real(r.fim)} nos ${DIAS_DA_PONTA} últimos`;

  // A IMPRESSÃO CAI PRIMEIRO. Vale como aviso adiantado, e só quando há
  // impressão nos dois lados: fonte que não manda impressão não ganha
  // suspeita inventada.
  const impInicio = media(ordenada.slice(0, DIAS_DA_PONTA).map((d) => Number(d.impressoes ?? 0)));
  const impFim = media(ordenada.slice(-DIAS_DA_PONTA).map((d) => Number(d.impressoes ?? 0)));
  const temImpressao = impInicio > 0;
  const quedaImp = temImpressao ? Math.max(0, (impInicio - impFim) / impInicio) : 0;

  // O FIM SECO: média diária da janela contra os dois últimos dias. Pega a
  // parada recente que a média de três dias dilui, que foi o caso de 24/09.
  const mediaDaJanela = total / ordenada.length;
  const fimCurto = media(ordenada.slice(-DIAS_DO_FIM).map(gastoDoDia));
  const secou = mediaDaJanela > 0 && fimCurto <= mediaDaJanela * FIM_SECO;

  if (r.queda >= QUEDA_QUE_E_PARADA || secou) {
    const comImp = temImpressao ? `, e a impressao caiu ${pct(quedaImp)} no mesmo periodo` : "";
    const sinal = secou
      ? `Nos ${DIAS_DO_FIM} ultimos dias saiu ${real(fimCurto)} por dia contra ${real(mediaDaJanela)} de media da janela`
      : `CAIU ${pct(r.queda)}`;
    return {
      texto:
        `${base}. ${ritmo}. ${sinal}${comImp}. ` +
        `ISTO PARECE CAMPANHA QUE PAROU DE ENTREGAR, e nao economia. O total da janela esconde isso porque o dinheiro esta nas primeiras datas. ` +
        `A causa mora no painel (orcamento, lance, negativa ampla, outra campanha atendendo a mesma busca) e daqui NAO da para dizer qual: o numero que resolve e a parcela de impressoes perdida por orcamento e por classificacao.`,
      parada: true,
      motivo: secou
        ? `fim da janela seco (${real(fimCurto)} por dia contra ${real(mediaDaJanela)} de media), ritmo caiu ${pct(r.queda)}`
        : `ritmo caiu ${pct(r.queda)}`,
    };
  }

  // Impressão caindo com gasto parecido: aviso ADIANTADO, dito como suspeita.
  if (temImpressao && quedaImp >= QUEDA_QUE_E_PARADA) {
    return {
      texto:
        `${base}. ${ritmo}. A IMPRESSAO CAIU ${pct(quedaImp)} com o gasto quase igual, e a impressao cai ANTES do gasto: ` +
        `se isto for parada, o gasto cai nos proximos dias. E suspeita, nao prova.`,
      parada: false,
      motivo: `impressao caiu ${pct(quedaImp)} antes do gasto`,
    };
  }

  return { texto: `${base}. ${ritmo}.`, parada: false, motivo: "" };
}

/** As fontes de gasto, na ordem em que aparecem no retrato. */
export const FONTES_DE_GASTO = ["google_ads", "meta_ads"] as const;
