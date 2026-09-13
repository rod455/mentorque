// A conta de quem trabalha com o carro por aplicativo: ganhou, custou, sobrou.
//
// Pura, para `npm run conferir:motorista` exercitar sem navegador. Peça 4 da
// rotina do carro (docs/agentes/propostas/rotina-do-carro.md, 13/09/2026):
// o interruptor no Perfil liga o modo; o card do Início troca "custo do
// carro" por "hoje: ganhou, custou, sobrou"; o resumo do mês ganha o lucro
// por km. O público principal continua sendo decisão do dono; o interruptor
// não muda posicionamento.
//
// As regras, em uma linha cada:
// - o custo do dia é km rodado vezes o custo por km, e o custo por km tem
//   duas partes: combustível (dos abastecimentos, combustivel.ts) e a
//   RESERVA de manutenção (serviços com valor nos últimos 12 meses, divididos
//   pelos km rodados no mesmo período, lidos dos km dos registros);
// - sem dois abastecimentos não há custo por km, e a conta diz "sem custo
//   ainda" em vez de inventar um número;
// - a reserva só entra quando há serviço com valor E pelo menos 500 km
//   registrados no período; senão fica de fora, e a tela avisa que a conta
//   ainda é só combustível;
// - lucro por km é o que sobrou dividido pelos km do período.

import { custoPorKm } from "./combustivel.ts";
import type { Abastecimento, Ganho, ServiceRecord } from "./types.ts";

/** Menos km registrados que isto e a reserva de manutenção não sai (divisão frouxa). */
export const KM_MINIMO_PARA_RESERVA = 500;
/** A reserva olha os últimos 12 meses. */
export const DIAS_DA_RESERVA = 365;

const centavos = (n: number) => Math.round(n * 100) / 100;

function diasAtras(hoje: string, dias: number): string {
  const [a, m, d] = hoje.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d - dias)).toISOString().slice(0, 10);
}

/**
 * R$ de manutenção por km rodado nos últimos 12 meses, ou null quando não dá
 * para saber (sem serviço com valor, ou menos de 500 km registrados).
 */
export function reservaPorKm(servicos: ServiceRecord[], abastecimentos: Abastecimento[], hoje: string): number | null {
  const desde = diasAtras(hoje, DIAS_DA_RESERVA);
  const sv = servicos.filter((s) => s.date >= desde && s.date <= hoje);
  const gasto = sv.reduce((acc, s) => acc + (typeof s.total === "number" && s.total > 0 ? s.total : 0), 0);
  if (gasto <= 0) return null;
  const kms = [...sv.map((s) => s.km), ...abastecimentos.filter((a) => a.date >= desde && a.date <= hoje).map((a) => a.km)].filter((k) => k > 0);
  if (kms.length < 2) return null;
  const rodados = Math.max(...kms) - Math.min(...kms);
  if (rodados < KM_MINIMO_PARA_RESERVA) return null;
  return centavos(gasto / rodados);
}

export type ContaDoPeriodo = {
  ganhou: number;
  km: number;
  /** Quantos dias tiveram lançamento. */
  dias: number;
  combustivelPorKm: number | null;
  reservaPorKm: number | null;
  /** Combustível mais reserva; null sem custo por km de combustível. */
  custoPorKm: number | null;
  /** km × custo por km; null quando o custo por km não existe. */
  custou: number | null;
  sobrou: number | null;
  /** (ganhou − custou) / km; null sem custo ou sem km. */
  lucroPorKm: number | null;
};

/** A conta entre `desde` e `ate` (inclusive, yyyy-mm-dd). `hoje` fixa a janela da reserva. */
export function contaDoPeriodo(o: { ganhos: Ganho[]; abastecimentos: Abastecimento[]; servicos: ServiceRecord[]; desde: string; ate: string; hoje?: string }): ContaDoPeriodo {
  const hoje = o.hoje ?? o.ate;
  const g = o.ganhos.filter((x) => x.date >= o.desde && x.date <= o.ate);
  const ganhou = centavos(g.reduce((acc, x) => acc + x.valor, 0));
  const km = g.reduce((acc, x) => acc + x.km, 0);
  const combustivelPorKm = custoPorKm(o.abastecimentos);
  const reserva = reservaPorKm(o.servicos, o.abastecimentos, hoje);
  const porKm = combustivelPorKm == null ? null : centavos(combustivelPorKm + (reserva ?? 0));
  const custou = porKm == null ? null : centavos(km * porKm);
  const sobrou = custou == null ? null : centavos(ganhou - custou);
  return {
    ganhou,
    km,
    dias: new Set(g.map((x) => x.date)).size,
    combustivelPorKm,
    reservaPorKm: reserva,
    custoPorKm: porKm,
    custou,
    sobrou,
    lucroPorKm: sobrou == null || km <= 0 ? null : centavos(sobrou / km),
  };
}

/** O dia de hoje. */
export function contaDoDia(o: { ganhos: Ganho[]; abastecimentos: Abastecimento[]; servicos: ServiceRecord[]; hoje: string }): ContaDoPeriodo {
  return contaDoPeriodo({ ...o, desde: o.hoje, ate: o.hoje });
}

/** O mês civil "yyyy-mm". */
export function contaDoMes(o: { ganhos: Ganho[]; abastecimentos: Abastecimento[]; servicos: ServiceRecord[]; mes: string; hoje?: string }): ContaDoPeriodo {
  const [a, m] = o.mes.split("-").map(Number);
  const ultimo = new Date(Date.UTC(a, m, 0)).toISOString().slice(0, 10);
  return contaDoPeriodo({ ...o, desde: `${o.mes}-01`, ate: ultimo, hoje: o.hoje ?? ultimo });
}

/** Valor e km do dia precisam ser números positivos; devolve o motivo quando não são. */
export function lancamentoValido(valor: number, km: number): "valor" | "km" | null {
  if (!Number.isFinite(valor) || valor <= 0) return "valor";
  if (!Number.isFinite(km) || km <= 0) return "km";
  return null;
}
