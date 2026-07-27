// Vehicle Health quiz + scoring, per the "Vehicle Health" spec.
//
// Two indices:
//  - VHS (current condition): weighted average of the questionnaire answers,
//    with hard caps for critical conditions.
//  - VRI (future risk): 100 - robustness, from km/age, engine & transmission
//    architecture, use severity, history quality and recurring symptoms.
//  - Vehicle Health = 0.80 × VHS_final + 0.20 × (100 - VRI).

import type { Locale } from "@/lib/i18n";
import type { Vehicle } from "./types";

type VriComp = "engine" | "transmission" | "use" | "history" | "symptoms";
type Opt = { key: string; pt: string; en: string; note: number; cap?: number };
type Q = { id: string; pt: string; en: string; vhs?: number; vri?: VriComp; opts: Opt[] };

// Notes (0-10), VHS weights and critical caps come straight from the spec.
export const HEALTH_QUESTIONS: Q[] = [
  {
    id: "oil", pt: "As trocas de óleo são feitas no prazo?", en: "Are oil changes done on time?", vhs: 0.10,
    opts: [
      { key: "before", pt: "Sempre antes do prazo", en: "Always ahead of schedule", note: 10 },
      { key: "within", pt: "Sempre dentro do prazo", en: "Always on time", note: 9 },
      { key: "smallDelays", pt: "No prazo, com pequenos atrasos", en: "On time, with small delays", note: 7 },
      { key: "bigDelays", pt: "Algumas passaram bastante do prazo", en: "Some well past due", note: 4 },
      { key: "frequentLate", pt: "Frequentemente atrasadas", en: "Frequently late", note: 2 },
      { key: "unknown", pt: "Não sei quando foi a última", en: "Don't know the last one", note: 1 },
      { key: "lowOil", pt: "Já rodou com nível muito baixo", en: "Ran with very low oil", note: 0 },
    ],
  },
  {
    id: "maintenance", pt: "Como são as demais manutenções preventivas?", en: "How is the rest of preventive maintenance?", vhs: 0.08,
    opts: [
      { key: "manufacturer", pt: "Plano do fabricante, documentado", en: "Manufacturer plan, documented", note: 10 },
      { key: "most", pt: "A maior parte feita corretamente", en: "Mostly done correctly", note: 8 },
      { key: "someForgot", pt: "Itens principais feitos, alguns esquecidos", en: "Main items done, some forgotten", note: 6 },
      { key: "shopOnly", pt: "Só quando a oficina recomenda", en: "Only when the shop recommends", note: 4 },
      { key: "problemOnly", pt: "Só quando surge um problema", en: "Only when a problem appears", note: 1 },
      { key: "unknown", pt: "Não sei", en: "Don't know", note: 2 },
    ],
  },
  {
    id: "history", pt: "Existe histórico comprovável de manutenção?", en: "Is there provable maintenance history?", vhs: 0.07, vri: "history",
    opts: [
      { key: "full", pt: "Notas fiscais / registros completos", en: "Invoices / complete records", note: 10 },
      { key: "partial", pt: "Histórico parcial, mas consistente", en: "Partial but consistent", note: 8 },
      { key: "recent", pt: "Apenas registros recentes", en: "Recent records only", note: 6 },
      { key: "claims", pt: "Relatos sem comprovantes", en: "Claims without proof", note: 4 },
      { key: "none", pt: "Nenhum histórico", en: "No history", note: 2 },
      { key: "tampered", pt: "Inconsistências / suspeita de adulteração", en: "Inconsistencies / tampering", note: 0 },
    ],
  },
  {
    id: "warningLight", pt: "Há luz de advertência acesa no painel?", en: "Any warning light on the dash?", vhs: 0.10,
    opts: [
      { key: "none", pt: "Nenhuma luz permanece acesa", en: "No light stays on", note: 10 },
      { key: "maintenance", pt: "Aviso de manutenção periódica", en: "Periodic service reminder", note: 8 },
      { key: "checkEngine", pt: "Check Engine", en: "Check Engine", note: 4 },
      { key: "abs", pt: "ABS, airbag ou estabilidade", en: "ABS, airbag or stability", note: 2 },
      { key: "oilTemp", pt: "Pressão de óleo, temperatura ou freios", en: "Oil pressure, temperature or brakes", note: 0, cap: 20 },
      { key: "multiple", pt: "Várias luzes acesas", en: "Several lights on", note: 0 },
      { key: "off", pt: "Luzes apagadas sem reparo confirmado", en: "Lights cleared without confirmed repair", note: 0 },
    ],
  },
  {
    id: "noises", pt: "Há ruídos, vibrações ou comportamento anormal?", en: "Any noises, vibration or abnormal behavior?", vhs: 0.07, vri: "symptoms",
    opts: [
      { key: "none", pt: "Nenhum sintoma anormal", en: "No abnormal symptom", note: 10 },
      { key: "trim", pt: "Pequenos ruídos de acabamento", en: "Small trim noises", note: 9 },
      { key: "lightUndiagnosed", pt: "Ruído leve ainda não diagnosticado", en: "Light undiagnosed noise", note: 6 },
      { key: "recurring", pt: "Vibração ou ruído mecânico recorrente", en: "Recurring vibration/mechanical noise", note: 4 },
      { key: "strong", pt: "Sintoma forte ou progressivo", en: "Strong or progressive symptom", note: 2 },
      { key: "metallic", pt: "Ruído metálico no motor/câmbio/suspensão", en: "Metallic noise in engine/transmission/suspension", note: 0, cap: 30 },
    ],
  },
  {
    id: "engineRun", pt: "Como está o funcionamento do motor?", en: "How is the engine running?", vhs: 0.07, vri: "symptoms",
    opts: [
      { key: "normal", pt: "Partida rápida, marcha lenta estável", en: "Quick start, stable idle", note: 10 },
      { key: "occasional", pt: "Pequena irregularidade ocasional", en: "Small occasional irregularity", note: 8 },
      { key: "hardStart", pt: "Partida difícil ocasionalmente", en: "Occasional hard start", note: 6 },
      { key: "misfire", pt: "Falhas, perda de potência ou consumo alto", en: "Misfires, power loss or high consumption", note: 4 },
      { key: "smoke", pt: "Fumaça ou consumo elevado de óleo", en: "Smoke or high oil consumption", note: 1 },
      { key: "overheatNoise", pt: "Superaquecimento ou ruído anormal", en: "Overheating or abnormal noise", note: 0 },
    ],
  },
  {
    id: "tiresBrakes", pt: "Como estão pneus, freios e direção?", en: "How are tires, brakes and steering?", vhs: 0.10,
    opts: [
      { key: "good", pt: "Todos bons, inspecionados recentemente", en: "All good, recently inspected", note: 10 },
      { key: "normalWear", pt: "Desgaste normal, sem sintomas", en: "Normal wear, no symptoms", note: 8 },
      { key: "oneClose", pt: "Um item próximo da substituição", en: "One item near replacement", note: 6 },
      { key: "irregular", pt: "Desgaste irregular, vibração ou puxando", en: "Uneven wear, vibration or pulling", note: 4 },
      { key: "unsafe", pt: "Condição insegura, folga severa ou pneus no limite", en: "Unsafe condition, severe play or worn tires", note: 0, cap: 20 },
    ],
  },
  {
    id: "leaks", pt: "Há vazamentos ou necessidade de completar fluidos?", en: "Any leaks or need to top up fluids?", vhs: 0.06,
    opts: [
      { key: "none", pt: "Nenhum vazamento, níveis estáveis", en: "No leaks, stable levels", note: 10 },
      { key: "moist", pt: "Leve umidade, sem gotejamento", en: "Light moisture, no dripping", note: 8 },
      { key: "knownSmall", pt: "Pequeno vazamento monitorado", en: "Small monitored leak", note: 5 },
      { key: "refill", pt: "Precisa completar fluido periodicamente", en: "Needs periodic top-ups", note: 3 },
      { key: "frequent", pt: "Gotejamento frequente", en: "Frequent dripping", note: 1 },
      { key: "fuelBrake", pt: "Vazamento de combustível/freio ou grande perda de óleo", en: "Fuel/brake leak or major oil loss", note: 0, cap: 20 },
    ],
  },
  {
    id: "overheat", pt: "O veículo já superaqueceu?", en: "Has the vehicle ever overheated?", vhs: 0.08,
    opts: [
      { key: "never", pt: "Nunca", en: "Never", note: 10 },
      { key: "oneRepaired", pt: "Um evento leve, reparado e testado", en: "One light event, repaired and tested", note: 6 },
      { key: "moreThanOne", pt: "Mais de um evento", en: "More than one event", note: 3 },
      { key: "headGasket", pt: "Junta queimada ou reparo de cabeçote", en: "Blown gasket or head repair", note: 2 },
      { key: "stillExists", pt: "O problema ainda existe", en: "The problem still exists", note: 0, cap: 25 },
      { key: "unknown", pt: "Não sei", en: "Don't know", note: 5 },
    ],
  },
  {
    id: "accident", pt: "O veículo já sofreu acidente?", en: "Has the vehicle been in an accident?", vhs: 0.10,
    opts: [
      { key: "never", pt: "Nunca sofreu colisão conhecida", en: "No known collision", note: 10 },
      { key: "cosmetic", pt: "Dano cosmético, sem reparo estrutural", en: "Cosmetic damage, no structural repair", note: 9 },
      { key: "lightRepaired", pt: "Colisão leve, reparada adequadamente", en: "Light collision, properly repaired", note: 7 },
      { key: "moderate", pt: "Colisão moderada, sem dano estrutural", en: "Moderate collision, no structural damage", note: 5 },
      { key: "structuralRepaired", pt: "Dano estrutural reparado", en: "Structural damage repaired", note: 2 },
      { key: "airbags", pt: "Airbags foram acionados", en: "Airbags deployed", note: 2 },
      { key: "badRepair", pt: "Reparo estrutural ruim ou airbags ausentes", en: "Bad structural repair or missing airbags", note: 0, cap: 35 },
      { key: "unknown", pt: "Não sei", en: "Don't know", note: 5 },
    ],
  },
  {
    id: "usePattern", pt: "Qual é o padrão de uso do veículo?", en: "What's the vehicle's usage pattern?", vhs: 0.10, vri: "use",
    opts: [
      { key: "highway", pt: "Predominantemente rodoviário, boas estradas", en: "Mostly highway, good roads", note: 10 },
      { key: "mixed", pt: "Uso misto", en: "Mixed use", note: 8 },
      { key: "urban", pt: "Predominantemente urbano", en: "Mostly urban", note: 6 },
      { key: "heavyUrban", pt: "Trânsito intenso e trajetos curtos", en: "Heavy traffic and short trips", note: 4 },
      { key: "appDelivery", pt: "Aplicativo, entregas ou uso profissional", en: "Rideshare, delivery or pro use", note: 2 },
      { key: "offroad", pt: "Mineração, obra ou fora de estrada severo", en: "Mining, construction or severe off-road", note: 1 },
    ],
  },
  {
    id: "engineArch", pt: "Qual a arquitetura do motor?", en: "What's the engine architecture?", vri: "engine",
    opts: [
      { key: "mpfi", pt: "Aspirado simples (MPFI)", en: "Simple naturally aspirated (MPFI)", note: 9 },
      { key: "carbureted", pt: "Carburado, simples e bem mantido", en: "Carbureted, simple and well kept", note: 7 },
      { key: "turboPfi", pt: "Turbo com injeção indireta (PFI)", en: "Turbo with port injection (PFI)", note: 7 },
      { key: "aspiratedDI", pt: "Aspirado com injeção direta", en: "Naturally aspirated, direct injection", note: 8 },
      { key: "turboDI", pt: "Turbo com injeção direta", en: "Turbo, direct injection", note: 6 },
      { key: "modified", pt: "Motor modificado ou remapeado", en: "Modified or remapped engine", note: 2 },
      { key: "conversion", pt: "Conversão de combustível não homologada", en: "Non-approved fuel conversion", note: 2 },
      { key: "unknown", pt: "Não sei", en: "Don't know", note: 6 },
    ],
  },
  {
    id: "transmission", pt: "Qual o tipo de câmbio?", en: "What's the transmission type?", vri: "transmission",
    opts: [
      { key: "manual", pt: "Manual", en: "Manual", note: 9 },
      { key: "autoTC", pt: "Automático (conversor de torque)", en: "Automatic (torque converter)", note: 8 },
      { key: "cvt", pt: "CVT", en: "CVT", note: 7 },
      { key: "amt", pt: "Automatizado de uma embreagem", en: "Single-clutch automated", note: 5 },
      { key: "dctWet", pt: "Dupla embreagem banhada a óleo", en: "Wet dual-clutch", note: 7 },
      { key: "dctDry", pt: "Dupla embreagem seca", en: "Dry dual-clutch", note: 5 },
      { key: "oldAuto", pt: "Automático antigo (antes de 2005)", en: "Old automatic (pre-2005)", note: 5 },
      { key: "modified", pt: "Modificado / remapeado", en: "Modified / remapped", note: 3 },
      { key: "unknown", pt: "Não sei", en: "Don't know", note: 6 },
    ],
  },
];

