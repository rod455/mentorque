// O mês fechado do carro: quanto foi em combustível e em serviços. Puro.
//
// Peça 3 da rotina do carro (docs/agentes/propostas/rotina-do-carro.md,
// 13/09/2026): o resumo mensal sai no dia 1 por e-mail e push, e fica no
// Início na primeira semana. Só para quem tem o que resumir: resumo vazio
// é spam. Usado pelo e-mail (lib/jornada/emails.ts) e pelo card do Início.

import type { Abastecimento, ServiceRecord } from "./types.ts";

export type ResumoDoMes = {
  /** "2026-08" */
  mes: string;
  combustivel: number;
  servicos: number;
  total: number;
  /** Quantos lançamentos (abastecimentos e serviços) o mês teve. */
  lancamentos: number;
  /** Litros somados, para quem informou. */
  litros: number;
};

/** O mês anterior ao de `hoje` (yyyy-mm-dd), como "yyyy-mm". */
export function mesAnterior(hoje: string): string {
  const [a, m] = hoje.split("-").map(Number);
  const d = new Date(a, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** O mês de `hoje` como "yyyy-mm". */
export function mesDeHoje(hoje: string): string {
  return hoje.slice(0, 7);
}

export function resumoDoMes(o: { abastecimentos: Abastecimento[]; servicos: ServiceRecord[]; mes: string }): ResumoDoMes {
  const ab = o.abastecimentos.filter((a) => a.date.startsWith(o.mes));
  const sv = o.servicos.filter((s) => s.date.startsWith(o.mes) && typeof s.total === "number" && s.total > 0);
  const combustivel = Math.round(ab.reduce((acc, a) => acc + a.valor, 0) * 100) / 100;
  const servicos = Math.round(sv.reduce((acc, s) => acc + (s.total ?? 0), 0) * 100) / 100;
  return {
    mes: o.mes,
    combustivel,
    servicos,
    total: Math.round((combustivel + servicos) * 100) / 100,
    lancamentos: ab.length + o.servicos.filter((s) => s.date.startsWith(o.mes)).length,
    litros: Math.round(ab.reduce((acc, a) => acc + (a.litros ?? 0), 0) * 100) / 100,
  };
}

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

/** "Agosto", a partir de "2026-08". */
export function nomeDoMes(mes: string, capitalizar = true): string {
  const n = MESES[Number(mes.slice(5, 7)) - 1] ?? mes;
  return capitalizar ? n.charAt(0).toUpperCase() + n.slice(1) : n;
}
