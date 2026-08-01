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
  momentPhotos?: Record<string, string>;
  startedAt?: string | null;
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
  // Marcos: `manual` ones the driver confirms with a tap; the rest unlock from
  // real app usage. Momentos: experiences the driver registers (com foto).
  manual?: boolean;
  earned: (s: GamSession) => boolean;
};

const filled = (v?: string | null) => !!v && v.trim().length > 0;
const profileComplete = (s: GamSession) => filled(s.name) && filled(s.email) && filled(s.state);
const cars = (s: GamSession) => s.vehicles?.length ?? 0;
const svc = (s: GamSession) => s.services?.length ?? 0;
const claimed = (s: GamSession, id: string) => (s.claimedMilestones ?? []).includes(id);
const hasNickname = (s: GamSession) => (s.vehicles ?? []).some((v) => filled(v?.nickname));
const hasPhoto = (s: GamSession, id: string) => !!s.momentPhotos?.[id];
// A moment counts as lived once the driver marks it or adds a photo.
export const isLived = (s: GamSession, id: string) => claimed(s, id) || hasPhoto(s, id);

// Whole months since an ISO date (yyyy-mm-dd). Runs client-side only.
function monthsSince(iso?: string | null): number {
  if (!iso) return 0;
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  if (isNaN(d.getTime())) return 0;
  const now = new Date();
  return Math.max(0, (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth()));
}

// "Marcos" = conquistas (umas destravam pelo uso do app, outras o motorista
// marca). "Momentos" = experiências vividas com o carro, com foto opcional.
export const MILESTONES: Milestone[] = [
  // Marcos — automáticos (uso do app)
  { id: "welcome", emoji: "👋", cat: "marco", earned: () => true },
  { id: "firstCar", emoji: "🚗", cat: "marco", earned: (s) => cars(s) >= 1 },
  { id: "named", emoji: "🏷️", cat: "marco", earned: (s) => hasNickname(s) },
  { id: "profileDone", emoji: "🪪", cat: "marco", earned: (s) => profileComplete(s) },
  { id: "firstService", emoji: "🧾", cat: "marco", earned: (s) => svc(s) >= 1 },
  { id: "fiveServices", emoji: "📋", cat: "marco", earned: (s) => svc(s) >= 5 },
  { id: "tenServices", emoji: "🗂️", cat: "marco", earned: (s) => svc(s) >= 10 },
  { id: "garageFull", emoji: "🅿️", cat: "marco", earned: (s) => cars(s) >= 3 },
  { id: "supporter", emoji: "⭐", cat: "marco", earned: (s) => !!s.premium },
  { id: "firstMonth", emoji: "🗓️", cat: "marco", earned: (s) => monthsSince(s.startedAt) >= 1 },
  { id: "firstYear", emoji: "🎂", cat: "marco", earned: (s) => monthsSince(s.startedAt) >= 12 },

  // Marcos — o motorista marca (fazer e ativar)
  { id: "onTime", emoji: "✅", cat: "marco", manual: true, earned: (s) => claimed(s, "onTime") },
  { id: "streak", emoji: "🔥", cat: "marco", manual: true, earned: (s) => claimed(s, "streak") },
  { id: "explorer", emoji: "📚", cat: "marco", manual: true, earned: (s) => claimed(s, "explorer") },
  { id: "diagnostician", emoji: "🔍", cat: "marco", manual: true, earned: (s) => claimed(s, "diagnostician") },
  { id: "comeback", emoji: "🔄", cat: "marco", manual: true, earned: (s) => claimed(s, "comeback") },

  // Momentos — experiências com o carro (registra + foto)
  { id: "firstTrip", emoji: "🛣️", cat: "momento", earned: (s) => isLived(s, "firstTrip") },
  { id: "roadTrip", emoji: "🌄", cat: "momento", earned: (s) => isLived(s, "roadTrip") },
  { id: "firstWash", emoji: "🧼", cat: "momento", earned: (s) => isLived(s, "firstWash") },
  { id: "nightDrive", emoji: "🌙", cat: "momento", earned: (s) => isLived(s, "nightDrive") },
  { id: "rain", emoji: "🌧️", cat: "momento", earned: (s) => isLived(s, "rain") },
  { id: "sunset", emoji: "🌅", cat: "momento", earned: (s) => isLived(s, "sunset") },
  { id: "fullTank", emoji: "⛽", cat: "momento", earned: (s) => isLived(s, "fullTank") },
  { id: "accessory", emoji: "🎁", cat: "momento", earned: (s) => isLived(s, "accessory") },
];
