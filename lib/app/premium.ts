// Freemium limits + small derived estimators shared across screens.
import type { ServiceRecord, SystemKey, Vehicle } from "./types";
import { computeHealth, type SystemStatus } from "./health";

export const LIMITS = {
  freeCars: 2,
  freeServices: 20,
  freeParts: 3,
};

// Rough "money saved" indicator for the Premium listing. Derived, transparent:
// each logged service/diagnosis is a moment the user avoided a blind decision.
export function economySaved(services: ServiceRecord[]): number {
  if (services.length === 0) return 0;
  return Math.min(2400, 150 + services.length * 120);
}

// Map a system status to a display percentage (Premium detail).
const STATUS_PCT: Record<SystemStatus["status"], number> = { ok: 92, attention: 68, overdue: 45 };
export function systemPct(status: SystemStatus["status"]): number {
  return STATUS_PCT[status];
}

// Very rough 6-month cost projection from systems needing attention (Premium).
export function costProjection(vehicle: Vehicle, services: ServiceRecord[]): { low: number; high: number } {
  const { systems } = computeHealth(vehicle, services);
  let low = 0;
  let high = 0;
  for (const s of systems) {
    if (s.status === "overdue") { low += 300; high += 900; }
    else if (s.status === "attention") { low += 120; high += 400; }
  }
  return { low, high };
}

// Priority bucket for a system (Premium recommendations).
export function systemPriority(status: SystemStatus["status"]): "now" | "soon" | "watch" {
  return status === "overdue" ? "now" : status === "attention" ? "soon" : "watch";
}

// Whether a symptom is "recommended for your car" (Premium badge): it touches a
// system that currently needs attention, or the car is high-km.
export function symptomRecommended(category: SystemKey, vehicle: Vehicle, services: ServiceRecord[]): boolean {
  const sys = computeHealth(vehicle, services).systems.find((s) => s.key === category);
  const highKm = (vehicle.odometerKm ?? 0) >= 80000;
  return (sys && sys.status !== "ok") || (highKm && (category === "brakes" || category === "engine")) || false;
}
