"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { usePrototype } from "@/lib/app/store";
import { trialDaysFor, trialPlatform } from "@/lib/app/platform";
import { isNativeApp } from "@/lib/app/wrapper";
import { Button } from "@/components/ui/Button";
import { LangSwitcher } from "@/components/ui/LangSwitcher";
import { Icon, PhoneFrame, ProgressDots, useContent } from "./ui";
import BielaMascote from "@/components/BielaMascote";
import CarroMentorque from "@/components/CarroMentorque";

function CheckDot() {
  return (
    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-teal text-graphite">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3 w-3"><path d="M20 6 9 17l-5-5" /></svg>
    </span>
  );
}

// 0.1 — Onboarding (5 páginas): 3 cards de apresentação + prova social +
// monte seu teste. Termina no app (Home) ou no paywall, conforme a escolha.
export function OnboardingFlow() {
  const c = useContent();
  const cards = c.splash.cards;
  const social = c.splash.social;
  const trial = c.splash.trial;
  const { finishOnboarding } = usePrototype();
  const [i, setI] = useState(0);
  const [carLeaving, setCarLeaving] = useState(false);
  const [plan, setPlan] = useState<"annual" | "monthly">("annual");
  const [remind, setRemind] = useState(false);
  // App da loja (modo leitor): sem a página "Monte seu teste" (compra).
  const [native, setNative] = useState(false);
  useEffect(() => setNative(isNativeApp()), []);
  const total = cards.length + (native ? 1 : 2); // 3 cards + social (+ trial na web)
  const last = i === total - 1;
  const card = i < cards.length ? cards[i] : null;

  const [trialDays, setTrialDays] = useState(7);
  useEffect(() => setTrialDays(trialDaysFor(trialPlatform())), []);

  // Última página: Continuar leva ao paywall/checkout do plano escolhido.
  const finishToPlan = () => {
    try { window.sessionStorage.setItem("mentorque-onboarding-plan", plan); } catch { /* ignore */ }
    finishOnboarding();
  };

  // Na web, a última página (trial) leva ao paywall; no app da loja a última é
  // a prova social e encerra direto.
  const advance = () => (last ? (native ? finishOnboarding() : finishToPlan()) : setI((v) => v + 1));

  // Swipe left→right anywhere on the screen = go back a card (no button).
  const down = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: ReactPointerEvent) => {
    down.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: ReactPointerEvent) => {
    const start = down.current;
    down.current = null;
    if (!start || carLeaving) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const horizontal = Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5;
    if (!horizontal) return;
    if (dx > 0) {
      // left→right = back
      if (i > 0) setI((v) => v - 1);
    } else {
      // right→left = forward (same behavior as the Continue button)
      onContinue();
    }
  };

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
      }, 1350);
    } else {
      advance();
    }
  };

  return (
    <PhoneFrame>
      <div
        className="flex flex-1 flex-col"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
      <div className="flex items-center justify-between px-5 pb-2 pt-5">
        <ProgressDots total={total} index={i} />
        {last ? (
          <button onClick={finishOnboarding} className="text-xs text-cream/50 hover:text-cream">{trial.notNow}</button>
        ) : (
          <LangSwitcher />
        )}
      </div>

      {card ? (
        /* Páginas 1–3 — cards de apresentação */
        <div className="flex flex-1 flex-col px-6 pb-8">
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            {/* Ilustração por card: 0 carro, 1 Biela idle, 2 cena da garagem. */}
            <div className="relative mb-8 flex min-h-[19rem] items-center justify-center">
              {i === 0 ? (
                <div className={carLeaving ? "car-exit" : ""}>
                  <CarroMentorque size={300} driving speed={carLeaving ? 0.2 : 0.9} boost={carLeaving} />
                </div>
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
            <div className={`transition-opacity duration-300 ${carLeaving ? "opacity-0" : "opacity-100"}`}>
              <h1 className="text-balance font-display text-[26px] font-bold leading-tight text-cream">{card.title}</h1>
              <p className="mx-auto mt-3 max-w-xs text-pretty text-sm text-cream/70">{card.body}</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <Button size="lg" className="w-full" onClick={onContinue} disabled={carLeaving}>
              {c.splash.next}
            </Button>
          </div>
        </div>
      ) : i === cards.length ? (
        /* Página 4 — prova social */
        <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <h1 className="mt-2 font-serif text-3xl font-bold leading-tight text-cream">{social.title}</h1>
          <p className="mt-1.5 text-sm text-cream/50">{social.sub}</p>

          <div className="mt-6 text-center">
            <p className="font-serif text-4xl font-bold text-cream">{social.rating}</p>
            <p className="mt-0.5 text-lg tracking-wide text-amber">★★★★★</p>
            <p className="mt-0.5 text-xs text-cream/50">{social.ratingNote}</p>
          </div>

          <div className="mt-5 grid grid-cols-2 divide-x divide-white/10">
            <div className="pr-4 text-center">
              <p className="font-serif text-2xl font-bold text-cream">{social.stat1}</p>
              <p className="mt-0.5 text-xs text-cream/50">{social.stat1Label}</p>
            </div>
            <div className="pl-4 text-center">
              <p className="font-serif text-2xl font-bold text-cream">{social.stat2}</p>
              <p className="mt-0.5 text-xs text-cream/50">{social.stat2Label}</p>
            </div>
          </div>

          {/* Depoimentos levemente inclinados, como na referência */}
          <div className="mt-6 flex-1 space-y-3">
            {social.quotes.map((q, idx) => (
              <div
                key={q.name}
                className={`rounded-2xl bg-graphite-800 p-3.5 ring-1 ring-white/[0.06] ${idx % 2 === 0 ? "-rotate-1 mr-6" : "rotate-1 ml-6"}`}
              >
                <p className="text-sm tracking-wide text-amber">★★★★★</p>
                <p className="mt-1 text-sm leading-snug text-cream/85">{q.quote}</p>
                <p className="mt-1.5 text-xs font-medium text-cream/55">{q.name} <span className="text-teal">✔</span></p>
              </div>
            ))}
          </div>

          <Button size="lg" className="mt-5 w-full" onClick={onContinue}>
            {c.splash.next}
          </Button>
        </div>
      ) : (
        /* Página 5 — monte seu teste */
        <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Biela cercada de recursos */}
          <div className="relative mx-auto mt-1 flex h-44 w-full max-w-xs items-end justify-center">
            <BielaMascote size={118} />
            {[
              { icon: "diagnose", cls: "left-0 top-4" },
              { icon: "calendar", cls: "left-6 bottom-2" },
              { icon: "spark", cls: "right-0 top-4" },
              { icon: "book", cls: "right-6 bottom-2" },
            ].map((b) => (
              <span key={b.icon} className={`absolute ${b.cls} grid h-10 w-10 place-items-center rounded-full bg-graphite-800 text-amber ring-1 ring-white/10`}>
                <Icon name={b.icon} className="h-5 w-5" />
              </span>
            ))}
          </div>

          <h1 className="mt-3 text-center font-serif text-3xl font-bold text-cream">{trial.title}</h1>

          <div className="mt-4 space-y-2.5 rounded-2xl bg-graphite-800 p-4 ring-1 ring-white/[0.06]">
            {trial.bullets.map((b) => (
              <div key={b} className="flex items-center gap-2.5 text-sm text-cream/85">
                <CheckDot /> {b.replace("{n}", String(trialDays))}
              </div>
            ))}
          </div>

          {/* Escolha do plano */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => setPlan("annual")}
              className={`rounded-2xl p-4 text-left ring-2 transition-colors ${plan === "annual" ? "bg-amber text-graphite ring-amber" : "bg-graphite-800 text-cream ring-white/10"}`}
            >
              <span className="flex items-center justify-between">
                <span className="font-display text-base font-bold">{trial.freeLabel}</span>
                <span className={`grid h-5 w-5 place-items-center rounded-full ${plan === "annual" ? "bg-graphite text-amber" : "ring-1 ring-white/25"}`}>
                  {plan === "annual" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3 w-3"><path d="M20 6 9 17l-5-5" /></svg>}
                </span>
              </span>
              <span className={`mt-0.5 block text-sm ${plan === "annual" ? "text-graphite/70" : "text-cream/55"}`}>{trial.freeDays.replace("{n}", String(trialDays))}</span>
            </button>
            <button
              onClick={() => setPlan("monthly")}
              className={`rounded-2xl p-4 text-left ring-2 transition-colors ${plan === "monthly" ? "bg-amber text-graphite ring-amber" : "bg-graphite-800 text-cream ring-white/10"}`}
            >
              <span className="flex items-center justify-between">
                <span className="font-display text-base font-bold">{trial.monthlyLabel}</span>
                <span className={`grid h-5 w-5 place-items-center rounded-full ${plan === "monthly" ? "bg-graphite text-amber" : "ring-1 ring-white/25"}`}>
                  {plan === "monthly" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3 w-3"><path d="M20 6 9 17l-5-5" /></svg>}
                </span>
              </span>
              <span className={`mt-0.5 block text-sm ${plan === "monthly" ? "text-graphite/70" : "text-cream/55"}`}>{trial.monthlyPrice}</span>
            </button>
          </div>

          {/* Preço em evidência (formato Bloom) */}
          <p className="mt-3 text-center text-sm text-cream/60">
            {plan === "annual" ? (
              <>
                {trial.finePrefix.replace("{n}", String(trialDays))}{" "}
                <strong className="font-display text-base font-bold text-cream">{trial.finePrice}</strong>
                {trial.fineSuffix}
              </>
            ) : (
              <>
                <strong className="font-display text-base font-bold text-cream">{trial.fineMonthlyPrice}</strong>
                {trial.fineMonthlySuffix}
              </>
            )}
          </p>

          <div className="mt-auto pt-4">
            <Button size="lg" className="w-full" onClick={onContinue}>{trial.cta}</Button>

            {/* Lembrete antes do teste acabar */}
            <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-graphite-800 px-3.5 py-2.5 ring-1 ring-white/[0.06]">
              <span className="flex-1 text-xs text-cream/70">{c.subscribe.reminder}</span>
              <button
                type="button"
                role="switch"
                aria-checked={remind}
                onClick={() => setRemind((v) => !v)}
                className={`inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${remind ? "bg-amber" : "bg-graphite-600"}`}
              >
                <span className={`h-4 w-4 rounded-full bg-cream shadow transition-transform ${remind ? "translate-x-4" : "translate-x-0"}`} />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-cream/45">
              <a href="/privacidade" className="hover:text-cream">{c.subscribe.termsLink}</a>
              <span>·</span>
              <a href="/privacidade" className="hover:text-cream">{c.subscribe.privacyLink}</a>
            </div>
          </div>
        </div>
      )}
      </div>

      <style jsx>{`
        .car-exit {
          animation: car-drive-off 1.35s cubic-bezier(0.5, 0, 0.72, 0.3) forwards;
        }
        @keyframes car-drive-off {
          0% { transform: translateX(0); opacity: 1; }
          14% { transform: translateX(20px); }
          40% { opacity: 1; }
          82% { opacity: 0; }
          100% { transform: translateX(-135vw); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .car-exit { animation: none; }
        }
      `}</style>
    </PhoneFrame>
  );
}
