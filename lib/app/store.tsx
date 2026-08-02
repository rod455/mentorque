"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { newId, type ServiceRecord, type Vehicle } from "./types";
import { useAuth } from "./auth";
import { getBrowserSupabase } from "@/lib/supabaseBrowser";

// Client-side session for the car-centric prototype: a garage of vehicles, one
// "active" vehicle, and a flat list of service records. Persisted to
// localStorage so a refresh keeps the whole garage.

type Session = {
  onboarded: boolean;
  name: string | null;
  email: string | null;
  state: string | null;
  premium: boolean;
  vehicles: Vehicle[];
  activeVehicleId: string | null;
  services: ServiceRecord[];
  claimedMilestones: string[]; // badges the user marks by hand
  momentPhotos: Record<string, string>; // momento id → foto (data URL)
  seenLessons: string[]; // aulas/conteúdos já abertos (para sugerir outros)
  startedAt: string | null; // primeiro dia no app (para marcos de tempo)
  notifications: boolean; // preferência de notificações
  units: "metric" | "imperial"; // preferência de unidades
  avatar: string | null; // foto de perfil (data URL), sobrepõe a do Google
};

const EMPTY: Session = {
  onboarded: false,
  name: null,
  email: null,
  state: null,
  premium: false,
  vehicles: [],
  activeVehicleId: null,
  services: [],
  claimedMilestones: [],
  momentPhotos: {},
  seenLessons: [],
  startedAt: null,
  notifications: false,
  units: "metric",
  avatar: null,
};

// Today as yyyy-mm-dd (client-side only).
function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

const STORAGE_KEY = "mentorque-garage";

type StoreValue = {
  s: Session;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setState: (state: string) => void;
  setPremium: (v: boolean) => void;
  addVehicle: (v: Omit<Vehicle, "id">) => string;
  updateVehicle: (id: string, patch: Partial<Vehicle>) => void;
  removeVehicle: (id: string) => void;
  setActiveVehicle: (id: string) => void;
  addService: (rec: Omit<ServiceRecord, "id">) => string;
  updateService: (id: string, patch: Partial<ServiceRecord>) => void;
  removeService: (id: string) => void;
  toggleMilestone: (id: string) => void;
  markLessonSeen: (id: string) => void; // alterna concluído/não concluído
  setMomentPhoto: (id: string, dataUrl: string | null) => void;
  setNotifications: (v: boolean) => void;
  setUnits: (v: "metric" | "imperial") => void;
  setAvatar: (dataUrl: string | null) => void;
  subscribed: boolean; // assinatura Stripe ativa (fonte da verdade do premium)
  subscriptionEndsAt: string | null; // fim do período atual (ISO)
  subscriptionCanceling: boolean; // marcada para cancelar no fim do período
  refreshSubscription: () => void;
  finishOnboarding: () => void;
  reset: () => void;
};

const Ctx = createContext<StoreValue | null>(null);

// Migrate the old single-vehicle shape (mentorque-proto) if present.
function migrate(parsed: any): Session {
  if (parsed && Array.isArray(parsed.vehicles)) {
    const sess = { ...EMPTY, ...parsed } as Session;
    if (!Array.isArray(sess.claimedMilestones)) sess.claimedMilestones = [];
    if (!sess.momentPhotos || typeof sess.momentPhotos !== "object") sess.momentPhotos = {};
    if (!Array.isArray(sess.seenLessons)) sess.seenLessons = [];
    if (!sess.startedAt) sess.startedAt = todayISO();
    return sess;
  }
  const next: Session = { ...EMPTY };
  next.startedAt = parsed?.startedAt ?? todayISO();
  if (parsed?.vehicle) {
    const id = newId();
    next.vehicles = [{ id, ...parsed.vehicle, odometerKm: parsed.odometerKm ?? undefined, photo: parsed.photo ?? undefined }];
    next.activeVehicleId = id;
    if (parsed.lastService) {
      next.services = [{ id: newId(), vehicleId: id, type: "revision", date: parsed.lastService.date, km: parsed.lastService.km, parts: [], notes: parsed.lastService.notes }];
    }
  }
  next.name = parsed?.name ?? null;
  next.email = parsed?.email ?? null;
  next.state = parsed?.state ?? null;
  next.premium = !!parsed?.premium;
  next.onboarded = !!parsed?.onboarded && next.vehicles.length > 0;
  return next;
}

