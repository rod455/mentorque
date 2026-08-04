// Etanol × Gasolina — lógica de decisão (spec "Etanol x Gasolina Qual Compensa
// Abastecer", Alessandro Vila Nova).
//
// Cenário 1 (consumo conhecido nos dois): etanol compensa se
//   preçoEtanol/preçoGasolina < consumoEtanol/consumoGasolina.
// Cenário 2 (consumo faltando): estima o limiar pela razão energética dos
//   combustíveis (PCI) ajustada pela eficiência do motor (fator K), e usa o
//   limiar para estimar o consumo que falta — a decisão final é sempre a
//   fórmula do Cenário 1.

// Constantes de referência — manter atualizáveis (a mistura de anidro na
// gasolina C muda por decisão do CNPE: 25% → 27% → 30% → 32% desde ago/2026).
export const PCI_ETHANOL_MJL = 22.7; // etanol hidratado (E100)
export const PCI_GASOLINE_MJL = 32.0; // gasolina comum (C, E32)

// Fatores K por arquitetura do motor (ponto de partida de engenharia; podem
// ser recalibrados com dados reais de uso). Turbo + alta compressão usa o
// MAIOR fator (mesma causa física — não multiplicar).
export const K_STANDARD = 1.0; // aspirado, taxa ≤ 12:1
export const K_HIGH_COMPRESSION = 1.05; // taxa > 12:1 (≈76-77%)
export const K_TURBO_DI = 1.03; // turbo de fábrica c/ injeção direta (≈74%)

export type FuelInput = {
  gasPrice: number; // R$/l
  ethPrice: number; // R$/l
  gasKmL?: number; // consumo na gasolina, se conhecido
  ethKmL?: number; // consumo no etanol, se conhecido
  turbo?: boolean; // turbo de fábrica
  highComp?: boolean; // taxa de compressão > 12:1
};

export type FuelVerdict = {
  ethanolWins: boolean;
  threshold: number; // limiar de equilíbrio usado (0-1)
  priceRatio: number; // preçoEtanol / preçoGasolina (0-1+)
  estimated: boolean; // o limiar/consumo veio de estimativa (Cenário 2)?
  gasKmL?: number; // consumo usado (informado ou estimado)
  ethKmL?: number;
  gasCostKm?: number; // R$/km em cada combustível, quando calculável
  ethCostKm?: number;
};

export function engineFactorK(turbo?: boolean, highComp?: boolean): number {
  if (highComp) return K_HIGH_COMPRESSION; // vale também para turbo + alta taxa
  if (turbo) return K_TURBO_DI;
  return K_STANDARD;
}

export function energyRatio(): number {
  return PCI_ETHANOL_MJL / PCI_GASOLINE_MJL; // ≈ 0,71 — a "regra dos 70%"
}

export function compareFuel(input: FuelInput): FuelVerdict | null {
  const { gasPrice, ethPrice } = input;
  if (!(gasPrice > 0) || !(ethPrice > 0)) return null;

  const priceRatio = ethPrice / gasPrice;
  let { gasKmL, ethKmL } = input;
  let threshold: number;
  let estimated = false;

  if (gasKmL && gasKmL > 0 && ethKmL && ethKmL > 0) {
    // Cenário 1 — dados reais do usuário.
    threshold = ethKmL / gasKmL;
  } else {
    // Cenário 2 — limiar ajustado pelo motor; estima o consumo que falta.
    estimated = true;
    threshold = energyRatio() * engineFactorK(input.turbo, input.highComp);
    if (gasKmL && gasKmL > 0) ethKmL = gasKmL * threshold;
    else if (ethKmL && ethKmL > 0) gasKmL = ethKmL / threshold;
  }

  const gasCostKm = gasKmL && gasKmL > 0 ? gasPrice / gasKmL : undefined;
  const ethCostKm = ethKmL && ethKmL > 0 ? ethPrice / ethKmL : undefined;

  return {
    ethanolWins: priceRatio < threshold,
    threshold,
    priceRatio,
    estimated,
    gasKmL,
    ethKmL,
    gasCostKm,
    ethCostKm,
  };
}

// Pré-seleção de "turbo de fábrica" a partir do campo motor do veículo
// (ex.: "1.0 Turbo", "200 TSI", "1.6 THP").
export function engineLooksTurbo(engine?: string): boolean {
  if (!engine) return false;
  return /turbo|tsi|thp|tce|gti|t-?gdi|ecoboost/i.test(engine);
}
