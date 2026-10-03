// A escada da aquisição: UM dono por degrau, e o que não se soma não se soma.
//
// POR QUE ISTO EXISTE (03/10/2026). O dono perguntou, depois de uma noite de
// correções: "estamos mapeando errado AppsFlyer, Google Ads, Play Store e
// Apple. Temos acesso a TODAS. Precisamos medir direito."
//
// O diagnóstico, e ele não é falta de acesso: as quatro fontes respondem
// perguntas DIFERENTES, e a casa vinha misturando as respostas. Os casos reais:
//
//   · o painel do Google disse 235 conversões em 7 dias e o painel da Meta 194
//     instalações na mesma semana. Somar dá 429, e o Play Console inteiro
//     registrou uns 140 na semana. Os dois painéis contam A MESMA PESSOA, cada
//     um reivindicando para si: SOMAR PAINEL É CONTAR GENTE DUAS VEZES;
//   · `conversões` do Google Ads não é instalação: é a soma das ações de
//     conversão daquela conta. A prova é aritmética: 33,6 por dia reivindicados
//     contra 20 por dia que a Play inteira registra, somando todas as origens;
//   · a AppsFlyer é a única que ARBITRA (último toque), e por isso é a única
//     que pode dizer QUEM trouxe. Mas ela só vê o aparelho onde o SDK subiu, e
//     em 03/10 isso eram 77% dos Android. Ela é proporção, nunca total.
//
// A REGRA QUE ESTE ARQUIVO IMPÕE: cada degrau tem um dono, e número de outro
// dono não entra no lugar dele nem por aproximação. Onde não há dono, o degrau
// devolve `null` com o motivo escrito, porque "não sei" é resposta e número
// emprestado não é.

/** Quem é a ÚNICA fonte legítima de cada degrau, e por quê. */
export const DONO_DO_DEGRAU = {
  dinheiro: "painéis de anúncio (Google Ads e Meta), porque só eles sabem quanto saiu da conta",
  instalacaoTotal: "as lojas (Play Console e App Store), porque só elas veem o aparelho que instalou e nunca abriu",
  instalacaoPorFonte: "AppsFlyer, porque arbitrar entre redes que reivindicam a mesma pessoa é o ofício de um MMP",
  contas: "nosso banco, porque conta criada é fato nosso",
  receita: "Stripe e RevenueCat, porque dinheiro recebido é fato de quem cobrou",
} as const;

/** As três recusas que esta casa pagou para aprender. */
export const RECUSAS = {
  somarPaineis:
    "Somar a instalação que o Google reivindica com a que a Meta reivindica conta a mesma pessoa duas vezes: " +
    "os dois reivindicam, e quem decide de quem é cada uma é o MMP.",
  conversaoComoInstalacao:
    "`conversoes` do Google Ads e a soma das acoes de conversao da conta, nao a contagem de instalacao. " +
    "Em 03/10 ele reivindicava 33,6 por dia e a Play inteira registrava 20 por dia, somando todas as origens.",
  mmpComoTotal:
    "A AppsFlyer so ve o aparelho onde o SDK subiu, e em 03/10 isso eram 77% dos Android. " +
    "Ela responde PROPORCAO entre fontes, nunca o total de instalacoes.",
} as const;

export type Degrau = {
  degrau: string;
  dono: string;
  valor: number | null;
  unidade: string;
  porFonte: { fonte: string; valor: number }[];
  ressalvas: string[];
  /** Por que o valor é nulo. Vazio quando o valor existe. */
  naoSei: string;
};

const numero = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

/**
 * DINHEIRO: a única soma legítima entre painéis.
 *
 * Gasto do Google mais gasto da Meta é dinheiro que saiu da conta do dono, cada
 * real em um lugar só. É o oposto de somar instalação reivindicada, onde a mesma
 * pessoa aparece nos dois.
 */
export function degrauDoDinheiro(pacotes: Record<string, unknown>): Degrau {
  const porFonte: { fonte: string; valor: number }[] = [];
  for (const [fonte, chave] of [["google_ads", "custo7d"], ["meta_ads", "gasto7d"]] as const) {
    const v = numero((pacotes[fonte] as Record<string, unknown> | undefined)?.[chave]);
    if (v !== null) porFonte.push({ fonte, valor: Number(v.toFixed(2)) });
  }
  const total = porFonte.reduce((s, f) => s + f.valor, 0);
  return {
    degrau: "dinheiro (7 dias)",
    dono: DONO_DO_DEGRAU.dinheiro,
    valor: porFonte.length ? Number(total.toFixed(2)) : null,
    unidade: "R$",
    porFonte,
    ressalvas: porFonte.length < 2 ? ["falta a leitura de um dos dois painéis nesta coleta"] : [],
    naoSei: porFonte.length ? "" : "nenhum painel de anúncio foi coletado",
  };
}

/**
 * INSTALAÇÃO POR FONTE: só a AppsFlyer, e sempre com a ressalva do SDK.
 *
 * NUNCA do painel. O painel do Google reivindica e o da Meta reivindica, e os
 * dois estão falando da mesma pessoa; o MMP é quem decide.
 */
