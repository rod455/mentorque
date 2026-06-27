// Thin client wrappers around our own /api/vehicle proxy (NHTSA). Every call can
// throw or return empty — UI must render a graceful "no data" state, especially
// for BR-only models that NHTSA (US market) doesn't cover.

import type { ComplaintsSummary, RecallItem, SafetyRating } from "./nhtsa";

export type { ComplaintsSummary, RecallItem, SafetyRating };

async function api<T>(params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/vehicle?${qs}`);
  if (!res.ok) throw new Error(`vehicle ${res.status}`);
  return (await res.json()) as T;
}

export const fetchRecalls = (make: string, model: string, year: number) =>
  api<RecallItem[]>({ action: "recalls", make, model, year: String(year) });
export const fetchComplaints = (make: string, model: string, year: number) =>
  api<ComplaintsSummary>({ action: "complaints", make, model, year: String(year) });
export const fetchSafety = (make: string, model: string, year: number) =>
  api<SafetyRating | null>({ action: "safety", make, model, year: String(year) });
