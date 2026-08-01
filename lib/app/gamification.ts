// Mentorque gamification — the "phases" (levels) and "acervo" (milestones)
// system, inspired by plant-care apps but mapped onto caring for a car.
//
// This module is intentionally i18n-agnostic: it only holds the *structure*
// (ids, emoji, colors, point thresholds and the earned/locked logic). All
// human-facing copy lives in content.ts keyed by these ids, so both languages
// stay in sync. Everything is computed locally from the prototype session, so
// it works in guest mode and needs no backend.

// Minimal shape we read from the store's session.
export type GamSession = {
  name?: string | null;
  email?: string | null;
  state?: string | null;
  premium?: boolean;
  vehicles: ReadonlyArray<{ nickname?: string | null }>;
  services: unknown[];
  claimedMilestones?: string[];
};

export type Phase = {
  id: string;
  emoji: string;
  tint: string; // tailwind classes for the badge circle
  min: number; // points needed to reach this phase
};

// Six phases of the journey — from just-arrived to living-and-breathing it.
export const PHASES: Phase[] = [
  { id: "aprendiz", emoji: "🔰", tint: "bg-teal/15 text-teal", min: 0 },
  { id: "piloto", emoji: "🚗", tint: "bg-teal/20 text-teal", min: 20 },
  { id: "cuidador", emoji: "🔧", tint: "bg-amber/15 text-amber", min: 80 },
  { id: "mecanico", emoji: "🛠️", tint: "bg-amber/20 text-amber-300", min: 180 },
  { id: "mestre", emoji: "🏆", tint: "bg-coral/15 text-coral", min: 350 },
  { id: "lenda", emoji: "⭐", tint: "bg-amber/25 text-amber-300", min: 600 },
];

// Points earned per concrete, trackable action in the prototype. Kept in sync
// with the "O que faz você avançar" list shown to the user.
export const POINTS = {
  perCar: 20,
  perService: 15,
  namePart: 5,
  emailPart: 5,
  statePart: 5,
  premium: 25,
} as const;

export function computePoints(s: GamSession): number {
  let p = 0;
  p += (s.vehicles?.length ?? 0) * POINTS.perCar;
  p += (s.services?.length ?? 0) * POINTS.perService;
  if (s.name?.trim()) p += POINTS.namePart;
  if (s.email?.trim()) p += POINTS.emailPart;
  if (s.state?.trim()) p += POINTS.statePart;
  if (s.premium) p += POINTS.premium;
  return p;
}

export type GamStatus = {
  points: number;
  phase: Phase;
  phaseIndex: number;
  nextPhase: Phase | null;
  toNext: number; // points remaining to the next phase (0 at max)
  progress: number; // 0..1 within the current phase band
  earnedMarcos: number;
  earnedMomentos: number;
};

export function computeStatus(s: GamSession): GamStatus {
  const points = computePoints(s);
  let phaseIndex = 0;
  for (let i = 0; i < PHASES.length; i++) if (points >= PHASES[i].min) phaseIndex = i;
  const phase = PHASES[phaseIndex];
  const nextPhase = PHASES[phaseIndex + 1] ?? null;
  const toNext = nextPhase ? Math.max(0, nextPhase.min - points) : 0;
  const band = nextPhase ? nextPhase.min - phase.min : 1;
  const progress = nextPhase ? Math.min(1, (points - phase.min) / band) : 1;
  return {
    points,
    phase,
    phaseIndex,
    nextPhase,
    toNext,
    progress,
    earnedMarcos: MILESTONES.filter((m) => m.cat === "marco" && m.earned(s)).length,
    earnedMomentos: MILESTONES.filter((m) => m.cat === "momento" && m.earned(s)).length,
  };
}

export type Milestone = {
  id: string;
  emoji: string;
  cat: "marco" | "momento";
  // Experiential badges only the driver can confirm: tap to mark as lived.
  manual?: boolean;
  earned: (s: GamSession) => boolean;
};

const filled = (v?: string | null) => !!v && v.trim().length > 0;
const profileComplete = (s: GamSession) => filled(s.name) && filled(s.email) && filled(s.state);
const cars = (s: GamSession) => s.vehicles?.length ?? 0;
const svc = (s: GamSession) => s.services?.length ?? 0;
const claimed = (s: GamSession, id: string) => (s.claimedMilestones ?? []).includes(id);
const hasNickname = (s: GamSession) => (s.vehicles ?? []).some((v) => filled(v?.nickname));

// "Marcos" mix things we can verify from the session (cadastros, serviços) with
// experiências que só o motorista conhece — essas são `manual` e o usuário
// marca com um toque. "Momentos" = hábitos ao longo do tempo (aspiracionais).
export const MILESTONES: Milestone[] = [
  // Marcos — cuidado / uso
  { id: "welcome", emoji: "👋", cat: "marco", earned: () => true },
  { id: "firstCar", emoji: "🚗", cat: "marco", earned: (s) => cars(s) >= 1 },
  { id: "named", emoji: "🏷️", cat: "marco", earned: (s) => hasNickname(s) },
  { id: "profileDone", emoji: "🪪", cat: "marco", earned: (s) => profileComplete(s) },
  { id: "firstService", emoji: "🧾", cat: "marco", earned: (s) => svc(s) >= 1 },
  { id: "fiveServices", emoji: "📋", cat: "marco", earned: (s) => svc(s) >= 5 },
  { id: "garageFull", emoji: "🅿️", cat: "marco", earned: (s) => cars(s) >= 3 },
  { id: "tenServices", emoji: "🗂️", cat: "marco", earned: (s) => svc(s) >= 10 },
  { id: "supporter", emoji: "⭐", cat: "marco", earned: (s) => !!s.premium },

  // Marcos — experiência (o motorista confirma)
  { id: "firstTrip", emoji: "🛣️", cat: "marco", manual: true, earned: (s) => claimed(s, "firstTrip") },
  { id: "roadTrip", emoji: "🌄", cat: "marco", manual: true, earned: (s) => claimed(s, "roadTrip") },
  { id: "firstWash", emoji: "🧼", cat: "marco", manual: true, earned: (s) => claimed(s, "firstWash") },
  { id: "nightDrive", emoji: "🌙", cat: "marco", manual: true, earned: (s) => claimed(s, "nightDrive") },
  { id: "rain", emoji: "🌧️", cat: "marco", manual: true, earned: (s) => claimed(s, "rain") },
  { id: "fullTank", emoji: "⛽", cat: "marco", manual: true, earned: (s) => claimed(s, "fullTank") },

  // Momentos
  { id: "onboard", emoji: "🧭", cat: "momento", earned: () => true },
  { id: "firstMonth", emoji: "🗓️", cat: "momento", earned: () => false },
  { id: "firstYear", emoji: "🎂", cat: "momento", earned: () => false },
  { id: "comeback", emoji: "🔄", cat: "momento", earned: () => false },
  { id: "onTime", emoji: "✅", cat: "momento", earned: () => false },
  { id: "streak", emoji: "🔥", cat: "momento", earned: () => false },
  { id: "explorer", emoji: "📚", cat: "momento", earned: () => false },
  { id: "diagnostician", emoji: "🔍", cat: "momento", earned: () => false },
];
