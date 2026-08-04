// Personalização de conteúdo sem depender do modelo exato.
//
// Em vez de exigir uma aula por carro (impossível: ~200 modelos), derivamos
// duas coisas do que já sabemos do usuário:
//  - TRAITS: características do veículo (turbo, CVT, elétrico, diesel, alto
//    km…) — um conteúdo de turbo serve para Polo TSI, Kicks, Compass etc.
//  - SITUATIONS: o momento do dono (acabou de comprar, revisão vencida, sem
//    histórico) — o que ele mais precisa ver AGORA.
//
// Fontes: campo motor/versão (vindo da FIPE), ano, km, data de compra, o quiz
// de saúde e o histórico de serviços.

import type { ServiceRecord, Vehicle } from "./types";
import { computeUpcoming } from "./health";

export type Trait =
  | "turbo"
  | "directInjection"
  | "cvt"
  | "dct"
  | "amt"
  | "autoGearbox"
  | "manualGearbox"
  | "ev"
  | "hybrid"
  | "diesel"
  | "highKm"
  | "oldCar"
  | "newCar"
  | "appUse"
  | "urbanUse"
  | "highwayUse";

export type Situation = "justBought" | "overdue" | "noHistory" | "noQuiz" | "noKm";

const has = (s: string | undefined, re: RegExp) => !!s && re.test(s);

// Marcas/modelos 100% elétricos vendidos no Brasil (complementa o texto do motor).
const EV_MODELS = /dolphin|seal|song|yuan|han|tan|atto|leaf|kona el|e-208|born|byd/i;
const HYBRID_HINT = /h[ií]brid|hybrid|hev|phev|e-power|dm-i/i;
const DIESEL_HINT = /diesel|tdi|crdi|mjet|multijet|dci|hdi|turbodiesel|d4-d|duratorq/i;
const TURBO_HINT = /turbo|tsi|thp|tce|t-?gdi|ecoboost|gti|gts|abarth/i;

export function vehicleTraits(v: Vehicle, now = new Date()): Set<Trait> {
  const t = new Set<Trait>();
  const engine = `${v.engine ?? ""} ${v.version ?? ""}`.trim();
  const q = v.quiz ?? {};
  const age = now.getFullYear() - v.year;

  // --- Motor ---
  if (has(engine, TURBO_HINT) || q.engineArch === "turboPfi" || q.engineArch === "turboDI") t.add("turbo");
  if (q.engineArch === "turboDI" || q.engineArch === "aspiratedDI") t.add("directInjection");
  if (has(engine, DIESEL_HINT)) t.add("diesel");
  if (has(engine, HYBRID_HINT)) t.add("hybrid");
  // Elétrico: texto do motor ou modelo conhecido de marca elétrica.
  if (has(engine, /el[eé]tric|electric|\bev\b/i) || (EV_MODELS.test(v.model) && v.make.toLowerCase() === "byd" && !has(engine, HYBRID_HINT))) {
    t.add("ev");
  }

  // --- Câmbio (vem do quiz de saúde) ---
  if (q.transmission === "cvt") t.add("cvt");
  if (q.transmission === "dctWet" || q.transmission === "dctDry") t.add("dct");
  if (q.transmission === "amt") t.add("amt");
  if (q.transmission === "autoTC" || q.transmission === "oldAuto") t.add("autoGearbox");
  if (q.transmission === "manual") t.add("manualGearbox");

  // --- Idade e uso ---
  if (typeof v.odometerKm === "number" && v.odometerKm >= 100000) t.add("highKm");
  if (age >= 10) t.add("oldCar");
  if (age <= 2) t.add("newCar");
  if (q.usePattern === "appDelivery") t.add("appUse");
  if (q.usePattern === "urban" || q.usePattern === "heavyUrban") t.add("urbanUse");
  if (q.usePattern === "highway") t.add("highwayUse");

  return t;
}

export function vehicleSituations(v: Vehicle, services: ServiceRecord[], now = new Date()): Set<Situation> {
  const sit = new Set<Situation>();

  // Comprou há pouco (até 4 meses) — janela dos "primeiros cuidados".
  if (v.purchaseDate) {
    const d = new Date(v.purchaseDate + "T00:00:00");
    if (!isNaN(d.getTime())) {
      const months = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      if (months <= 4) sit.add("justBought");
    }
  }
  if (computeUpcoming(v, services, now).some((i) => i.status === "overdue")) sit.add("overdue");
  if (services.length === 0) sit.add("noHistory");
  if (!v.quiz || Object.keys(v.quiz).length === 0) sit.add("noQuiz");
  if (v.odometerKm == null) sit.add("noKm");

  return sit;
}

// Pontuação de relevância de uma aula para o carro/momento do usuário.
// Situação pesa mais que característica: é o que ele precisa AGORA.
export function personalScore(
  lesson: { make?: string; model?: string; traits?: string[]; situations?: string[]; difficulty?: string; type?: string },
  ctx: { make?: string; model?: string; traits: Set<Trait>; situations: Set<Situation>; pref?: string }
): number {
  let n = 0;
  if (ctx.model && lesson.model && lesson.model.toLowerCase() === ctx.model.toLowerCase()) n += 10;
  if (ctx.make && lesson.make && lesson.make.toLowerCase() === ctx.make.toLowerCase()) n += 5;
  for (const s of lesson.situations ?? []) if (ctx.situations.has(s as Situation)) n += 8;
  for (const tr of lesson.traits ?? []) if (ctx.traits.has(tr as Trait)) n += 6;
  if (lesson.difficulty && lesson.difficulty === ctx.pref) n += 2;
  if (lesson.type === "video") n += 1;
  return n;
}
