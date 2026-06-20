// Thin client wrappers around our own /api/fipe proxy. Map the app's vehicle
// type to BrasilAPI's "kind". Every call can throw — callers fall back to the
// local mock estimator so the experience never breaks.

import type { VehicleType } from "./types";

export type Brand = { nome: string; valor: string };
export type Model = { modelo: string; valor: string };
export type PriceEntry = { value: number; year: number; fuel: string; label: string; codigoFipe: string };
export type MatchResult = { value: number; codigoFipe: string; label: string; year: number };

export const kindOf = (t: VehicleType) => (t === "moto" ? "motos" : "carros");

async function api<T>(params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/fipe?${qs}`);
  if (!res.ok) throw new Error(`fipe ${res.status}`);
  return (await res.json()) as T;
}

export const fipeGetBrands = (t: VehicleType) => api<Brand[]>({ action: "brands", type: kindOf(t) });
export const fipeGetModels = (t: VehicleType, brand: string) =>
  api<Model[]>({ action: "models", type: kindOf(t), brand });
export const fipeGetPrices = (t: VehicleType, code: string) => api<PriceEntry[]>({ action: "price", type: kindOf(t), code });
export const fipeMatch = (t: VehicleType, brand: string, model: string, year: number) =>
  api<MatchResult>({ action: "match", type: kindOf(t), brand, model, year: String(year) });
