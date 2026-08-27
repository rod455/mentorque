import type { Locale } from "@/lib/i18n";
import type { Tradutor } from "./base";

// Tipos de serviço e as peças de cada um (alimenta o autocomplete de "Peças
// trocadas").
export function servicos(T: Tradutor, locale: Locale) {

// ---- Service types (2.4) -------------------------------------------------
const serviceTypes: { key: string; label: string }[] = [
  { key: "oil", label: T("Troca de óleo", "Oil change") },
  { key: "brakes", label: T("Freios", "Brakes") },
  { key: "revision", label: T("Revisão", "Full service") },
  { key: "suspension", label: T("Suspensão", "Suspension") },
  { key: "tires", label: T("Pneus", "Tires") },
  { key: "battery", label: T("Bateria", "Battery") },
  { key: "timing", label: T("Correia/corrente", "Timing belt/chain") },
  { key: "airfilter", label: T("Filtro de ar", "Air filter") },
  { key: "brakefluid", label: T("Fluido de freio", "Brake fluid") },
  { key: "other", label: T("Outro", "Other") },
];

// Kit do motorista — equipamentos úteis, por categoria.

// Peças comuns por tipo de serviço — alimenta o autocomplete de "Peças trocadas".
const partsByType: Record<string, string[]> = locale === "pt"
  ? {
      oil: ["Óleo do motor", "Filtro de óleo", "Filtro de ar", "Aditivo do radiador"],
      brakes: ["Pastilha dianteira", "Pastilha traseira", "Disco de freio", "Fluido de freio", "Lona de freio", "Cilindro de freio"],
      revision: ["Óleo do motor", "Filtro de óleo", "Filtro de ar", "Filtro de combustível", "Filtro de cabine", "Velas de ignição", "Fluido de freio"],
      suspension: ["Amortecedor dianteiro", "Amortecedor traseiro", "Mola", "Bieleta", "Batente", "Coxim", "Pivô", "Terminal de direção", "Bandeja"],
      tires: ["Pneu Aro 13", "Pneu Aro 14", "Pneu Aro 15", "Pneu Aro 16", "Pneu Aro 17", "Pneu Aro 18", "Pneu Aro 19", "Pneu Aro 20", "Alinhamento", "Balanceamento", "Rodízio de pneus", "Válvula"],
      battery: ["Bateria 60Ah", "Bateria 70Ah", "Terminal de bateria", "Alternador"],
      timing: ["Correia dentada", "Tensor", "Bomba d'água", "Correia do alternador", "Kit correia dentada"],
      airfilter: ["Filtro de ar", "Filtro de cabine (ar-condicionado)"],
      brakefluid: ["Fluido de freio DOT 3", "Fluido de freio DOT 4"],
      other: [],
    }
  : {
      oil: ["Engine oil", "Oil filter", "Air filter", "Radiator additive"],
      brakes: ["Front brake pads", "Rear brake pads", "Brake disc", "Brake fluid", "Brake shoe", "Brake cylinder"],
      revision: ["Engine oil", "Oil filter", "Air filter", "Fuel filter", "Cabin filter", "Spark plugs", "Brake fluid"],
      suspension: ["Front shock", "Rear shock", "Spring", "Sway bar link", "Bump stop", "Strut mount", "Ball joint", "Tie rod end", "Control arm"],
      tires: ["Tire 13\"", "Tire 14\"", "Tire 15\"", "Tire 16\"", "Tire 17\"", "Tire 18\"", "Tire 19\"", "Tire 20\"", "Alignment", "Balancing", "Tire rotation", "Valve"],
      battery: ["Battery 60Ah", "Battery 70Ah", "Battery terminal", "Alternator"],
      timing: ["Timing belt", "Tensioner", "Water pump", "Alternator belt", "Timing belt kit"],
      airfilter: ["Air filter", "Cabin filter (A/C)"],
      brakefluid: ["Brake fluid DOT 3", "Brake fluid DOT 4"],
      other: [],
    };

// Consulting tiers (moved under Premium/Perfil).

  return { serviceTypes, partsByType };
}
