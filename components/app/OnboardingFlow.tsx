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
  const [carLeaving, setCarLeaving] = useState(false);
  const last = i === cards.length - 1;
  const card = cards[i];

  const advance = () => (last ? finishOnboarding() : setI((v) => v + 1));

  const onContinue = () => {
    if (carLeaving) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // First card: the car revs, accelerates and drives off before advancing.
    if (i === 0 && !reduce) {
      setCarLeaving(true);
      setTimeout(() => {
        setI(1);
        setCarLeaving(false);
      }, 680);
    } else {
      advance();
    }
  };

  return (
    <PhoneFrame>
      <div className="flex items-center justify-between px-5 pb-2 pt-5">
        <ProgressDots total={cards.length} index={i} />
        <LangSwitcher />
      </div>

      <div className="flex flex-1 flex-col px-6 pb-8">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          {/* Ilustração por card: 0 carro, 1 Biela idle, 2 cena da garagem.
              Brilho âmbar atrás dissolve o contorno. */}
          <div className="relative mb-8 flex min-h-[19rem] items-center justify-center">
            <span
              aria-hidden
              className={`pointer-events-none absolute left-1/2 top-1/2 h-64 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-opacity duration-500 ${
                carLeaving ? "opacity-0" : "opacity-100"
              }`}
              style={{ background: "radial-gradient(closest-side, rgba(242,166,35,0.32), transparent)" }}
            />
            {i === 0 ? (
              // overflow-hidden "track" so the car clips at the card edge as it leaves
              <div className="relative flex w-full justify-center overflow-hidden">
                <div className={carLeaving ? "car-exit" : ""}>
                  <CarroMentorque size={300} driving speed={carLeaving ? 0.25 : 0.9} />
                </div>
              </div>
            ) : i === 1 ? (
              <div className="relative">
                <BielaMascote size={188} />
              </div>
            ) : (
              <div className="relative">
                <img
                  src="/onboarding/cena-garagem.png"
                  alt="Biela na garagem com o conversível Mentorque"
                  className="w-[300px] max-w-full select-none"
                  draggable={false}
                />
              </div>
            )}
          </div>
          <div className={`transition-opacity duration-300 ${carLeaving ? "opacity-0" : "opacity-100"}`}>
            <h1 className="text-balance font-display text-[26px] font-bold leading-tight text-cream">{card.title}</h1>
            <p className="mx-auto mt-3 max-w-xs text-pretty text-sm text-cream/70">{card.body}</p>
          </div>
        </div>

        <div className="space-y-2.5">
          <Button size="lg" className="w-full" onClick={onContinue} disabled={carLeaving}>
            {last ? c.splash.start : c.splash.next}
          </Button>
        </div>
      </div>

      <style jsx>{`
        .car-exit {
          animation: car-drive-off 0.68s cubic-bezier(0.5, 0, 0.9, 0.25) forwards;
        }
        @keyframes car-drive-off {
          0% { transform: translateX(0); }
          16% { transform: translateX(-16px); }
          100% { transform: translateX(190%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .car-exit { animation: none; }
        }
      `}</style>
    </PhoneFrame>
  );
}
