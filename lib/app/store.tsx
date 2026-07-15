"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { newId, type ServiceRecord, type Vehicle } from "./types";

// Client-side session for the car-centric prototype: a garage of vehicles, one
// "active" vehicle, and a flat list of service records. Persisted to
// localStorage so a refresh keeps the whole garage.

type Session = {
  onboarded: boolean;
  name: string | null;
  premium: boolean;
  vehicles: Vehicle[];
  activeVehicleId: string | null;
  services: ServiceRecord[];
};

const EMPTY: Session = {
  onboarded: false,
  name: null,
  premium: false,
  vehicles: [],
  activeVehicleId: null,
  services: [],
};

const STORAGE_KEY = "mentorque-garage";

type StoreValue = {
  s: Session;
  setName: (name: string) => void;
  setPremium: (v: boolean) => void;
  addVehicle: (v: Omit<Vehicle, "id">) => string;
  updateVehicle: (id: string, patch: Partial<Vehicle>) => void;
  removeVehicle: (id: string) => void;
  setActiveVehicle: (id: string) => void;
  addService: (rec: Omit<ServiceRecord, "id">) => string;
  updateService: (id: string, patch: Partial<ServiceRecord>) => void;
  removeService: (id: string) => void;
  finishOnboarding: () => void;
  reset: () => void;
};

const Ctx = createContext<StoreValue | null>(null);

// Migrate the old single-vehicle shape (mentorque-proto) if present.
function migrate(parsed: any): Session {
  if (parsed && Array.isArray(parsed.vehicles)) return { ...EMPTY, ...parsed } as Session;
  const next: Session = { ...EMPTY };
  if (parsed?.vehicle) {
    const id = newId();
    next.vehicles = [{ id, ...parsed.vehicle, odometerKm: parsed.odometerKm ?? undefined, photo: parsed.photo ?? undefined }];
    next.activeVehicleId = id;
    if (parsed.lastService) {
      next.services = [{ id: newId(), vehicleId: id, type: "revision", date: parsed.lastService.date, km: parsed.lastService.km, parts: [], notes: parsed.lastService.notes }];
    }
  }
  next.name = parsed?.name ?? null;
  next.premium = !!parsed?.premium;
  next.onboarded = !!parsed?.onboarded && next.vehicles.length > 0;
  return next;
}

export function PrototypeProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<Session>(EMPTY);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" && (window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem("mentorque-proto"));
      if (raw) setS(migrate(JSON.parse(raw)));
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  const commit = useCallback((next: Session) => {
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota errors */
    }
    return next;
  }, []);

  const patch = useCallback((fn: (prev: Session) => Session) => setS((prev) => commit(fn(prev))), [commit]);

  const setName = useCallback((name: string) => patch((p) => ({ ...p, name: name.trim() || null })), [patch]);
  const setPremium = useCallback((v: boolean) => patch((p) => ({ ...p, premium: v })), [patch]);

  const addVehicle = useCallback(
    (v: Omit<Vehicle, "id">) => {
      const id = newId();
      patch((p) => ({ ...p, vehicles: [...p.vehicles, { ...v, id }], activeVehicleId: id }));
      return id;
    },
    [patch]
  );

  const updateVehicle = useCallback(
    (id: string, up: Partial<Vehicle>) => patch((p) => ({ ...p, vehicles: p.vehicles.map((v) => (v.id === id ? { ...v, ...up } : v)) })),
    [patch]
  );

  const removeVehicle = useCallback(
    (id: string) =>
      patch((p) => {
        const vehicles = p.vehicles.filter((v) => v.id !== id);
        const services = p.services.filter((r) => r.vehicleId !== id);
        const activeVehicleId = p.activeVehicleId === id ? vehicles[0]?.id ?? null : p.activeVehicleId;
        return { ...p, vehicles, services, activeVehicleId };
      }),
    [patch]
  );

  const setActiveVehicle = useCallback((id: string) => patch((p) => ({ ...p, activeVehicleId: id })), [patch]);

  const addService = useCallback(
    (rec: Omit<ServiceRecord, "id">) => {
      const id = newId();
      patch((p) => {
        // Logging a service also advances the vehicle's odometer if higher.
        const vehicles = p.vehicles.map((v) => (v.id === rec.vehicleId && rec.km > (v.odometerKm ?? 0) ? { ...v, odometerKm: rec.km } : v));
        return { ...p, services: [{ ...rec, id }, ...p.services], vehicles };
      });
      return id;
    },
    [patch]
  );

  const updateService = useCallback(
    (id: string, up: Partial<ServiceRecord>) => patch((p) => ({ ...p, services: p.services.map((r) => (r.id === id ? { ...r, ...up } : r)) })),
    [patch]
  );

  const removeService = useCallback((id: string) => patch((p) => ({ ...p, services: p.services.filter((r) => r.id !== id) })), [patch]);

  const finishOnboarding = useCallback(() => patch((p) => ({ ...p, onboarded: true })), [patch]);
  const reset = useCallback(() => patch(() => ({ ...EMPTY })), [patch]);

  const value = useMemo<StoreValue>(
    () => ({ s, setName, setPremium, addVehicle, updateVehicle, removeVehicle, setActiveVehicle, addService, updateService, removeService, finishOnboarding, reset }),
    [s, setName, setPremium, addVehicle, updateVehicle, removeVehicle, setActiveVehicle, addService, updateService, removeService, finishOnboarding, reset]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePrototype() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePrototype must be used within PrototypeProvider");
  return ctx;
}

// ---- Selectors -------------------------------------------------------------
export function activeVehicle(s: Session): Vehicle | null {
  return s.vehicles.find((v) => v.id === s.activeVehicleId) ?? s.vehicles[0] ?? null;
}
export function servicesFor(s: Session, vehicleId: string | null | undefined): ServiceRecord[] {
  if (!vehicleId) return [];
  return s.services.filter((r) => r.vehicleId === vehicleId).sort((a, b) => b.date.localeCompare(a.date) || b.km - a.km);
}