// Union two lists of entities by id (keeps items from both, cloud winning ties).
function mergeById<T extends { id: string }>(cloud: T[], local: T[]): T[] {
  const map = new Map<string, T>();
  for (const x of [...(local ?? []), ...(cloud ?? [])]) map.set(x.id, x);
  return [...map.values()];
}
// Merge cloud + local so logging in never loses guest work: cloud scalars win
// when set, but local-only vehicles/services are kept.
function mergeSessions(cloud: Session, local: Session): Session {
  return {
    onboarded: !!cloud.onboarded || !!local.onboarded,
    name: cloud.name ?? local.name,
    email: cloud.email ?? local.email,
    state: cloud.state ?? local.state,
    premium: !!cloud.premium || !!local.premium,
    vehicles: mergeById(cloud.vehicles ?? [], local.vehicles ?? []),
    activeVehicleId: cloud.activeVehicleId ?? local.activeVehicleId ?? null,
    services: mergeById(cloud.services ?? [], local.services ?? []),
    claimedMilestones: [...new Set([...(cloud.claimedMilestones ?? []), ...(local.claimedMilestones ?? [])])],
    momentPhotos: { ...(local.momentPhotos ?? {}), ...(cloud.momentPhotos ?? {}) },
    seenLessons: [...new Set([...(cloud.seenLessons ?? []), ...(local.seenLessons ?? [])])],
    startedAt: [cloud.startedAt, local.startedAt].filter(Boolean).sort()[0] ?? todayISO(),
    notifications: cloud.notifications ?? local.notifications ?? false,
    units: cloud.units ?? local.units ?? "metric",
    avatar: cloud.avatar ?? local.avatar ?? null,
  };
}

