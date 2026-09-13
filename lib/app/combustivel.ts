// As contas do caderno de gastos: custo por km, consumo e gasto no período.
//
// Pura, para `npm run conferir:combustivel` exercitar sem navegador. O porquê
// de a peça existir está em docs/agentes/propostas/rotina-do-carro.md: o
// problema do carro é episódico, o dinheiro do carro é semanal, e o
// abastecimento é o menor lançamento possível que devolve algo na hora.
//
// As regras, em uma linha cada:
// - custo por km precisa de DOIS abastecimentos com km: o dinheiro entre o
//   primeiro e o último dividido pelos km rodados entre eles (o primeiro
//   tanque não conta, porque ele foi consumido antes do trecho medido);
// - consumo (km/l) precisa de dois com litros, pela mesma régua;
// - gasto no período soma tudo o que tem data dentro, inclusive o primeiro.

import type { Abastecimento } from "./types.ts";

const porData = (a: Abastecimento, b: Abastecimento) => (a.date === b.date ? a.km - b.km : a.date.localeCompare(b.date));

export function doCarro(lista: Abastecimento[], vehicleId: string): Abastecimento[] {
  return lista.filter((a) => a.vehicleId === vehicleId).sort(porData);
}

/** R$ por km rodado entre o primeiro e o último abastecimento; null sem dois pontos. */
export function custoPorKm(lista: Abastecimento[]): number | null {
  const l = [...lista].sort(porData).filter((a) => a.km > 0 && a.valor > 0);
  if (l.length < 2) return null;
  const km = l[l.length - 1].km - l[0].km;
  if (km <= 0) return null;
  const gasto = l.slice(1).reduce((acc, a) => acc + a.valor, 0);
  return Math.round((gasto / km) * 100) / 100;
}

/** km por litro entre o primeiro e o último abastecimento com litros; null sem dois pontos. */
export function consumoKmPorLitro(lista: Abastecimento[]): number | null {
  const l = [...lista].sort(porData).filter((a) => a.km > 0 && (a.litros ?? 0) > 0);
  if (l.length < 2) return null;
  const km = l[l.length - 1].km - l[0].km;
  const litros = l.slice(1).reduce((acc, a) => acc + (a.litros ?? 0), 0);
  if (km <= 0 || litros <= 0) return null;
  return Math.round((km / litros) * 10) / 10;
}

/** Soma dos abastecimentos com data entre `desde` e `ate` (inclusive, yyyy-mm-dd). */
export function gastoNoPeriodo(lista: Abastecimento[], desde: string, ate: string): number {
  return Math.round(lista.filter((a) => a.date >= desde && a.date <= ate).reduce((acc, a) => acc + a.valor, 0) * 100) / 100;
}

const dia = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

/** Os últimos sete dias, hoje incluído. */
export function gastoDaSemana(lista: Abastecimento[], hoje = new Date()): number {
  const inicio = new Date(hoje);
  inicio.setDate(inicio.getDate() - 6);
  return gastoNoPeriodo(lista, dia(inicio), dia(hoje));
}

/** O mês civil de `hoje`. */
export function gastoDoMes(lista: Abastecimento[], hoje = new Date()): number {
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  return gastoNoPeriodo(lista, dia(inicio), dia(hoje));
}

/** O que a tela devolve na hora em que a pessoa salva: o retorno pelo dado dado. */
export type Devolucao = {
  custoPorKm: number | null;
  consumo: number | null;
  mes: number;
  /** Quantos lançamentos existem agora; com 1, a tela explica que o próximo destrava o custo por km. */
  lancamentos: number;
};

export function devolucao(lista: Abastecimento[], hoje = new Date()): Devolucao {
  return {
    custoPorKm: custoPorKm(lista),
    consumo: consumoKmPorLitro(lista),
    mes: gastoDoMes(lista, hoje),
    lancamentos: lista.length,
  };
}

/** O km do painel nunca anda para trás: null quando o novo é válido, senão o motivo. */
export function kmValido(novo: number, atual: number | undefined): "menor" | "invalido" | null {
  if (!Number.isFinite(novo) || novo < 0) return "invalido";
  if (atual != null && novo < atual) return "menor";
  return null;
}
