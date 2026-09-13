// O calendário do IPVA e do licenciamento pelo final da placa. Puro.
//
// Pedido do dono em 13/09/2026: "vamos fazer a automatização do IPVA e final
// da placa". A pessoa informa o estado e o final da placa uma vez; o app
// sugere a data de vencimento do IPVA e do licenciamento, e ela confirma com
// um toque. As datas confirmadas caem em `Vehicle.datas`, no mesmo lugar das
// digitadas, e tudo o que vem depois (avisos, Início, jornada) segue igual.
//
// As regras, em uma linha cada:
// - a tabela guarda calendários POR ANO, com a fonte de cada um; o que não
//   está na tabela não é sugerido (a tela diz "ainda não temos o calendário
//   do seu estado" e a pessoa digita);
// - sugestão EXATA quando o calendário do ano tem a data e ela ainda não
//   passou; sugestão ESTIMADA quando só há o calendário de um ano anterior
//   (mesmo mês e dia, no ano seguinte), e a estimativa é marcada em tudo o
//   que a mostra: os estados publicam o calendário novo em dezembro;
// - a data do IPVA é a PRIMEIRA que a pessoa precisa respeitar (cota única
//   com desconto ou 1ª parcela); a do licenciamento, o último dia do mês do
//   final;
// - o final da placa é o último dígito, tanto na placa antiga (ABC-1234, 4)
//   quanto na Mercosul (ABC1D23, 3).
//
// `npm run conferir:datas` exercita isto sem navegador.

import type { TipoDeData } from "./types.ts";

export type TipoComCalendario = Extract<TipoDeData, "ipva" | "licenciamento">;

export type Calendario = {
  uf: string;
  tipo: TipoComCalendario;
  ano: number;
  /** final da placa ("0" a "9") → yyyy-mm-dd */
  porFinal: Record<string, string>;
  fonte: string;
  /** Lido de Detran, Sefaz ou agência oficial do estado (true) ou de imprensa e blogs (false). */
  oficial: boolean;
  regra: string;
};

const fim = (ano: number, mes: number) => `${ano}-${String(mes).padStart(2, "0")}-${String(new Date(ano, mes, 0).getDate()).padStart(2, "0")}`;

/** Um calendário por mês e final: finais → mês; a data é o último dia do mês. */
function porMes(ano: number, meses: Record<string, number>): Record<string, string> {
  const r: Record<string, string> = {};
  for (const [final, mes] of Object.entries(meses)) r[final] = fim(ano, mes);
  return r;
}