export function PrototypeProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<Session>(EMPTY);
  const [sub, setSub] = useState<{ active: boolean; endsAt: string | null; canceling: boolean }>({ active: false, endsAt: null, canceling: false });
  const subActive = sub.active;
  const { user } = useAuth();
  const supabase = getBrowserSupabase();
  const loadedFor = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reads the user's Stripe subscription from the `subscriptions` table.
  const refreshSubscription = useCallback(async () => {
    if (!user || !supabase) { setSub({ active: false, endsAt: null, canceling: false }); return; }
    const { data } = await supabase.from("subscriptions").select("status, current_period_end, cancel_at_period_end").eq("user_id", user.id).maybeSingle();
    setSub({
      active: !!data && ["active", "trialing"].includes(String(data.status)),
      endsAt: (data?.current_period_end as string | null) ?? null,
      canceling: !!data?.cancel_at_period_end,
    });
  }, [user, supabase]);

  useEffect(() => { refreshSubscription(); }, [refreshSubscription]);

  // Coming back from Stripe Checkout (/app?checkout=success): the webhook may
  // take a moment, so re-check a couple times and clean the URL.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (!params.has("checkout")) return;
    window.history.replaceState({}, "", window.location.pathname);
    let cancelled = false;
    (async () => {
      // Puxa o estado autoritativo do Stripe (não depende do webhook).
      try {
        const token = supabase ? (await supabase.auth.getSession()).data.session?.access_token : undefined;
        if (token) await fetch("/api/stripe/sync", { method: "POST", headers: { authorization: `Bearer ${token}` } });
      } catch { /* ignore */ }
      if (!cancelled) refreshSubscription();
    })();
    const t = setTimeout(refreshSubscription, 3000);
    return () => { cancelled = true; clearTimeout(t); };
  }, [refreshSubscription, supabase]);

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

  // On login: pull the user's cloud state and merge the local (guest) work into
  // it so nothing is lost. First login with an empty cloud pushes local up.
  useEffect(() => {
    if (!user || !supabase) { loadedFor.current = null; return; }
    if (loadedFor.current === user.id) return;
    loadedFor.current = user.id;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("user_state").select("data").eq("user_id", user.id).maybeSingle();
      if (cancelled) return;
      const cloud = (data?.data ?? null) as Session | null;
      setS((local) => {
        const merged = cloud ? mergeSessions(cloud, local) : local;
        if (!merged.email) merged.email = user.email ?? null;
        return commit(merged);
      });
    })();
    return () => { cancelled = true; };
  }, [user, supabase, commit]);

  // Debounced push of the whole session to the cloud while logged in.
  useEffect(() => {
    if (!user || !supabase) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      supabase.from("user_state").upsert({ user_id: user.id, data: s }).then(({ error }) => {
        if (error) console.warn("[sync] save failed:", error.message);
      });
    }, 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [s, user, supabase]);

  const setName = useCallback((name: string) => patch((p) => ({ ...p, name: name.trim() || null })), [patch]);
  const setEmail = useCallback((email: string) => patch((p) => ({ ...p, email: email.trim() || null })), [patch]);
  const setState = useCallback((state: string) => patch((p) => ({ ...p, state: state || null })), [patch]);
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

  const toggleMilestone = useCallback(
    (id: string) =>
      patch((p) => {
        const has = p.claimedMilestones.includes(id);
        return { ...p, claimedMilestones: has ? p.claimedMilestones.filter((m) => m !== id) : [...p.claimedMilestones, id] };
      }),
    [patch]
  );

  const markLessonSeen = useCallback(
    (id: string) =>
      patch((p) => ({
        ...p,
        seenLessons: p.seenLessons.includes(id) ? p.seenLessons.filter((l) => l !== id) : [...p.seenLessons, id],
      })),
    [patch]
  );

  const setMomentPhoto = useCallback(
    (id: string, dataUrl: string | null) =>
      patch((p) => {
        const photos = { ...p.momentPhotos };
        if (dataUrl) photos[id] = dataUrl;
        else delete photos[id];
        return { ...p, momentPhotos: photos };
      }),
    [patch]
  );

  const setNotifications = useCallback((v: boolean) => patch((p) => ({ ...p, notifications: v })), [patch]);
  const setUnits = useCallback((v: "metric" | "imperial") => patch((p) => ({ ...p, units: v })), [patch]);
  const setAvatar = useCallback((dataUrl: string | null) => patch((p) => ({ ...p, avatar: dataUrl })), [patch]);

  const finishOnboarding = useCallback(() => patch((p) => ({ ...p, onboarded: true, startedAt: p.startedAt ?? todayISO() })), [patch]);
  const reset = useCallback(() => patch(() => ({ ...EMPTY, momentPhotos: {} })), [patch]);

  // Effective session: a real Stripe subscription forces premium on. The raw
  // `s` (synced to the cloud) is left untouched to avoid drift with the webhook.
  const es = useMemo(() => (subActive && !s.premium ? { ...s, premium: true } : s), [s, subActive]);

  const value = useMemo<StoreValue>(
    () => ({ s: es, setName, setEmail, setState, setPremium, addVehicle, updateVehicle, removeVehicle, setActiveVehicle, addService, updateService, removeService, toggleMilestone, markLessonSeen, setMomentPhoto, setNotifications, setUnits, setAvatar, subscribed: subActive, subscriptionEndsAt: sub.endsAt, subscriptionCanceling: sub.canceling, refreshSubscription, finishOnboarding, reset }),
    [es, setName, setEmail, setState, setPremium, addVehicle, updateVehicle, removeVehicle, setActiveVehicle, addService, updateService, removeService, toggleMilestone, markLessonSeen, setMomentPhoto, setNotifications, setUnits, setAvatar, subActive, sub.endsAt, sub.canceling, refreshSubscription, finishOnboarding, reset]
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
