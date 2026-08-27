"use client";

import { useEffect, useState } from "react";
import { usePrototype } from "@/lib/app/store";
import { useNav, type View } from "@/lib/app/nav";
import { Icon, useContent } from "./ui";
import BielaMascote from "@/components/BielaMascote";

const WELCOME_BACK_KEY = "mentorque-welcome-back";

// Tela de retorno (formato Bloom): quando o app volta do segundo plano e o
// usuário ainda não cadastrou o primeiro carro, convida a cadastrar.
export function WelcomeBack({ currentView }: { currentView: View["name"] }) {
  const c = useContent();
  const w = c.welcomeBack;
  const { s } = usePrototype();
  const { go } = useNav();
  const [show, setShow] = useState(false);
  const hasCar = s.vehicles.length > 0;

  // Uma vez por instalação. Antes disparava a cada retorno do segundo plano —
  // quem só quisesse olhar o app sem cadastrar carro levava uma tela cheia de
  // convite toda vez que voltava, inclusive entre um print e outro.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      try {
        if (window.localStorage.getItem(WELCOME_BACK_KEY)) return;
        window.localStorage.setItem(WELCOME_BACK_KEY, "1");
      } catch {
        /* modo privado: mostra uma vez por sessão */
      }
      setShow(true);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  // Só para quem ainda não tem carro; não interrompe o próprio cadastro.
  if (!show || hasCar || currentView === "addCar" || currentView === "auth") return null;

  return (
    // Responsivo: conteúdo centralizado que cabe numa tela; em aparelhos muito
    // pequenos, rola em vez de cortar. Padding inferior respeita a barra do
    // navegador (safe area).
    <div className="fixed inset-0 z-50 app-col overflow-y-auto bg-graphite [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-h-full flex-col items-center justify-center px-6 pb-[max(env(safe-area-inset-bottom),20px)] pt-[max(env(safe-area-inset-top),16px)] text-center">
        <BielaMascote pose="acenando" size={116} />
        <h1 className="mt-3 max-w-xs font-serif text-xl font-bold leading-snug text-cream">{w.title}</h1>
        <p className="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed text-cream/55">{w.sub}</p>

        <div className="mt-4 w-full max-w-sm space-y-2">
          {w.bullets.map((b) => (
            <div key={b.label} className="flex items-center gap-3 rounded-2xl bg-graphite-800 px-4 py-2.5 text-left ring-1 ring-white/[0.06]">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-amber/15 text-amber">
                <Icon name={b.icon} className="h-4.5 w-4.5" />
              </span>
              <span className="text-sm text-cream/85">{b.label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => { setShow(false); go({ name: "addCar" }); }}
          className="mt-4 w-full max-w-sm rounded-full bg-amber py-3 font-display text-[15px] font-semibold text-graphite active:scale-[0.99]"
        >
          🚗 {w.cta}
        </button>
        <button onClick={() => setShow(false)} className="mt-2.5 rounded-full bg-graphite-800 px-4 py-2 text-xs text-cream/60 ring-1 ring-white/[0.06]">
          → {w.later}
        </button>
      </div>
    </div>
  );
}