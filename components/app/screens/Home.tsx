"use client";

import type { ReactNode } from "react";
import type { Tab } from "../Shell";
import type { Severity } from "@/lib/app/types";
import { isProAudience, usePrototype } from "@/lib/app/store";
import { Icon, SeverityDot, useContent } from "../ui";

type Accent = "amber" | "coral" | "teal";

const CHIP: Record<Accent, string> = {
  amber: "bg-amber/15 text-amber",
  coral: "bg-coral/15 text-coral",
  teal: "bg-teal/15 text-teal",
};

// A clean, square action tile (founder's "grandes cartões").
function Tile({
  icon,
  title,
  subtitle,
  accent,
  corner,
  footer,
  onClick,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  accent: Accent;
  corner?: ReactNode;
  footer?: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex aspect-square flex-col justify-between rounded-3xl bg-graphite-800 p-4 text-left ring-1 ring-white/5 transition-all hover:ring-white/15 active:scale-[0.98]"
    >
      <div className="flex items-start justify-between">
        <span className={`grid h-11 w-11 place-items-center rounded-2xl ${CHIP[accent]}`}>
          <Icon name={icon} className="h-6 w-6" />
        </span>
        {corner ?? <span className="text-cream/25 transition-colors group-hover:text-cream/50">↗</span>}
      </div>
      <div>
        <p className="font-display text-[15px] font-semibold leading-tight text-cream">{title}</p>
        {subtitle && <p className="mt-1 text-xs leading-snug text-cream/50">{subtitle}</p>}
        {footer}
      </div>
    </button>
  );
}

// Industry shortcut banner — only for pro audiences (mechanics / engineering /
// career intent). "Conhecimento direto da indústria" (founder's note).
function IndustryBanner({ onClick }: { onClick: () => void }) {
  const c = useContent();
  return (
    <button
      onClick={onClick}
      className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-teal/10 px-4 py-3.5 text-left ring-1 ring-teal/25 transition-colors hover:ring-teal/40"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal/15 text-teal">
        <Icon name="spark" className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] uppercase tracking-wide text-teal/80">{c.industry.badge}</span>
        <span className="block font-display text-[15px] text-cream">{c.industry.title}</span>
        <span className="block truncate text-xs text-cream/55">{c.industry.body}</span>
      </span>
      <span className="shrink-0 text-xs font-medium text-teal">{c.industry.cta}</span>
    </button>
  );
}

const SEV_RANK: Record<Severity, number> = { high: 3, medium: 2, low: 1 };

const PROGRESS_FOOTER = (
  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-graphite-700">
    <div className="h-full w-1/3 rounded-full bg-amber" />
  </div>
);

export function HomeScreen({
  onNavigate,
  onDiagnose,
  onExplore,
  onAsk,
  onCritical,
  onSwap,
}: {
  onNavigate: (t: Tab) => void;
  onDiagnose: () => void;
  onExplore: () => void;
  onAsk: () => void;
  onCritical: () => void;
  onSwap: () => void;
}) {
  const c = useContent();
  const { s } = usePrototype();
  const pro = isProAudience(s);

  const study = (
    <Tile icon="track" title={c.home.cards.study} subtitle={c.home.cards.studySub} accent="amber" onClick={() => onNavigate("learn")} />
  );
  const progress = (
    <Tile icon="check" title={c.home.cards.progress} subtitle={c.home.cards.progressSub} accent="teal" onClick={() => onNavigate("learn")} footer={PROGRESS_FOOTER} />
  );
  const explore = (
    <Tile icon="explore" title={c.home.cards.explore} subtitle={c.home.cards.exploreSub} accent="teal" onClick={onExplore} />
  );
  const ask = (
    <Tile icon="consult" title={c.home.cards.ask} subtitle={c.home.cards.askSub} accent="coral" onClick={onAsk} />
  );

  // Learning-first layout when there's no vehicle yet.
  if (s.noVehicle) {
    return (
      <div className="pt-1">
        {pro && <IndustryBanner onClick={onExplore} />}
        <div className="mt-3 grid grid-cols-2 gap-3">
          {study}
          {progress}
          {explore}
          {ask}
        </div>
      </div>
    );
  }

  const worstProblem = [...c.problems].sort((a, b) => SEV_RANK[b.severity] - SEV_RANK[a.severity])[0];

  return (
    <div className="pt-1">
      {/* Needs attention — the car's critical problems (founder's note) */}
      <button
        onClick={onCritical}
        className="flex w-full items-center gap-3 rounded-2xl bg-coral/10 px-4 py-3 text-left ring-1 ring-coral/25 transition-colors hover:ring-coral/40"
      >
        <Icon name="alert" className="h-5 w-5 shrink-0 text-coral" />
        <span className="min-w-0 flex-1">
          <span className="block text-xs uppercase tracking-wide text-coral/80">{c.home.needsAttention}</span>
          <span className="block truncate text-sm text-cream/80">{worstProblem?.title}</span>
        </span>
        <span className="shrink-0 text-coral">›</span>
      </button>

      {pro && <IndustryBanner onClick={onExplore} />}

      {/* Big action grid — Estudar · Meu carro · Resolver · Explorar · Aprendizado · Perguntar */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        {study}
        <Tile icon="car" title={c.home.cards.myCar} subtitle={c.home.cards.myCarSub} accent="teal" onClick={() => onNavigate("garage")} />
        <Tile
          icon="diagnose"
          title={c.home.cards.solve}
          subtitle={c.home.cards.solveSub}
          accent="coral"
          corner={worstProblem ? <SeverityDot level={worstProblem.severity} /> : undefined}
          onClick={onDiagnose}
        />
        {explore}
        {progress}
        {ask}
      </div>

      {/* Trade-in decision shortcut */}
      <button
        onClick={onSwap}
        className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-graphite-800 px-4 py-3.5 text-left ring-1 ring-white/5 hover:ring-coral/30"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-coral/12 text-coral">
          <span className="text-base">🔁</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[15px] text-cream">{c.home.swapTitle}</span>
          <span className="block truncate text-xs text-cream/55">{c.home.swapCta}</span>
        </span>
        <span className="shrink-0 text-cream/40">›</span>
      </button>
    </div>
  );
}
