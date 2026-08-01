"use client";

import { useState } from "react";
import { usePrototype } from "@/lib/app/store";
import { useNav } from "@/lib/app/nav";
import { computeStatus, MILESTONES, PHASES, type GamSession } from "@/lib/app/gamification";
import { MedalEmblem, PhaseEmblem } from "../Emblem";
import { Button } from "@/components/ui/Button";
import { AppHeader, SectionTitle, useContent } from "../ui";

// Reads the gamification status from the prototype session.
function useGam(): { status: ReturnType<typeof computeStatus>; s: GamSession } {
  const { s } = usePrototype();
  return { status: computeStatus(s), s };
}

// 3.1.C — "Como funciona?": the phase ladder + what earns progress.
export function GamificationScreen() {
  const c = useContent();
  const g = c.gamification;
  const { status } = useGam();
  const { back } = useNav();

  return (
    <div>
      <AppHeader title={g.howTitle} />
      <p className="text-sm leading-snug text-cream/65">{g.howIntro}</p>

      <SectionTitle>{g.phasesTitle}</SectionTitle>
      <div className="space-y-1">
        {PHASES.map((ph, i) => {
          const meta = g.phases[ph.id];
          const current = i === status.phaseIndex;
          return (
            <div key={ph.id} className={`flex items-center gap-3 rounded-xl px-1.5 py-2 ${current ? "bg-amber/[0.07] ring-1 ring-amber/25" : ""}`}>
              <PhaseEmblem id={ph.id} emoji={ph.emoji} size={44} active={current} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-serif text-base font-semibold text-cream">{meta.name}</p>
                  {current && <span className="rounded bg-amber/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber">{g.phaseLabel}</span>}
                </div>
                <p className="mt-0.5 text-[13px] leading-snug text-cream/55">{meta.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <SectionTitle>{g.advanceTitle}</SectionTitle>
      <div className="overflow-hidden rounded-2xl bg-graphite-800 ring-1 ring-white/[0.06] [&>*+*]:border-t [&>*+*]:border-white/[0.06]">
        {g.activities.map((a) => (
          <div key={a.label} className="flex items-center gap-3 px-4 py-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/5 text-sm">{a.emoji}</span>
            <span className="min-w-0 flex-1 text-[13px] text-cream/85">{a.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-teal/[0.08] p-3.5 ring-1 ring-teal/20">
        <p className="font-serif text-[15px] font-semibold text-cream">🌱 {g.noRushTitle}</p>
        <p className="mt-1 text-[13px] leading-snug text-cream/65">{g.noRushBody}</p>
      </div>

      <Button size="lg" className="mt-5 w-full" onClick={back}>{g.gotIt}</Button>
    </div>
  );
}

// 3.1.D — "Seu acervo": milestone grid with Marcos / Momentos tabs.
export function AchievementsScreen() {
  const c = useContent();
  const g = c.gamification;
  const { s } = useGam();
  const { toggleMilestone } = usePrototype();
  const [tab, setTab] = useState<"marco" | "momento">("marco");

  const items = MILESTONES.filter((m) => m.cat === tab);
  const earned = items.filter((m) => m.earned(s)).length;

  return (
    <div>
      <AppHeader title={g.acervoTitle} />
      <p className="text-sm text-cream/65">{g.acervoIntro}</p>

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-graphite-800 p-1 ring-1 ring-white/[0.06]">
        {([["marco", g.tabMarcos], ["momento", g.tabMomentos]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-lg py-2 text-sm font-medium transition-colors ${tab === key ? "bg-amber text-graphite" : "text-cream/60"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="mt-3 text-center text-xs text-cream/45">
        {g.earnedCount.replace("{n}", String(earned)).replace("{total}", String(items.length))}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {items.map((m) => {
          const meta = g.milestones[m.id];
          const got = m.earned(s);
          return (
            <div
              key={m.id}
              className={`flex flex-col items-center rounded-2xl p-4 text-center ring-1 ${
                got ? "bg-graphite-800 ring-amber/25" : "bg-graphite-800/40 ring-white/[0.05]"
              }`}
            >
              <MedalEmblem emoji={m.emoji} size={56} earned={got} />
              <p className={`mt-2.5 font-serif text-sm font-semibold ${got ? "text-cream" : "text-cream/45"}`}>{meta.title}</p>
              <p className={`mt-1 text-xs leading-snug ${got ? "text-cream/60" : "text-cream/35"}`}>{meta.desc}</p>
              {m.manual ? (
                <button
                  onClick={() => toggleMilestone(m.id)}
                  className={`mt-2.5 rounded-full px-3 py-1 text-[11px] font-semibold ring-1 transition-colors ${
                    got ? "bg-amber/15 text-amber ring-amber/30" : "bg-white/5 text-cream/70 ring-white/10 hover:text-cream"
                  }`}
                >
                  {got ? g.lived : g.markDone}
                </button>
              ) : (
                !got && <span className="mt-2 rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-cream/40">{g.soon}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