export const CALENDARIOS: Calendario[] = [
  {
    uf: "SP", tipo: "ipva", ano: 2026,
    porFinal: { "1": "2026-01-12", "2": "2026-01-13", "3": "2026-01-14", "4": "2026-01-15", "5": "2026-01-16", "6": "2026-01-19", "7": "2026-01-20", "8": "2026-01-21", "9": "2026-01-22", "0": "2026-01-30" },
    fonte: "https://www.serasaexperian.com.br/conteudos/calendario-ipva-sao-paulo/",
    oficial: false,
    regra: "cota única com 3% de desconto ou 1ª de 5 parcelas",
  },
  {
    uf: "SP", tipo: "licenciamento", ano: 2026,
    porFinal: porMes(2026, { "1": 7, "2": 7, "3": 8, "4": 8, "5": 9, "6": 9, "7": 10, "8": 10, "9": 11, "0": 12 }),
    fonte: "https://www.agenciasp.sp.gov.br/calendario-oficial-do-licenciamento-de-veiculos-2026-comeca-em-julho-veja-datas/",
    oficial: true,
    regra: "veículos de passeio; último dia do mês do final",
  },
  {
    uf: "MG", tipo: "ipva", ano: 2026,
    porFinal: { "1": "2026-02-09", "2": "2026-02-09", "3": "2026-02-10", "4": "2026-02-10", "5": "2026-02-11", "6": "2026-02-11", "7": "2026-02-12", "8": "2026-02-12", "9": "2026-02-13", "0": "2026-02-13" },
    fonte: "https://www.zuldigital.com.br/blog/ipva-mg-2026/",
    oficial: false,
    regra: "cota única com 3% de desconto ou 1ª de 3 parcelas; finais aos pares",
  },
  {
    uf: "RS", tipo: "ipva", ano: 2026,
    porFinal: { "1": "2026-04-30", "2": "2026-04-30", "3": "2026-04-30", "4": "2026-04-30", "5": "2026-04-30", "6": "2026-04-30", "7": "2026-04-30", "8": "2026-04-30", "9": "2026-04-30", "0": "2026-04-30" },
    fonte: "https://fazenda.rs.gov.br/ipva-2026-prazo-final-para-pagamento-por-placas-e-30-de-abril",
    oficial: true,
    regra: "data única para todos os finais (quem não antecipou nem parcelou)",
  },
  {
    uf: "SC", tipo: "ipva", ano: 2026,
    porFinal: porMes(2026, { "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "0": 10 }),
    fonte: "https://www.sef.sc.gov.br/noticias/secretaria-de-estado-da-fazenda-divulga-calendario-do-ipva-para-2026",
    oficial: true,
    regra: "cota única até o fim do mês do final (1 = janeiro ... 0 = outubro)",
  },
  // RJ e PR ficaram de fora do IPVA de propósito: as fontes que o proxy
  // deixou ler discordam do dia por final (RJ: 21/01 a 03/02; PR: 09 a 15/01)
  // e o site da Fazenda dos dois está bloqueado daqui. Entram quando o dono
  // ou uma fonte oficial legível der a tabela.
  {
    uf: "RJ", tipo: "licenciamento", ano: 2026,
    porFinal: porMes(2026, { "0": 7, "1": 7, "2": 7, "3": 8, "4": 8, "5": 8, "6": 9, "7": 9, "8": 9, "9": 9 }),
    fonte: "https://www.despachantedok.com.br/blog/licenciamento/licenciamento-rj/",
    oficial: false,
    regra: "veículos de passeio; último dia do mês do final",
  },
];

/** O último dígito da placa, ou null quando não há dígito. */
export function finalDaPlaca(placa: string | null | undefined): string | null {
  const m = (placa ?? "").match(/\d(?!.*\d)/);
  return m ? m[0] : null;
}

/** Os estados com calendário na tabela para o tipo. */
export function ufsComCalendario(tipo: TipoComCalendario): string[] {
  return [...new Set(CALENDARIOS.filter((c) => c.tipo === tipo).map((c) => c.uf))].sort();
}

export type Sugestao = {
  em: string;
  /** false quando a data é a do calendário publicado; true quando é projetada de um ano anterior. */
  estimada: boolean;
  /** O ano do calendário que serviu de base. */
  baseAno: number;
  fonte: string;
  oficial: boolean;
};

/**
 * A próxima data do tipo para o estado e o final, a partir de `hoje`
 * (yyyy-mm-dd): exata se algum calendário publicado ainda a tem à frente;
 * senão, a do último calendário conhecido projetada para o próximo ano em
 * que ainda não passou, marcada como estimada. Null sem calendário.
 */
export function sugestaoDeData(o: { uf: string | null | undefined; final: string | null | undefined; tipo: TipoComCalendario; hoje: string }): Sugestao | null {
  const uf = (o.uf ?? "").toUpperCase();
  const final = o.final ?? "";
  if (!/^[0-9]$/.test(final)) return null;
  const cals = CALENDARIOS.filter((c) => c.uf === uf && c.tipo === o.tipo && c.porFinal[final]).sort((a, b) => a.ano - b.ano);
  if (!cals.length) return null;
  for (const c of cals) {
    if (c.porFinal[final] >= o.hoje) return { em: c.porFinal[final], estimada: false, baseAno: c.ano, fonte: c.fonte, oficial: c.oficial };
  }
  const ultimo = cals[cals.length - 1];
  const [, mes, dia] = ultimo.porFinal[final].split("-").map(Number);
  let ano = Number(o.hoje.slice(0, 4));
  for (let i = 0; i < 3; i++) {
    const ultimoDia = new Date(ano, mes, 0).getDate();
    const em = `${ano}-${String(mes).padStart(2, "0")}-${String(Math.min(dia, ultimoDia)).padStart(2, "0")}`;
    if (em >= o.hoje) return { em, estimada: true, baseAno: ultimo.ano, fonte: ultimo.fonte, oficial: ultimo.oficial };
    ano++;
  }
  return null;
}
