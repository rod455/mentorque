"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ServiceRecord, SystemKey } from "./types";

// Lightweight in-app router: a stack of views with push/back plus a "root"
// reset used by the bottom navigation. Params travel with the view.
export type View =
  | { name: "cars" }
  | { name: "addCar"; editId?: string }
  | { name: "car" }
  | { name: "symptoms" }
  | { name: "symptom"; id: string }
  | { name: "checklist"; symptomId: string }
  | { name: "health" }
  | { name: "system"; system: SystemKey }
  | { name: "history" }
  | { name: "addService"; preset?: Partial<ServiceRecord>; editId?: string }
  | { name: "service"; id: string }
  | { name: "revisions" }
  | { name: "learn" }
  | { name: "content"; id: string }
  | { name: "carSettings" }
  | { name: "profile" }
  | { name: "subscribe" };

type NavValue = {
  view: View;
  canBack: boolean;
  go: (v: View) => void; // push
  back: () => void;
  root: (v: View) => void; // reset stack (bottom nav)
};

const Ctx = createContext<NavValue | null>(null);

export function NavProvider({ initial, children }: { initial: View; children: React.ReactNode }) {
  const [stack, setStack] = useState<View[]>([initial]);

  const go = useCallback((v: View) => setStack((s) => [...s, v]), []);
  const back = useCallback(() => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)), []);
  const root = useCallback((v: View) => setStack([v]), []);

  const value = useMemo<NavValue>(
    () => ({ view: stack[stack.length - 1], canBack: stack.length > 1, go, back, root }),
    [stack, go, back, root]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNav() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useNav must be used within NavProvider");
  return ctx;
}
