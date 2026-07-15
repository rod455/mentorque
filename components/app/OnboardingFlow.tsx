"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { LangSwitcher } from "@/components/ui/LangSwitcher";
import { isLearnFirst, usePrototype } from "@/lib/app/store";
import type { VehicleType } from "@/lib/app/types";
import { Card, Chip, Icon, PhoneFrame, ProgressDots, SeverityDot } from "./ui";
import { useContent } from "./ui";
import { IconArrow } from "@/lib/icons";

// Fixed, linear flow: Q1 vehicle → Q2 intentions → Q3 level → social proof →
// personalized aha → account → plan. Branching only changes copy, not steps.
const STEPS = ["welcome", "vehicle", "intentions", "level", "proof", "aha", "account", "offer"] as const;

export function OnboardingFlow() {
  const { locale } = useI18n();
  const c = useContent();
  const o = c.onboarding;
  const { s, setName, toggleIntention, setLevel, setVehicle, setNoVehicle, finishOnboarding } = usePrototype();
  const T = (pt: string, en: string) => (locale === "pt" ? pt : en);

  const [i, setI] = useState(0);
  const step = STEPS[i];
  const next = () => setI((v) => Math.min(v + 1, STEPS.length - 1));
  const back = () => setI((v) => Math.max(v - 1, 0));

  // Vehicle picker local state.
  const [vType, setVType] = useState<VehicleType>("car");
  const [make, setMake] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [engine, setEngine] = useState("");

  // Account local state.
  const [nameInput, setNameInput] = useState(s.name ?? "");

  const learnTrack = isLearnFirst(s);

  const quickStart = () => {
    setName("Rodrigo");
    toggleIntention("understand");
    toggleIntention("maintenance");
    setLevel("intermediate");
    setVehicle({ type: "car", make: "Volkswagen", model: "Gol", year: 2018 });
    finishOnboarding();
  };

  return (
    <PhoneFrame>
      {/* Top bar: back + progress + language */}
      <div className="flex items-center justify-between px-5 pb-2 pt-5">
        {i > 0 ? (
          <button onClick={back} className="grid h-9 w-9 place-items-center rounded-full bg-graphite-700 text-cream/70 hover:text-cream" aria-label={c.common.back}>
            <IconArrow className="h-4 w-4 rotate-180" />
          </button>
        ) : (
          <span className="h-9 w-9" />
        )}
        <ProgressDots total={STEPS.length} index={i} />
        <LangSwitcher />
      </div>

      <div className="flex flex-1 flex-col px-5 pb-8">
        {step === "welcome" && (
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col justify-center text-center">
              <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-amber/15 text-amber shadow-glow">
                <Icon name="diagnose" className="h-10 w-10" />
              </div>
              <p className="mb-2 font-display text-xs uppercase tracking-[0.2em] text-amber">{o.welcomeEyebrow}</p>
              <h1 className="text-balance font-display text-[28px] font-bold leading-tight text-cream">{o.welcomeTitle}</h1>
              <p className="mx-auto mt-3 max-w-xs text-pretty text-sm text-cream/70">{o.welcomeBody}</p>
              <p className="mx-auto mt-4 max-w-xs text-xs italic text-cream/45">{o.welcomeCreator}</p>
            </div>
            <div className="space-y-2.5">
              <Button size="lg" className="w-full" onClick={next}>
                {o.start}
              </Button>
              <Button variant="ghost" className="w-full" onClick={quickStart}>
                {o.haveAccount}
              </Button>
            </div>
          </div>
        )}

        {/* Q1 — Qual carro você dirige? */}
        {step === "vehicle" && (
          <div className="flex flex-1 flex-col">
            <h1 className="font-display text-2xl font-bold text-cream">{o.vehicleTitle}</h1>
            <p className="mb-4 mt-1 text-sm text-cream/60">{o.vehicleHint}</p>

            <div className="mb-4 grid grid-cols-2 gap-2">
              {(["car", "moto"] as VehicleType[]).map((tp) => (
                <button
                  key={tp}
                  onClick={() => {
                    setVType(tp);
                    setMake(null);
                    setModel(null);
                  }}
                  className={[
                    "flex items-center justify-center gap-2 rounded-xl py-3 font-display ring-1 transition-colors",
                    vType === tp ? "bg-teal/15 text-teal ring-teal" : "bg-graphite-800 text-cream/70 ring-white/10",
                  ].join(" ")}
                >
                  <Icon name={tp === "car" ? "car" : "moto"} className="h-5 w-5" />
                  {tp === "car" ? o.car : o.moto}
                </button>
              ))}
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto">
              <div>
                <p className="mb-1.5 text-xs uppercase tracking-wide text-cream/45">{o.make}</p>
                <div className="flex flex-wrap gap-2">
                  {c.makes[vType].map((mk) => (
                    <Chip key={mk} active={make === mk} onClick={() => { setMake(mk); setModel(null); }}>
                      {mk}
                    </Chip>
                  ))}
                </div>
              </div>

              {make && (
                <div>
                  <p className="mb-1.5 text-xs uppercase tracking-wide text-cream/45">{o.model}</p>
                  <div className="flex flex-wrap gap-2">
                    {(c.modelsByMake[make] ?? []).map((md) => (
                      <Chip key={md} active={model === md} onClick={() => setModel(md)}>
                        {md}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              {model && (
                <div>
                  <p className="mb-1.5 text-xs uppercase tracking-wide text-cream/45">{o.year}</p>
                  <div className="flex flex-wrap gap-2">
                    {c.years.slice(0, 12).map((yr) => (
                      <Chip key={yr} active={year === yr} onClick={() => setYear(yr)}>
                        {yr}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              {year && (
                <div>
                  <p className="mb-1.5 text-xs uppercase tracking-wide text-cream/45">{o.engine}</p>
                  <input
                    value={engine}
                    onChange={(e) => setEngine(e.target.value)}
                    placeholder={o.enginePh}
                    className="w-full rounded-xl bg-graphite-800 px-4 py-3 text-cream ring-1 ring-white/10 outline-none placeholder:text-cream/40 focus:ring-amber"
                  />
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2.5">
              <Button
                size="lg"
                className="w-full"
                disabled={!(make && model && year)}
                onClick={() => {
                  if (make && model && year) {
                    setVehicle({ type: vType, make, model, year, engine: engine.trim() || undefined });
                    next();
                  }
                }}
              >
                {o.next}
              </Button>
              <button
                onClick={() => {
                  setNoVehicle();
                  next();
                }}
                className="w-full py-2 text-center text-sm text-cream/55 underline-offset-4 hover:text-cream hover:underline"
              >
                {o.noVehicle}
              </button>
            </div>
          </div>
        )}

        {/* Q2 — O que você quer fazer? (multiple choice, up to 3) */}
        {step === "intentions" && (
          <div className="flex flex-1 flex-col">
            <h1 className="font-display text-2xl font-bold text-cream">{o.intentTitle}</h1>
            <div className="mb-4 mt-1 flex items-center justify-between">
              <p className="text-sm text-cream/60">{o.intentHint}</p>
              <span className="text-xs font-medium text-amber">{o.intentCount.replace("{n}", String(s.intentions.length))}</span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto">
              {c.intentions.map((it) => {
                const active = s.intentions.includes(it.tag);
                const full = s.intentions.length >= 3 && !active;
                return (
                  <button
                    key={it.tag}
                    onClick={() => toggleIntention(it.tag)}
                    disabled={full}
                    className={[
                      "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left ring-1 transition-all",
                      active ? "bg-amber/12 ring-amber" : "bg-graphite-800 ring-white/5 hover:ring-white/15",
                      full ? "opacity-40" : "",
                    ].join(" ")}
                  >
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${active ? "bg-amber text-graphite" : "bg-graphite-700 text-cream/70"}`}>
                      <Icon name={it.icon} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[15px] text-cream">{it.label}</span>
                      <span className="block text-xs text-cream/50">{it.blurb}</span>
                    </span>
                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ring-1 ${active ? "bg-amber text-graphite ring-amber" : "ring-white/20"}`}>
                      {active ? "✓" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
            <Button size="lg" className="mt-4 w-full" onClick={next} disabled={s.intentions.length === 0}>
              {o.next}
            </Button>
          </div>
        )}

        {/* Q3 — Qual seu nível? (single choice) */}
        {step === "level" && (
          <div className="flex flex-1 flex-col">
            <h1 className="font-display text-2xl font-bold text-cream">{o.levelTitle}</h1>
            <p className="mb-5 mt-1 text-sm text-cream/60">{o.levelHint}</p>
            <div className="flex-1 space-y-2">
              {c.levels.map((lv) => {
                const active = s.level === lv.key;
                return (
                  <button
                    key={lv.key}
                    onClick={() => setLevel(lv.key)}
                    className={[
                      "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left ring-1 transition-all",
                      active ? "bg-amber/12 ring-amber" : "bg-graphite-800 ring-white/5 hover:ring-white/15",
                    ].join(" ")}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[15px] text-cream">{lv.label}</span>
                      <span className="block text-xs text-cream/50">{lv.blurb}</span>
                    </span>
                    {lv.pro && <span className="shrink-0 rounded-md bg-teal/15 px-2 py-0.5 text-[11px] font-medium text-teal">PRO</span>}
                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ring-1 ${active ? "bg-amber text-graphite ring-amber" : "ring-white/20"}`}>
                      {active ? "✓" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
            <Button size="lg" className="mt-4 w-full" onClick={next} disabled={!s.level}>
              {o.next}
            </Button>
          </div>
        )}

        {/* Social proof + "knowledge from the industry" */}
        {step === "proof" && (
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col justify-center">
              <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-teal/15 text-teal">
                <Icon name="spark" className="h-8 w-8" />
              </div>
              <h1 className="text-center font-display text-2xl font-bold text-cream">{o.proofTitle}</h1>
              <p className="mx-auto mt-2 max-w-xs text-center text-sm text-cream/65">{o.proofBody}</p>

              <Card className="mt-6">
                <p className="text-[15px] leading-relaxed text-cream">{o.proofQuote}</p>
                <p className="mt-2 text-xs text-cream/50">{o.proofAuthor}</p>
              </Card>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-graphite-800 px-3 py-3 text-center ring-1 ring-white/5">
                  <p className="font-display text-sm text-amber">{o.proofStat1}</p>
                </div>
                <div className="rounded-xl bg-graphite-800 px-3 py-3 text-center ring-1 ring-white/5">
                  <p className="font-display text-sm text-teal">{o.proofStat2}</p>
                </div>
              </div>
            </div>
            <Button size="lg" className="mt-5 w-full" onClick={next}>
              {o.ahaContinue}
            </Button>
          </div>
        )}

        {/* Personalized aha — first lesson or what we already see on your car */}
        {step === "aha" && (
          <div className="flex flex-1 flex-col">
            <h1 className="font-display text-2xl font-bold text-cream">{learnTrack ? o.ahaTitleLearn : o.ahaTitleDiag}</h1>
            <p className="mb-4 mt-1 text-sm text-cream/60">{learnTrack ? o.ahaLearnBody : o.ahaDiagBody}</p>
            <div className="flex-1 space-y-2.5">
              {learnTrack ? (
                <Card>
                  <p className="font-display text-base text-cream">{c.tracks[0].title}</p>
                  <p className="mt-1 text-xs text-cream/55">
                    {c.tracks[0].level} · {c.tracks[0].lessons} {c.learn.lessons}
                  </p>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-graphite-700">
                    <div className="h-full w-1/4 rounded-full bg-amber" />
                  </div>
                </Card>
              ) : (
                c.problems.slice(0, 3).map((p) => (
                  <div key={p.title} className="flex items-center gap-3 rounded-xl bg-graphite-800 px-3.5 py-3 ring-1 ring-white/5">
                    <SeverityDot level={p.severity} />
                    <span className="flex-1 font-display text-[15px] text-cream">{p.title}</span>
                    <span className="text-sm text-cream/60">{p.cost}</span>
                  </div>
                ))
              )}
            </div>
            <Button size="lg" className="mt-5 w-full" onClick={next}>
              {o.ahaContinue}
            </Button>
          </div>
        )}

        {/* Account — name (for the greeting) + email */}
        {step === "account" && (
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col justify-center">
              <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-teal/15 text-teal">
                <Icon name="user" className="h-8 w-8" />
              </div>
              <h1 className="text-center font-display text-2xl font-bold text-cream">{o.accountTitle}</h1>
              <p className="mx-auto mt-2 max-w-xs text-center text-sm text-cream/60">{o.accountBody}</p>
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder={o.namePh}
                className="mt-6 w-full rounded-xl bg-graphite-800 px-4 py-3.5 text-cream ring-1 ring-white/10 outline-none placeholder:text-cream/40 focus:ring-amber"
              />
              <input
                type="email"
                placeholder={o.emailPh}
                className="mt-2.5 w-full rounded-xl bg-graphite-800 px-4 py-3.5 text-cream ring-1 ring-white/10 outline-none placeholder:text-cream/40 focus:ring-amber"
              />
            </div>
            <div className="space-y-2.5">
              <Button
                size="lg"
                className="w-full"
                onClick={() => {
                  setName(nameInput);
                  next();
                }}
              >
                {o.accountCta}
              </Button>
              <button onClick={() => { setName(nameInput); next(); }} className="w-full py-2 text-center text-sm text-cream/55 hover:text-cream">
                {o.accountSkip}
              </button>
            </div>
          </div>
        )}

        {/* Plan summary */}
        {step === "offer" && (
          <div className="flex flex-1 flex-col">
            <h1 className="font-display text-2xl font-bold text-cream">{o.offerTitle}</h1>
            <p className="mb-4 mt-1 text-sm text-cream/60">{o.offerBody}</p>
            <div className="flex-1 space-y-2.5">
              <Card className="border-l-2 border-teal/0">
                <div className="flex items-center justify-between">
                  <span className="font-display text-base text-cream">{c.common.free}</span>
                  <span className="text-xs text-teal">{T("incluído agora", "included now")}</span>
                </div>
                <ul className="mt-2 space-y-1.5 text-sm text-cream/70">
                  {[T("O quê está errado + faixa de preço", "What's wrong + price range"), T("1 diagnóstico e checklist", "1 diagnosis & checklist"), T("Trilhas introdutórias e comunidade", "Intro tracks & community")].map((x) => (
                    <li key={x} className="flex gap-2">
                      <span className="text-teal">✓</span>
                      {x}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="ring-amber/30">
                <div className="flex items-center justify-between">
                  <span className="font-display text-base text-amber">Premium</span>
                </div>
                <ul className="mt-2 space-y-1.5 text-sm text-cream/70">
                  {c.paywall.bullets.map((x) => (
                    <li key={x} className="flex gap-2">
                      <span className="text-amber">★</span>
                      {x}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
            <Button size="lg" className="mt-5 w-full" onClick={finishOnboarding}>
              {o.offerEnter}
            </Button>
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