export type LocalizedQuestion = { id: string; label: string; options: { key: string; label: string }[] };

export function getHealthQuiz(locale: Locale): LocalizedQuestion[] {
  const pick = (pt: string, en: string) => (locale === "pt" ? pt : en);
  return HEALTH_QUESTIONS.map((q) => ({
    id: q.id,
    label: pick(q.pt, q.en),
    options: q.opts.map((o) => ({ key: o.key, label: pick(o.pt, o.en) })),
  }));
}

export const QUIZ_QUESTION_COUNT = HEALTH_QUESTIONS.length;

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

function optOf(qid: string, answers: Record<string, string>): Opt | null {
  const q = HEALTH_QUESTIONS.find((x) => x.id === qid);
  if (!q) return null;
  return q.opts.find((o) => o.key === answers[qid]) ?? null;
}
const noteOf = (qid: string, answers: Record<string, string>, fallback = 5): number =>
  optOf(qid, answers)?.note ?? fallback;

export type QuizResult = { score: number; vhs: number; vri: number };

// Robustness (0-10) of the km/age component, derived from the car itself.
function kmAgeNote(v: Vehicle, now: Date): number {
  const age = Math.max(0, now.getFullYear() - v.year);
  const km = typeof v.odometerKm === "number" && v.odometerKm > 0 ? v.odometerKm : age * 12000;
  const ageNote = clamp(10 - age * 0.3, 0, 10);
  const kmNote = clamp(10 - km / 25000, 0, 10);
  return (ageNote + kmNote) / 2;
}