export function degrauDaInstalacaoPorFonte(appsflyer: unknown): Degrau {
  const p = appsflyer as
    | { pagas?: number; organicas?: number; instalacoes?: number; android?: { linhas?: { fonte: string; instalacoes: number }[] } }
    | undefined;
  const linhas = p?.android?.linhas ?? [];
  const porFonte = linhas
    .filter((l) => numero(l.instalacoes) !== null)
    .map((l) => ({ fonte: l.fonte, valor: l.instalacoes }))
    .sort((a, b) => b.valor - a.valor);
  const total = numero(p?.instalacoes);
  return {
    degrau: "instalação por fonte (7 dias)",
    dono: DONO_DO_DEGRAU.instalacaoPorFonte,
    valor: total,
    unidade: "instalações",
    porFonte,
    ressalvas: [RECUSAS.mmpComoTotal],
    naoSei: total === null ? "a AppsFlyer ainda não foi coletada" : "",
  };
}

/**
 * INSTALAÇÃO TOTAL: das lojas, e hoje a casa só tem metade.
 *
 * A Apple entra pelo relatório de vendas (`app_store_downloads`). A Play NÃO
 * entra: o coletor dela traz só ANR e crash, e o número de aquisição do Play
 * Console não está em coletor nenhum. Isso é buraco declarado, não estimado: o
 * Android é 98% da base, então o total que falta é quase o total inteiro.
 */
export function degrauDaInstalacaoTotal(pacotes: Record<string, unknown>): Degrau {
  const apple = numero((pacotes["app_store_downloads"] as Record<string, unknown> | undefined)?.["downloads7d"]);
  const porFonte = apple !== null ? [{ fonte: "app_store", valor: apple }] : [];
  return {
    degrau: "instalação total (7 dias)",
    dono: DONO_DO_DEGRAU.instalacaoTotal,
    valor: null,
    unidade: "instalações",
    porFonte,
    ressalvas: [],
    // SEMPRE nulo enquanto a Play não for coletada, mesmo com a Apple lida: dar
    // o número da Apple como "total" faria o Android, que é 98% da base, sumir.
    naoSei:
      "a aquisição do Play Console não está em coletor nenhum (o `play_console` traz só ANR e crash), " +
      "e o Android é 98% da base" + (apple !== null ? "; só o lado da Apple está lido" : ""),
  };
}

/**
 * CUSTO POR INSTALAÇÃO, e só onde as duas pontas existem de verdade.
 *
 * O numerador vem do painel daquela fonte (dinheiro é dele). O denominador vem
 * do MMP, NUNCA da reivindicação do próprio painel, que é o erro que esta casa
 * quase publicou em 03/10. Fonte sem as duas pontas devolve `null`.
 */
export function custoPorInstalacao(
  dinheiro: Degrau,
  instalacao: Degrau,
  deParaFonte: Record<string, string>,
): { fonte: string; custo: number; instalacoes: number; porInstalacao: number }[] {
  const saida: { fonte: string; custo: number; instalacoes: number; porInstalacao: number }[] = [];
  for (const d of dinheiro.porFonte) {
    const nomeNoMmp = deParaFonte[d.fonte];
    if (!nomeNoMmp) continue;
    const i = instalacao.porFonte.find((x) => x.fonte === nomeNoMmp);
    if (!i || i.valor <= 0) continue;
    saida.push({
      fonte: d.fonte,
      custo: d.valor,
      instalacoes: i.valor,
      porInstalacao: Number((d.valor / i.valor).toFixed(2)),
    });
  }
  return saida;
}

/** O nome de cada painel dentro da AppsFlyer. */
export const FONTE_NO_MMP: Record<string, string> = {
  meta_ads: "Facebook Ads",
  google_ads: "googleadwords_int",
};

export type EscadaDaAquisicao = {
  degraus: Degrau[];
  custoPorInstalacao: { fonte: string; custo: number; instalacoes: number; porInstalacao: number }[];
  recusas: string[];
};

export function montaEscada(pacotes: Record<string, unknown>): EscadaDaAquisicao {
  const dinheiro = degrauDoDinheiro(pacotes);
  const porFonte = degrauDaInstalacaoPorFonte(pacotes["appsflyer"]);
  const total = degrauDaInstalacaoTotal(pacotes);
  return {
    degraus: [dinheiro, total, porFonte],
    custoPorInstalacao: custoPorInstalacao(dinheiro, porFonte, FONTE_NO_MMP),
    // As recusas viajam com a escada, porque elas são o que impede o próximo
    // leitor de refazer a conta errada. Regra que mora longe do número não
    // chega na hora em que o número é lido.
    recusas: [RECUSAS.somarPaineis, RECUSAS.conversaoComoInstalacao, RECUSAS.mmpComoTotal],
  };
}

/** Uma linha por degrau, para quem lê só o retrato. */
export function linhaDaEscada(e: EscadaDaAquisicao): string[] {
  return e.degraus.map((d) => {
    const cabeca = `${d.degrau} [dono: ${d.dono.split(",")[0]}]`;
    if (d.valor === null) return `${cabeca}: NAO SEI, ${d.naoSei}`;
    const detalhe = d.porFonte.length ? ` (${d.porFonte.map((f) => `${f.fonte} ${f.valor}`).join(", ")})` : "";
    return `${cabeca}: ${d.unidade === "R$" ? `R$ ${d.valor.toFixed(2)}` : `${d.valor} ${d.unidade}`}${detalhe}`;
  });
}
