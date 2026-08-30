"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ServiceRecord, SystemKey } from "./types";
import { comNovaRaiz, passoDeVolta, type Pilha } from "./navPilha";

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
  | { name: "quizHistorico" }
  // `tab` abre o acervo já na aba certa — quem vem de "Adicionar memórias"
  // quer Momentos, não Marcos.
  | { name: "achievements"; tab?: "marco" | "momento" }
  | { name: "auth" }
  | { name: "subscribe"; ctx?: string }
  | { name: "checkout"; plan: "monthly" | "annual"; offer?: string; cupom?: string };

type NavValue = {
  view: View;
  canBack: boolean;
  depth: number; // tamanho da pilha (para restaurar o scroll ao voltar)
  lastAction: "go" | "back" | "root"; // última navegação (controle de scroll)
  go: (v: View) => void; // push
  back: () => void;
  root: (v: View) => void; // reset stack (bottom nav)
  /**
   * O voltar do Android. Devolve `false` quando não há mais para onde voltar,
   * e só aí o app minimiza.
   *
   * É SEPARADO do `back` de propósito. O `back` some quando a pilha tem um
   * item só, e é ele que decide a seta no cabeçalho: fazer o `back` atravessar
   * abas colocaria uma seta de voltar no topo de toda tela inicial, que não é
   * o que o desenho pede. O botão físico do Android é outra conversa — ali a
   * expectativa da pessoa é desfazer o último passo, qualquer que ele tenha
   * sido, inclusive uma troca de aba.
   */
  voltarNoAndroid: () => boolean;
};

// As regras de pilha moram em ./navPilha.ts, fora do componente, porque o
// botão físico do Android não existe no navegador e é a única parte do app que
// nenhuma suíte consegue apertar. Lá elas são conferidas sem navegador.

const Ctx = createContext<NavValue | null>(null);

export function NavProvider({ initial, children }: { initial: View; children: React.ReactNode }) {
  // `raizes` é o rastro das telas iniciais já visitadas.
  //
  // POR QUE ELE EXISTE: trocar de aba chama `root`, que zera a pilha. Sem
  // rastro, o botão físico do Android encontrava pilha de tamanho 1 em
  // qualquer aba e MINIMIZAVA o app — quem foi de Início para Estudos e
  // apertou voltar era jogado para fora em vez de voltar ao Início. O rastro
  // guarda de onde a pessoa veio, e o app só sai quando não há mais de onde.
  const [p, setP] = useState<Pilha>({ views: [initial], raizes: [] });
  const [lastAction, setLastAction] = useState<"go" | "back" | "root">("root");

  // Espelho do estado para quem precisa DECIDIR antes de mudá-lo. O
  // `voltarNoAndroid` tem de responder na hora se voltou ou não (é a resposta
  // que decide entre navegar e minimizar), e ler isso de dentro de um
  // atualizador de estado devolveria a resposta tarde demais.
  const agora = useRef(p);
  useEffect(() => { agora.current = p; }, [p]);

  const go = useCallback((v: View) => { setLastAction("go"); setP((s) => ({ ...s, views: [...s.views, v] })); }, []);
  const back = useCallback(() => {
    setLastAction("back");
    setP((s) => (s.views.length > 1 ? { ...s, views: s.views.slice(0, -1) } : s));
  }, []);
  const root = useCallback((v: View) => {
    setLastAction("root");
    setP((s) => comNovaRaiz(s, v));
  }, []);

  const voltarNoAndroid = useCallback((): boolean => {
    const proximo = passoDeVolta(agora.current);
    if (!proximo) return false; // primeira tela da sessão: aí sim o app sai de cena
    setLastAction("back");
    setP(proximo);
    return true;
  }, []);

  const value = useMemo<NavValue>(
    () => ({
      view: p.views[p.views.length - 1],
      canBack: p.views.length > 1,
      depth: p.views.length,
      lastAction, go, back, root, voltarNoAndroid,
    }),
    [p, lastAction, go, back, root, voltarNoAndroid]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNav() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useNav must be used within NavProvider");
  return ctx;
}
