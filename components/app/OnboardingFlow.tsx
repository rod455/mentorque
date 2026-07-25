"use client";

import { useState } from "react";
import { usePrototype } from "@/lib/app/store";
import { Button } from "@/components/ui/Button";
import { LangSwitcher } from "@/components/ui/LangSwitcher";
import { PhoneFrame, ProgressDots, useContent } from "./ui";
import BielaMascote from "@/components/BielaMascote";
import CarroMentorque from "@/components/CarroMentorque";

// 0.1 — Splash / apresentação (3 cards) → finishes into 1.1 Meus Carros.
export function OnboardingFlow() {
  const c = useContent();
  const cards = c.splash.cards;
  const { finishOnboarding } = usePrototype();
  const [i, setI] = useState(0);
  const last = i === cards.length - 1;
  const card = cards[i];

  return (
    <PhoneFrame>
      <div className="flex items-center justify-between px-5 pb-2 pt-5">
        <ProgressDots total={cards.length} index={i} />
        <LangSwitcher />
      </div>

      <div className="flex flex-1 flex-col px-6 pb-8">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          {/* Ilustração por card: 0 carro estático, 1 Biela idle, 2 cena da garagem.
              Brilho âmbar atrás (como no design de referência) dissolve o contorno. */}
          <div className="relative mb-8 flex min-h-[19rem] items-center justify-center">
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
              style={{ background: "radial-gradient(closest-side, rgba(242,166,35,0.32), transparent)" }}
            />
            <div className="relative">
              {i === 0 ? (
                <CarroMentorque size={300} driving />
              ) : i === 1 ? (
                <BielaMascote size={188} />
              ) : (
                <img
                  src="/onboarding/cena-garagem.png"
                  alt="Biela na garagem com o conversível Mentorque"
                  className="w-[300px] max-w-full select-none"
                  draggable={false}
                />
              )}
            </div>
          </div>
          <h1 className="text-balance font-display text-[26px] font-bold leading-tight text-cream">{card.title}</h1>
          <p className="mx-auto mt-3 max-w-xs text-pretty text-sm text-cream/70">{card.body}</p>
        </div>

        <div className="space-y-2.5">
          <Button size="lg" className="w-full" onClick={() => (last ? finishOnboarding() : setI((v) => v + 1))}>
            {last ? c.splash.start : c.splash.next}
          </Button>
        </div>
      </div>
    </PhoneFrame>
  );
}
