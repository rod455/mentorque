"use client";

import { useState } from "react";
import { usePrototype } from "@/lib/app/store";
import { useNav } from "@/lib/app/nav";
import { computeStatus, MILESTONES, PHASES, type GamSession } from "@/lib/app/gamification";
import { AppHeader, Card, SectionTitle, useContent } from "../ui";

// Reads the gamification status from the prototype session.
function useGam(): { status: ReturnType<typeof computeStatus>; s: GamSession } {
  const { s } = usePrototype();
  return { status: computeStatus(s), s };
}

// Small badge circle used across the gamification screens.
function Badge({ emoji, tint, size = "md", locked }: { emoji: string; tint?: string; size?: "sm" | "md" | "lg"; locked?: boolean }) {
  const dim = size === "lg" ? "h-14 w-14 text-2xl" : size === "sm" ? "h-9 w-9 text-base" : "h-11 w-11 text-xl";
  return (
    <span className={`grid shrink-0 place-items-center rounded-full ${dim} ${locked ? "bg-white/5 grayscale opacity-40" : tint ?? "bg-amber/15"}`}>
      {emoji}
    </span>
  );
}

// 3.1.C — "Como funciona?": the phase ladder + what earns progress.
export function GamificationScreen() {
  const c = useContent();
  const g = c.gamification;
  const { status } = useGam();

  return (
    <div>
      <AppHeader title={g.howTitle} />
      <p className="text-sm leading-relaxed text-cream/65">{g.howIntro}</p>

      <SectionTitle>{g.phasesTitle}</SectionTitle>
      <div className="space-y-2.5">
        {PHASES.map((ph, i) => {
          const meta = g.phases[ph.id];
          const current = i === status.phaseIndex;
          const reached = i <= status.phaseIndex;
          return (
            <Card key={ph.id} className={current ? "ring-amber/40" : undefined}>
              <div className="flex items-start gap-3">
                <Badge emoji={ph.emoji} tint={ph.tint} locked={!reached} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-display text-base font-semibold text-cream">{meta.name}</p>
                    {current && <span className="rounded-md bg-amber/15 px-2 py-0.5 text-[10px] font-semibold text-amber">{g.cardTitle}</span>}
                  </div>
                  <p className="mt-0.5 text-sm text-cream/60">{meta.desc}</p>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-cream/35">
                    {ph.min} {g.pointsShort}+
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <SectionTitle>{g.advanceTitle}</SectionTitle>
      <div className="overflow-hidden rounded-2xl bg-graphite-800 ring-1 ring-white/[0.06] [&>*+*]:border-t [&>*+*]:border-white/[0.06]">
        {g.activities.map((a) => (
          <div key={a.label} className="flex items-center gap-3 px-4 py-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-base">{a.emoji}</span>
            <span className="min-w-0 flex-1 text-sm text-cream/85">{a.label}</span>
            <span className="shrink-0 font-display text-sm font-semibold text-amber">{a.pts}</span>
          </div>
        ))}
      </div>

      <Card className="mt-5 ring-teal/20">
        <p className="font-display text-sm font-semibold text-cream">🌱 {g.noRushTitle}</p>
        <p className="mt-1 text-sm leading-relaxed text-cream/65">{g.noRushBody}</p>
      </Card>
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
              <Badge emoji={m.emoji} tint="bg-amber/15" size="lg" locked={!got} />
              <p className={`mt-2.5 font-display text-sm font-semibold ${got ? "text-cream" : "text-cream/45"}`}>{meta.title}</p>
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
