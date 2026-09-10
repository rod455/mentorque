// A faixa de preço de um serviço na região, e a observação que vira dado.
//
// Pura de propósito (só importa pricing.ts, que também é puro): é o pedaço
// que `npm run conferir:precos` abre no node. O porquê de tudo isto está em
// lib/app/precos.ts, que é quem fala com a tela e com o servidor.
import { regionFactor, regionLabel } from "./pricing.ts";

/**
 * Faixa nacional de referência por tipo de serviço, em reais. `other` não tem.
 *
 * SÃO REFERÊNCIA, NÃO DADO: valores de carro popular em oficina independente
 * (2026), escritos à mão, ajustados pelo fator da região de pricing.ts, que o
 * próprio arquivo chama de chute inicial. A tela diz isso. O dado real nasce
 * da tabela precos_observados, par a par, quando houver 30 ou mais.
 */
export const FAIXAS_NACIONAIS: Record<string, { min: number; max: number }> = {
  oil: { min: 150, max: 450 },        // óleo + filtro
  airfilter: { min: 60, max: 200 },
  brakefluid: { min: 120, max: 300 },
  brakes: { min: 250, max: 800 },     // pastilhas; com discos no alto da faixa
  battery: { min: 350, max: 900 },
  revision: { min: 400, max: 1500 },
  suspension: { min: 400, max: 1800 },
  tires: { min: 300, max: 700 },      // UM pneu, montado e balanceado
  timing: { min: 600, max: 2000 },
};

export type FaixaDaRegiao = {
  min: number;
  max: number;
  /** "Campinas/SP", "SP" ou null quando não há região cadastrada. */
  regiao: string | null;
  /** A faixa é da cidade (mais específica) ou do estado / nacional. */
  especifica: boolean;
};

const arredonda = (n: number) => Math.max(10, Math.round(n / 10) * 10);

/** A faixa deste serviço na região da pessoa, ou null para tipo sem referência. */
export function faixaDaRegiao(tipo: string, uf?: string | null, cidade?: string | null): FaixaDaRegiao | null {
  const base = FAIXAS_NACIONAIS[tipo];
  if (!base) return null;
  const { factor, specific } = regionFactor(uf, cidade);
  return {
    min: arredonda(base.min * factor),
    max: arredonda(base.max * factor),
    regiao: regionLabel(uf, cidade),
    especifica: specific,
  };
}

export type PosicaoNaFaixa = "abaixo" | "dentro" | "acima";

/** Onde o valor pago caiu em relação à faixa. */
export function posicaoNaFaixa(valor: number, faixa: Pick<FaixaDaRegiao, "min" | "max">): PosicaoNaFaixa {
  if (valor < faixa.min) return "abaixo";
  if (valor > faixa.max) return "acima";
  return "dentro";
}

/**
 * Só o que a comparação precisa, normalizado como o servidor espera, e SEM
 * NINGUÉM DENTRO: nem id, nem nome, nem placa, nem oficina. Devolve null para
 * o que não vale observar (tipo sem referência, valor zero ou absurdo).
 */
export function observacaoDePreco(
  o: { tipo: string; valor: number; uf?: string | null; cidade?: string | null; tipoVeiculo?: string | null; ano?: number | null },
  meta: { plataforma: string; versao: string },
): Record<string, unknown> | null {
  if (!o.tipo || !FAIXAS_NACIONAIS[o.tipo]) return null;
  if (!Number.isFinite(o.valor) || o.valor <= 0 || o.valor > 100_000) return null;
  return {
    tipo: o.tipo,
    valor: Math.round(o.valor),
    uf: o.uf?.trim().toUpperCase() || null,
    cidade: o.cidade?.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || null,
    tipoVeiculo: o.tipoVeiculo ?? null,
    ano: o.ano ?? null,
    plataforma: meta.plataforma,
    versao: meta.versao,
  };
}
