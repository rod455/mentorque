"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ServiceRecord, Tag, Vehicle } from "./types";

// The prototype keeps the whole "session" client-side (mocked data, no backend
// yet). It persists to localStorage so a refresh doesn't drop you out of the
// experience mid-test.

type Session = {
  onboarded: boolean;
  intentions: Tag[];
  principal: Tag | null;
  vehicle: Vehicle | null; // null while unset; cleared by "learn only"
  noVehicle: boolean; // true when the user explicitly has no vehicle
  premium: boolean;
  photo: string | null; // user's car photo (downscaled data URL)
  odometerKm: number | null; // current mileage
  lastService: ServiceRecord | null; // most recent logged service
  oilAlertKm: number | null; // km target for the next oil-change reminder
};

const EMPTY: Session = {
  onboarded: false,
  intentions: [],
  principal: null,
  vehicle: null,
  noVehicle: false,
  premium: false,
  photo: null,
  odometerKm: null,
  lastService: null,
  oilAlertKm: null,
};

const STORAGE_KEY = "mentorque-proto";

type StoreValue = {
  s: Session;
  toggleIntention: (t: Tag) => void;
  setPrincipal: (t: Tag) => void;
  setVehicle: (v: Vehicle) => void;
  setNoVehicle: () => void;
  finishOnboarding: () => void;
  setPremium: (v: boolean) => void;
  setPhoto: (dataUrl: string) => void;
  saveLastService: (rec: ServiceRecord, oilAlertKm: number | null) => void;
  reset: () => void;
};

const Ctx = createContext<StoreValue | null>(null);

export function PrototypeProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<Session>(EMPTY);

  // Hydrate from storage after mount (avoids SSR hydration mismatch).
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY);
      if (raw) setS({ ...EMPTY, ...(JSON.parse(raw) as Partial<Session>) });
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  const persist = useCallback((next: Session) => {
    setS(next);
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota errors */
    }
  }, []);

  const toggleIntention = useCallback(
    (t: Tag) =>
      setS((prev) => {
        const has = prev.intentions.includes(t);
        const intentions = has ? prev.intentions.filter((x) => x !== t) : [...prev.intentions, t];
        // Keep principal valid; default it to the first pick when <3 selected.
        let principal = prev.principal;
        if (principal && !intentions.includes(principal)) principal = null;
        if (!principal && intentions.length > 0 && intentions.length < 3) principal = intentions[0];
        const next = { ...prev, intentions, principal };
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      }),
    []
  );

  const setPrincipal = useCallback((t: Tag) => setS((p) => persistReturn(p, { principal: t })), []);
  const setVehicle = useCallback((v: Vehicle) => setS((p) => persistReturn(p, { vehicle: v, noVehicle: false })), []);
  const setNoVehicle = useCallback(() => setS((p) => persistReturn(p, { vehicle: null, noVehicle: true })), []);
  const finishOnboarding = useCallback(() => setS((p) => persistReturn(p, { onboarded: true })), []);
  const setPremium = useCallback((v: boolean) => setS((p) => persistReturn(p, { premium: v })), []);
  const setPhoto = useCallback((dataUrl: string) => setS((p) => persistReturn(p, { photo: dataUrl })), []);
  const saveLastService = useCallback(
    (rec: ServiceRecord, oilAlertKm: number | null) =>
      setS((p) => persistReturn(p, { lastService: rec, odometerKm: rec.km, oilAlertKm })),
    []
  );
  const reset = useCallback(() => persist(EMPTY), [persist]);

  const value = useMemo<StoreValue>(
    () => ({ s, toggleIntention, setPrincipal, setVehicle, setNoVehicle, finishOnboarding, setPremium, setPhoto, saveLastService, reset }),
    [s, toggleIntention, setPrincipal, setVehicle, setNoVehicle, finishOnboarding, setPremium, setPhoto, saveLastService, reset]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// Small helper: merge a patch, write through to storage, return the next state.
function persistReturn(prev: Session, patch: Partial<Session>): Session {
  const next = { ...prev, ...patch };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export function usePrototype() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePrototype must be used within PrototypeProvider");
  return ctx;
}

// The dominant tag drives Home ordering and which Premium pitch closes.
// Urgency wins when present; otherwise the chosen principal; otherwise the
// first intention; defaulting to "care".
export function dominantTag(s: Session): Tag {
  if (s.intentions.includes("urgent")) return "urgent";
  return s.principal ?? s.intentions[0] ?? "care";
}