export function computeQuizHealth(answers: Record<string, string>, v: Vehicle, now = new Date()): QuizResult {
  // --- VHS: weighted average of answered VHS questions (renormalized). ---
  let wSum = 0;
  let contrib = 0;
  let cap = 100;
  for (const q of HEALTH_QUESTIONS) {
    if (!q.vhs) continue;
    const o = optOf(q.id, answers);
    const note = o?.note ?? 5; // "unknown" is conservative-intermediate
    contrib += (note / 10) * q.vhs;
    wSum += q.vhs;
    if (o?.cap != null) cap = Math.min(cap, o.cap);
  }
  const vhsBase = wSum > 0 ? (contrib / wSum) * 100 : 100;
  const vhsFinal = clamp(Math.min(vhsBase, cap), 0, 100);

  // --- VRI: 100 - robustness across weighted components. ---
  const rob = {
    kmAge: kmAgeNote(v, now),
    engine: noteOf("engineArch", answers, 6),
    transmission: noteOf("transmission", answers, 6),
    use: noteOf("usePattern", answers, 6),
    history: noteOf("history", answers, 4),
    symptoms: (noteOf("noises", answers) + noteOf("engineRun", answers)) / 2,
  };
  const W = { kmAge: 0.25, engine: 0.15, transmission: 0.15, use: 0.2, history: 0.15, symptoms: 0.1 };
  const robustness =
    (rob.kmAge / 10) * W.kmAge +
    (rob.engine / 10) * W.engine +
    (rob.transmission / 10) * W.transmission +
    (rob.use / 10) * W.use +
    (rob.history / 10) * W.history +
    (rob.symptoms / 10) * W.symptoms;
  const vri = clamp(100 - robustness * 100, 0, 100);

  const score = Math.round(clamp(0.8 * vhsFinal + 0.2 * (100 - vri), 0, 100));
  return { score, vhs: Math.round(vhsFinal), vri: Math.round(vri) };
}
