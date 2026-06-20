"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { LangSwitcher } from "@/components/ui/LangSwitcher";
import { dominantTag, usePrototype } from "@/lib/app/store";
import type { VehicleType } from "@/lib/app/types";
import { Card, Chip, Icon, PhoneFrame, ProgressDots, SeverityDot } from "./ui";
import { useContent } from "./ui";
import { IconArrow } from "@/lib/icons";

export function OnboardingFlow() {
  const { locale } = useI18n();
  const c = useContent();
  const o = c.onboarding;
  const { s, toggleIntention, setPrincipal, setVehicle, setNoVehicle, finishOnboarding } = usePrototype();
  const T = (pt: string, en: string) => (locale === "pt" ? pt : en);

  // Build the active step list from the spec's branching rules.
  const steps = useMemo(() => {
    const arr: string[] = ["welcome", "intentions"];
    if (s.intentions.length >= 3) arr.push("principal");
    arr.push("vehicle");
    if (!s.intentions.includes("urgent")) arr.push("value");
    arr.push("aha", "account", "offer");
    return arr;
  }, [s.intentions]);

  const [i, setI] = useState(0);
  const step = steps[Math.min(i, steps.length - 1)];
  const next = () => setI((v) => Math.min(v + 1, steps.length - 1));
  const back = () => setI((v) => Math.max(v - 1, 0));

  // Vehicle picker local state.
  const [vType, setVType] = useState<VehicleType>("car");
  const [make, setMake] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(null);

  const learnTrack = s.noVehicle || ["learn", "career"].includes(dominantTag(s));

  const quickStart = () => {
    toggleIntention("care");
    toggleIntention("save");
    setPrincipal("care");
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
        <ProgressDots total={steps.length} index={i} />
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

        {step === "intentions" && (
          <div className="flex flex-1 flex-col">
            <h1 className="font-display text-2xl font-bold text-cream">{o.intentTitle}</h1>
            <p className="mb-5 mt-1 text-sm text-cream/60">{o.intentHint}</p>
            <div className="flex-1 space-y-2.5">
              {c.intentions.map((it) => {
                const active = s.intentions.includes(it.tag);
                return (
                  <button
                    key={it.tag}
                    onClick={() => toggleIntention(it.tag)}
                    className={[
                      "flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left ring-1 transition-all",
                      active ? "bg-amber/12 ring-amber" : "bg-graphite-800 ring-white/5 hover:ring-white/15",
                    ].join(" ")}
                  >
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${active ? "bg-amber text-graphite" : "bg-graphite-700 text-cream/70"}`}>
                      <Icon name={it.icon} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[15px] text-cream">{it.label}</span>
                      <span className="block text-xs text-cream/50">{it.blurb}</span>
                    </span>
                    <span className={`grid h-6 w-6 place-items-center rounded-full ring-1 ${active ? "bg-amber text-graphite ring-amber" : "ring-white/20"}`}>
                      {active ? "✓" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
            <Button size="lg" className="mt-5 w-full" onClick={next} disabled={s.intentions.length === 0}>
              {o.start}
            </Button>
          </div>
        )}

        {step === "principal" && (
          <div className="flex flex-1 flex-col">
            <h1 className="font-display text-2xl font-bold text-cream">{o.principalTitle}</h1>
            <p className="mb-5 mt-1 text-sm text-cream/60">{o.principalHint}</p>
            <div className="flex-1 space-y-2.5">
              {c.intentions
                .filter((it) => s.intentions.includes(it.tag))
                .map((it) => {
                  const active = s.principal === it.tag;
                  return (
                    <button
                      key={it.tag}
                      onClick={() => setPrincipal(it.tag)}
                      className={[
                        "flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left ring-1 transition-all",
                        active ? "bg-amber/12 ring-amber" : "bg-graphite-800 ring-white/5 hover:ring-white/15",
                      ].join(" ")}
                    >
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${active ? "bg-amber text-graphite" : "bg-graphite-700 text-cream/70"}`}>
                        <Icon name={it.icon} className="h-5 w-5" />
                      </span>
                      <span className="font-display text-[15px] text-cream">{it.label}</span>
                    </button>
                  );
                })}
            </div>
            <Button size="lg" className="mt-5 w-full" onClick={next} disabled={!s.principal}>
              {o.start}
            </Button>
          </div>
        )}

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
            </div>

            <div className="mt-4 space-y-2.5">
              <Button
                size="lg"
                className="w-full"
                disabled={!(make && model && year)}
                onClick={() => {
                  if (make && model && year) {
                    setVehicle({ type: vType, make, model, year });
                    next();
                  }
                }}
              >
                {o.start}
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

        {step === "value" && (
          <div className="flex flex-1 flex-col">
            <div className="flex-1 space-y-3">
              {(learnTrack
                ? [
                    { icon: "track", t: T("Trilha do zero ao avançado", "Zero-to-advanced track"), b: T("Cursos guiados na voz do creator.", "Guided courses in the creator's voice.") },
                    { icon: "check", t: T("Certificado ao concluir", "Certificate on completion"), b: T("Comprove o que aprendeu.", "Prove what you learned.") },
                    { icon: "consult", t: T("Ajuda humana quando travar", "Human help when stuck"), b: T("A equipe e o creator ao seu lado.", "The team and creator by your side.") },
                  ]
                : [
                    { icon: "diagnose", t: T("Diagnóstico por sintoma", "Symptom diagnosis"), b: T("Feito pro seu modelo.", "Tailored to your model.") },
                    { icon: "tools", t: T("Preço justo antes da oficina", "Fair price before the shop"), b: T("Chegue sabendo quanto custa.", "Show up knowing the cost.") },
                    { icon: "consult", t: T("Ajuda humana quando travar", "Human help when stuck"), b: T("Segunda opinião da equipe.", "A second opinion from the team.") },
                  ]
              ).map((v) => (
                <Card key={v.t} className="flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber/15 text-amber">
                    <Icon name={v.icon} className="h-6 w-6" />
                  </span>
                  <span>
                    <span className="block font-display text-[15px] text-cream">{v.t}</span>
                    <span className="block text-xs text-cream/55">{v.b}</span>
                  </span>
                </Card>
              ))}
            </div>
            <Button size="lg" className="mt-5 w-full" onClick={next}>
              {o.ahaContinue}
            </Button>
          </div>
        )}

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

        {step === "account" && (
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col justify-center">
              <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-teal/15 text-teal">
                <Icon name="car" className="h-8 w-8" />
              </div>
              <h1 className="text-center font-display text-2xl font-bold text-cream">{o.accountTitle}</h1>
              <p className="mx-auto mt-2 max-w-xs text-center text-sm text-cream/60">{o.accountBody}</p>
              <input
                type="email"
                placeholder={o.emailPh}
                className="mt-6 w-full rounded-xl bg-graphite-800 px-4 py-3.5 text-cream ring-1 ring-white/10 outline-none placeholder:text-cream/40 focus:ring-amber"
              />
            </div>
            <div className="space-y-2.5">
              <Button size="lg" className="w-full" onClick={next}>
                {o.accountCta}
              </Button>
              <button onClick={next} className="w-full py-2 text-center text-sm text-cream/55 hover:text-cream">
                {o.accountSkip}
              </button>
            </div>
          </div>
        )}

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
                  <Icon name="alert" className="hidden" />
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
