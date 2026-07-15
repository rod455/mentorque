// Transparent, explainable vehicle-health heuristic.
//
// Health starts at 100 and loses points for overdue maintenance, unknown
// mileage and long-unserviced systems. It is intentionally simple and readable
// (no black box): the same rules also drive the "Próximas revisões" screen.
// Scores are clamped to [30, 100] so a neglected car reads "needs work", not
// "totaled".

import type { ServiceRecord, SystemKey, Vehicle } from "./types";

// Which systems a logged service type touches.
export const SERVICE_SYSTEMS: Record<string, SystemKey[]> = {
  oil: ["engine"],
  timing: ["engine"],
  airfilter: ["engine"],
  brakes: ["brakes"],
  brakefluid: ["brakes"],
  suspension: ["suspension"],
  tires: ["tires"],
  battery: ["electrical"],
  electrical: ["electrical"],
  revision: ["engine", "brakes", "suspension"],
  other: [],
};

export const ALL_SYSTEMS: SystemKey[] = ["engine", "brakes", "suspension", "tires", "electrical"];

// Interval rules used by both health and the revisions planner.
export type RevisionRule = { key: string; everyKm?: number; everyMonths?: number; systems: SystemKey[] };
export const REVISION_RULES: RevisionRule[] = [
  { key: "oil", everyKm: 10000, everyMonths: 12, systems: ["engine"] },
  { key: "airfilter", everyKm: 20000, systems: ["engine"] },
  { key: "brakes", everyKm: 40000, systems: ["brakes"] },
  { key: "brakefluid", everyMonths: 24, systems: ["brakes"] },
  { key: "timing", everyKm: 60000, everyMonths: 48, systems: ["engine"] },
  { key: "tires", everyKm: 50000, systems: ["tires"] },
  { key: "battery", everyMonths: 48, systems: ["electrical"] },
];

export type Finding = { code: string; severity: "high" | "medium" | "low"; system?: SystemKey; km?: number };
export type SystemStatus = { key: SystemKey; status: "ok" | "attention" | "overdue"; lastKm?: number; lastDate?: string };
export type Health = { score: number; findings: Finding[]; systems: SystemStatus[]; hasKm: boolean };

const monthsBetween = (isoFrom: string, to: Date): number => {
  const d = new Date(isoFrom + "T00:00:00");
  if (isNaN(d.getTime())) return Infinity;
  return (to.getFullYear() - d.getFullYear()) * 12 + (to.getMonth() - d.getMonth());
};

// Most recent service of a given type (by km, then date).
function lastOfType(services: ServiceRecord[], type: string): ServiceRecord | null {
  const list = services.filter((s) => s.type === type);
  if (!list.length) return null;
  return list.slice().sort((a, b) => (b.km || 0) - (a.km || 0) || b.date.localeCompare(a.date))[0];
}

// Most recent service touching a system.
function lastForSystem(services: ServiceRecord[], system: SystemKey): ServiceRecord | null {
  const list = services.filter((s) => (SERVICE_SYSTEMS[s.type] ?? []).includes(system));
  if (!list.length) return null;
  return list.slice().sort((a, b) => (b.km || 0) - (a.km || 0) || b.date.localeCompare(a.date))[0];
}

export function computeHealth(vehicle: Vehicle, services: ServiceRecord[], now = new Date()): Health {
  const km = vehicle.odometerKm;
  const hasKm = typeof km === "number" && km > 0;
  const findings: Finding[] = [];
  let score = 100;

  // 1) Unknown mileage — we can't plan without it.
  if (!hasKm) {
    score -= 6;
    findings.push({ code: "no_km", severity: "low" });
  }

  // 2) Oil — the single most impactful item.
  const oil = lastOfType(services, "oil");
  if (hasKm) {
    if (oil) {
      const since = km! - (oil.km || 0);
      if (since >= 10000) {
        score -= Math.min(22, 10 + Math.floor((since - 10000) / 1000));
        findings.push({ code: "oil_overdue", severity: "high", km: since });
      } else if (since >= 8000) {
        findings.push({ code: "oil_due_soon", severity: "medium", km: 10000 - since });
      }
    } else if (km! > 8000) {
      score -= 12;
      findings.push({ code: "oil_unknown", severity: "medium" });
    }
  }

  // 3) Major revision cadence (every 10k km).
  const revision = lastOfType(services, "revision");
  if (hasKm && (!revision || km! - (revision.km || 0) >= 10000)) {
    score -= 10;
    findings.push({ code: "revision_overdue", severity: "medium" });
  }

  // 4) Per-system status + long-unserviced penalty.
  const systems: SystemStatus[] = ALL_SYSTEMS.map((sys) => {
    const last = lastForSystem(services, sys);
    let status: SystemStatus["status"] = "ok";
    if (!last) {
      // No record: fine on a low-km car, worth attention on an older one.
      if (hasKm && km! > 60000) {
        status = "overdue";
        score -= 6;
        findings.push({ code: "system_no_history", severity: "medium", system: sys });
      } else if (hasKm && km! > 30000) {
        status = "attention";
        score -= 2;
      }
    } else {
      const overdueByTime = monthsBetween(last.date, now) > 36;
      const overdueByKm = hasKm && km! - (last.km || 0) > 40000;
      if (overdueByTime || overdueByKm) {
        status = "attention";
        score -= 3;
      }
    }
    return { key: sys, status, lastKm: last?.km, lastDate: last?.date };
  });

  return { score: Math.max(30, Math.min(100, Math.round(score))), findings, systems, hasKm };
}

// Upcoming maintenance derived from the same rules (for the Revisões screen).
export type UpcomingItem = {
  key: string;
  basis: "km" | "time" | "history";
  status: "overdue" | "soon" | "ok";
  dueKm?: number; // km at which it's due
  inKm?: number; // km remaining (negative = overdue)
  months?: number; // months since last (for time-based)
  systems: SystemKey[];
};

export function computeUpcoming(vehicle: Vehicle, services: ServiceRecord[], now = new Date()): UpcomingItem[] {
  const km = vehicle.odometerKm;
  const hasKm = typeof km === "number" && km > 0;
  const items: UpcomingItem[] = [];

  for (const rule of REVISION_RULES) {
    const last = lastOfType(services, rule.key) ?? (rule.systems.length ? null : null);
    // km-based
    if (rule.everyKm && hasKm) {
      const base = last?.km ?? 0;
      const dueKm = base + rule.everyKm;
      const inKm = dueKm - km!;
      const status: UpcomingItem["status"] = inKm <= 0 ? "overdue" : inKm <= 2000 ? "soon" : "ok";
      if (status !== "ok" || !last) items.push({ key: rule.key, basis: "km", status, dueKm, inKm, systems: rule.systems });
    }
    // time-based
    if (rule.everyMonths && last) {
      const months = monthsBetween(last.date, now);
      const status: UpcomingItem["status"] = months >= rule.everyMonths ? "overdue" : months >= rule.everyMonths - 3 ? "soon" : "ok";
      if (status !== "ok") items.push({ key: rule.key, basis: "time", status, months, systems: rule.systems });
    }
  }

  // Sort worst-first.
  const rank = { overdue: 0, soon: 1, ok: 2 } as const;
  return items.sort((a, b) => rank[a.status] - rank[b.status] || (a.inKm ?? 0) - (b.inKm ?? 0));
}
