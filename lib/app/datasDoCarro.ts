// As datas do carro: IPVA, licenciamento, seguro e CNH. A parte pura.
//
// Peça 2 da rotina do carro (docs/agentes/propostas/rotina-do-carro.md,
// 13/09/2026). Datas anuais, mas cada uma tem um mês de ansiedade antes, e
// são o motivo mais concreto para ligar os avisos: "o IPVA vence em 12 dias"
// tem data e dinheiro. A pessoa informa uma vez; o app avisa 30, 7 e 1 dia
// antes, às 9h, e mostra no Início só quando está a 30 dias ou menos.
//
// `npm run conferir:datas` exercita isto sem navegador.

import type { DataDoCarro, TipoDeData, Vehicle } from "./types.ts";

export const TIPOS_DE_DATA: TipoDeData[] = ["ipva", "licenciamento", "seguro", "cnh"];
/** Quantos dias antes cada aviso sai. Três por data, ids fixos. */
export const ANTECEDENCIAS = [30, 7, 1] as const;
export const HORA_DO_AVISO = 9;
/** Dentro de quantos dias uma data aparece no Início. */
export const JANELA_DO_INICIO = 30;

const DIA = 24 * 60 * 60 * 1000;

const meiaNoite = (iso: string): Date => {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d, 0, 0, 0, 0);
};

/** Dias inteiros de `hoje` até `iso` (negativo quando já passou). */
export function diasAte(iso: string, hoje = new Date()): number {
  const h = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return Math.round((meiaNoite(iso).getTime() - h.getTime()) / DIA);
}

export type DataLida = { tipo: TipoDeData; em: string; valor?: number; dias: number; estimada?: boolean };

/** As datas informadas do carro, da mais próxima para a mais distante. */
export function datasDoCarro(v: Pick<Vehicle, "datas"> | null | undefined, hoje = new Date()): DataLida[] {
  const datas = v?.datas ?? {};
  const lista: DataLida[] = [];
  for (const tipo of TIPOS_DE_DATA) {
    const d: DataDoCarro | undefined = datas[tipo];
    if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d.em)) continue;
    lista.push({ tipo, em: d.em, valor: d.valor, dias: diasAte(d.em, hoje), ...(d.estimada ? { estimada: true } : {}) });
  }
  return lista.sort((a, b) => a.dias - b.dias);
}

/** O que aparece no Início: a mais próxima a até 30 dias, ou já vencida (até 60 dias atrás). */
export function dataParaOInicio(v: Pick<Vehicle, "datas"> | null | undefined, hoje = new Date()): DataLida | null {
  return datasDoCarro(v, hoje).find((d) => d.dias <= JANELA_DO_INICIO && d.dias >= -60) ?? null;
}

export type AvisoDeData = { id: number; tipo: TipoDeData; diasAntes: (typeof ANTECEDENCIAS)[number]; quando: Date; em: string; estimada?: boolean };

/**
 * Os avisos a agendar para as datas do carro: para cada data, um aviso 30,
 * 7 e 1 dia antes, às 9h, só os que ainda estão no futuro. O id é fixo por
 * (tipo, antecedência), a partir de `base`: agendar de novo substitui.
 */
export function avisosDasDatas(v: Pick<Vehicle, "datas"> | null | undefined, base: number, agora = new Date()): AvisoDeData[] {
  const avisos: AvisoDeData[] = [];
  for (const d of datasDoCarro(v, agora)) {
    const i = TIPOS_DE_DATA.indexOf(d.tipo);
    ANTECEDENCIAS.forEach((diasAntes, k) => {
      const quando = meiaNoite(d.em);
      quando.setDate(quando.getDate() - diasAntes);
      quando.setHours(HORA_DO_AVISO, 0, 0, 0);
      if (quando.getTime() <= agora.getTime()) return;
      avisos.push({ id: base + i * ANTECEDENCIAS.length + k, tipo: d.tipo, diasAntes, quando, em: d.em, ...(d.estimada ? { estimada: true } : {}) });
    });
  }
  return avisos.sort((a, b) => a.quando.getTime() - b.quando.getTime());
}

/** Todos os ids que as datas podem usar, para cancelar antes de reagendar. */
export function idsDosAvisosDeData(base: number): number[] {
  return TIPOS_DE_DATA.flatMap((_, i) => ANTECEDENCIAS.map((__, k) => base + i * ANTECEDENCIAS.length + k));
}

/** A data está vencida, chegando ou distante. */
export function estadoDaData(dias: number): "vencida" | "hoje" | "chegando" | "distante" {
  if (dias < 0) return "vencida";
  if (dias === 0) return "hoje";
  if (dias <= JANELA_DO_INICIO) return "chegando";
  return "distante";
}
