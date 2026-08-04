// Preço por região: ajusta as faixas nacionais de referência pelo custo típico
// do estado do usuário; cidades grandes têm fator próprio (mais específico).
// Fatores são heurísticos de partida — recalibrar com dados reais depois.

export const UF_LIST: { uf: string; name: string }[] = [
  { uf: "AC", name: "Acre" },
  { uf: "AL", name: "Alagoas" },
  { uf: "AP", name: "Amapá" },
  { uf: "AM", name: "Amazonas" },
  { uf: "BA", name: "Bahia" },
  { uf: "CE", name: "Ceará" },
  { uf: "DF", name: "Distrito Federal" },
  { uf: "ES", name: "Espírito Santo" },
  { uf: "GO", name: "Goiás" },
  { uf: "MA", name: "Maranhão" },
  { uf: "MT", name: "Mato Grosso" },
  { uf: "MS", name: "Mato Grosso do Sul" },
  { uf: "MG", name: "Minas Gerais" },
  { uf: "PA", name: "Pará" },
  { uf: "PB", name: "Paraíba" },
  { uf: "PR", name: "Paraná" },
  { uf: "PE", name: "Pernambuco" },
  { uf: "PI", name: "Piauí" },
  { uf: "RJ", name: "Rio de Janeiro" },
  { uf: "RN", name: "Rio Grande do Norte" },
  { uf: "RS", name: "Rio Grande do Sul" },
  { uf: "RO", name: "Rondônia" },
  { uf: "RR", name: "Roraima" },
  { uf: "SC", name: "Santa Catarina" },
  { uf: "SP", name: "São Paulo" },
  { uf: "SE", name: "Sergipe" },
  { uf: "TO", name: "Tocantins" },
];

// Fator por estado (1.00 = média nacional).
const UF_FACTOR: Record<string, number> = {
  SP: 1.08, RJ: 1.08, DF: 1.1, SC: 1.05, PR: 1.02, RS: 1.03, MG: 0.98,
  ES: 1.0, GO: 0.95, MT: 1.0, MS: 0.97, BA: 0.92, PE: 0.92, CE: 0.9,
  RN: 0.9, PB: 0.88, SE: 0.9, AL: 0.88, PI: 0.85, MA: 0.85, TO: 0.92,
  PA: 0.95, AM: 1.0, RR: 1.05, AP: 1.0, AC: 1.0, RO: 0.95,
};

// Cidades grandes com faixa própria (sobrepõe o fator do estado).
const CITY_FACTOR: Record<string, number> = {
  "sao paulo": 1.15,
  "rio de janeiro": 1.12,
  "belo horizonte": 1.02,
  brasilia: 1.12,
  curitiba: 1.05,
  "porto alegre": 1.06,
  salvador: 0.95,
  recife: 0.95,
  fortaleza: 0.92,
  manaus: 1.02,
  goiania: 0.97,
  campinas: 1.08,
  florianopolis: 1.1,
  "sao jose dos campos": 1.06,
  santos: 1.08,
  niteroi: 1.1,
  "belem": 0.95,
  "sao luis": 0.88,
  natal: 0.9,
  "joao pessoa": 0.88,
  maceio: 0.88,
  teresina: 0.85,
  "campo grande": 0.97,
  cuiaba: 1.0,
  vitoria: 1.02,
  "porto velho": 0.95,
  "rio branco": 1.0,
  "boa vista": 1.05,
  macapa: 1.0,
  aracaju: 0.9,
  palmas: 0.92,
  uberlandia: 0.97,
  "ribeirao preto": 1.02,
  sorocaba: 1.02,
  "sao bernardo do campo": 1.1,
  guarulhos: 1.08,
  osasco: 1.08,
  "duque de caxias": 1.05,
  "nova iguacu": 1.02,
  contagem: 1.0,
  joinville: 1.03,
  londrina: 1.0,
  maringa: 1.0,
  "caxias do sul": 1.02,
  "feira de santana": 0.88,
  "juiz de fora": 0.95,
  anapolis: 0.92,
};

function normalize(s: string): string {
  return s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Fator da região do usuário. Cidade conhecida → fator da cidade ("preço mais
// específico"); senão → média do estado; sem região → 1 (referência nacional).
export function regionFactor(uf?: string | null, city?: string | null): { factor: number; specific: boolean } {
  if (city) {
    const f = CITY_FACTOR[normalize(city)];
    if (f != null) return { factor: f, specific: true };
  }
  if (uf) {
    const f = UF_FACTOR[uf.toUpperCase()];
    if (f != null) return { factor: f, specific: false };
  }
  return { factor: 1, specific: false };
}

// Ajusta uma faixa "R$ 250–600" (ou "R$ 300–1.200") pelo fator, arredondando
// para múltiplos de 10. Se não reconhecer números, devolve o original.
export function adjustPriceRange(range: string, factor: number): string {
  if (factor === 1) return range;
  let found = false;
  const out = range.replace(/\d[\d.]*/g, (m) => {
    const n = parseInt(m.replace(/\./g, ""), 10);
    if (!Number.isFinite(n)) return m;
    found = true;
    const adj = Math.max(10, Math.round((n * factor) / 10) * 10);
    return adj.toLocaleString("pt-BR");
  });
  return found ? out : range;
}

// Rótulo curto da região: "Campinas/SP", "SP" ou null.
export function regionLabel(uf?: string | null, city?: string | null): string | null {
  const u = uf?.trim().toUpperCase() || null;
  const c = city?.trim() || null;
  if (c && u) return `${c}/${u}`;
  if (c) return c;
  return u;
}
