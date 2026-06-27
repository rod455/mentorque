"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Level, ServiceRecord, Tag, Vehicle } from "./types";

// The prototype keeps the whole "session" client-side (mocked data, no backend
// yet). It persists to localStorage so a refresh doesn't drop you out of the
// experience mid-test.

// Onboarding lets the user pick up to three intentions (Q2).
export const MAX_INTENTIONS = 3;

type Session = {
  onboarded: boolean;
  name: string | null; // first name, for the Home greeting
  intentions: Tag[]; // up to MAX_INTENTIONS (Q2)
  level: Level | null; // experience level (Q3)
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
  name: null,
  intentions: [],
  level: null,
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
  setName: (name: string) => void;
  toggleIntention: (t: Tag) => void;
  setLevel: (l: Level) => void;
  setVehicle: (v: Vehicle) => void;
  setVehicleSpec: (patch: { engine?: string; version?: string }) => void;
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
        // Removing is always allowed; adding is capped at MAX_INTENTIONS.
        if (!has && prev.intentions.length >= MAX_INTENTIONS) return prev;
        const intentions = has ? prev.intentions.filter((x) => x !== t) : [...prev.intentions, t];
        const next = { ...prev, intentions };
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      }),
    []
  );

  const setName = useCallback((name: string) => setS((p) => persistReturn(p, { name: name.trim() || null })), []);
  const setLevel = useCallback((l: Level) => setS((p) => persistReturn(p, { level: l })), []);
  const setVehicle = useCallback((v: Vehicle) => setS((p) => persistReturn(p, { vehicle: v, noVehicle: false })), []);
  const setVehicleSpec = useCallback(
    (patch: { engine?: string; version?: string }) =>
      setS((p) => (p.vehicle ? persistReturn(p, { vehicle: { ...p.vehicle, ...patch } }) : p)),
    []
  );
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
    () => ({ s, setName, toggleIntention, setLevel, setVehicle, setVehicleSpec, setNoVehicle, finishOnboarding, setPremium, setPhoto, saveLastService, reset }),
    [s, setName, toggleIntention, setLevel, setVehicle, setVehicleSpec, setNoVehicle, finishOnboarding, setPremium, setPhoto, saveLastService, reset]
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

// Tags that lead with the learning thread rather than the "fix my car" thread.
const LEARN_TAGS: Tag[] = ["learn_cars", "mechanics", "electronics", "career", "curiosity"];

// The dominant tag drives Home ordering and which Premium pitch closes. A live
// problem ("fix") wins when present; otherwise the first chosen intention;
// defaulting to "understand".
export function dominantTag(s: Session): Tag {
  if (s.intentions.includes("fix")) return "fix";
  return s.intentions[0] ?? "understand";
}

// Whether the experience should lead with learning (no vehicle, or the dominant
// intention is a learning one). Drives the onboarding "first lesson" beat and
// the learning-first Home layout.
export function isLearnFirst(s: Session): boolean {
  return s.noVehicle || LEARN_TAGS.includes(dominantTag(s));
}

// Pro audiences (working mechanics, engineering students/engineers, or anyone
// aiming for the field) get the "knowledge straight from the industry" shortcut.
export function isProAudience(s: Session): boolean {
  const proLevel = s.level === "mechanic" || s.level === "eng_student" || s.level === "engineer";
  const proIntent = s.intentions.some((t) => t === "career" || t === "mechanics" || t === "electronics");
  return proLevel || proIntent;
}
