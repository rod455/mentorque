"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ServiceRecord, SystemKey } from "./types";

// Lightweight in-app router: a stack of views with push/back plus a "root"
// reset used by the bottom navigation. Params travel with the view.
export type View =
  | { name: "home" }
  | { name: "search" }
  | { name: "cars" }
  | { name: "addCar"; editId?: string }
  | { name: "car" }
  | { name: "symptoms" }
  | { name: "symptom"; id: string }
  | { name: "systemProblems"; system: SystemKey }
  | { name: "checklist"; symptomId: string }
  | { name: "obd2" }
  | { name: "health" }
  | { name: "healthQuiz" }
  | { name: "system"; system: SystemKey }
  | { name: "history" }
  | { name: "addService"; preset?: Partial<ServiceRecord>; editId?: string }
  | { name: "service"; id: string }
  | { name: "revisions" }
  | { name: "learn" }
  | { name: "equipment" }
  | { name: "equipmentHowTo"; itemId: string }
  | { name: "forYourCar" }
  | { name: "savedLessons" }
  | { name: "studyTrack"; trackId: string }
  | { name: "course"; id: string }
  | { name: "biela"; seed?: string }
  | { name: "content"; id: string }
  | { name: "carSettings" }
  | { name: "profile" }
  | { name: "gamification" }
  | { name: "quiz" }
  // `tab` abre o acervo já na aba certa — quem vem de "Adicionar memórias"
  // quer Momentos, não Marcos.
  | { name: "achievements"; tab?: "marco" | "momento" }
  | { name: "auth" }
  | { name: "subscribe"; ctx?: string }
  | { name: "checkout"; plan: "monthly" | "annual"; offer?: string };

type NavValue = {
  view: View;
  canBack: boolean;
  depth: number; // tamanho da pilha (para restaurar o scroll ao voltar)
  lastAction: "go" | "back" | "root"; // última navegação (controle de scroll)
  go: (v: View) => void; // push
  back: () => void;
  root: (v: View) => void; // reset stack (bottom nav)
};

const Ctx = createContext<NavValue | null>(null);

export function NavProvider({ initial, children }: { initial: View; children: React.ReactNode }) {
  const [stack, setStack] = useState<View[]>([initial]);
  const [lastAction, setLastAction] = useState<"go" | "back" | "root">("root");

  const go = useCallback((v: View) => { setLastAction("go"); setStack((s) => [...s, v]); }, []);
  const back = useCallback(() => { setLastAction("back"); setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)); }, []);
  const root = useCallback((v: View) => { setLastAction("root"); setStack([v]); }, []);

  const value = useMemo<NavValue>(
    () => ({ view: stack[stack.length - 1], canBack: stack.length > 1, depth: stack.length, lastAction, go, back, root }),
    [stack, lastAction, go, back, root]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNav() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useNav must be used within NavProvider");
  return ctx;
}
