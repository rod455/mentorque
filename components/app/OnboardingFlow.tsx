"use client";

import { useState } from "react";
import { usePrototype } from "@/lib/app/store";
import { Button } from "@/components/ui/Button";
import { LangSwitcher } from "@/components/ui/LangSwitcher";
import { Icon, PhoneFrame, ProgressDots, useContent } from "./ui";

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
          <div className="mb-8 grid h-24 w-24 place-items-center rounded-[2rem] bg-amber/15 text-amber shadow-glow">
            <Icon name={card.icon} className="h-12 w-12" />
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
