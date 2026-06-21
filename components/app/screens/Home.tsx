"use client";

import type { ReactNode } from "react";
import type { Tab } from "../Shell";
import type { Severity } from "@/lib/app/types";
import { usePrototype } from "@/lib/app/store";
import { Icon, SeverityDot, useContent } from "../ui";
import { LastServiceBlock, VehicleHero } from "../VehicleHome";

type Accent = "amber" | "coral" | "teal";

const CHIP: Record<Accent, string> = {
  amber: "bg-amber/15 text-amber",
  coral: "bg-coral/15 text-coral",
  teal: "bg-teal/15 text-teal",
};

// A clean, square action tile (Bloom-style grid).
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

const SEV_RANK: Record<Severity, number> = { high: 3, medium: 2, low: 1 };

export function HomeScreen({
  onNavigate,
  onDiagnose,
  onPaywall,
  onSwap,
}: {
  onNavigate: (t: Tab) => void;
  onDiagnose: () => void;
  onPaywall: () => void;
  onSwap: () => void;
}) {
  const c = useContent();
  const { s } = usePrototype();

  const worstProblem = [...c.problems].sort((a, b) => SEV_RANK[b.severity] - SEV_RANK[a.severity])[0];

  // Learning-first layout when there's no vehicle yet.
  if (s.noVehicle) {
    return (
      <div className="grid grid-cols-2 gap-3 pt-1">
        <Tile
          icon="track"
          title={c.nav.learn}
          subtitle={c.tracks[0].title}
          accent="amber"
          onClick={() => onNavigate("learn")}
          footer={
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-graphite-700">
              <div className="h-full w-1/3 rounded-full bg-amber" />
            </div>
          }
        />
        <Tile icon="diagnose" title={c.nav.diagnose} subtitle={c.diagnose.bySymptom} accent="coral" onClick={onDiagnose} />
        <Tile icon="consult" title={c.nav.consulting} subtitle={c.home.consultingShortcut} accent="teal" onClick={() => onNavigate("consulting")} />
      </div>
    );
  }

  return (
    <div>
      {/* Vehicle photo hero + last-service log */}
      <VehicleHero />
      <LastServiceBlock onPaywall={onPaywall} />

      {/* Needs attention — slim accent strip */}
      <button
        onClick={onDiagnose}
        className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-coral/10 px-4 py-3 text-left ring-1 ring-coral/25 transition-colors hover:ring-coral/40"
      >
        <Icon name="alert" className="h-5 w-5 shrink-0 text-coral" />
        <span className="min-w-0 flex-1">
          <span className="block text-xs uppercase tracking-wide text-coral/80">{c.home.needsAttention}</span>
          <span className="block truncate text-sm text-cream/80">{c.garage.detectedBody}</span>
        </span>
        <span className="shrink-0 text-coral">›</span>
      </button>

      {/* Square action grid */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Tile icon="diagnose" title={c.nav.diagnose} subtitle={c.diagnose.bySymptom} accent="amber" onClick={onDiagnose} />

        <Tile
          icon="car"
          title={c.home.swapCta}
          subtitle="FIPE"
          accent="coral"
          onClick={onSwap}
        />

        <Tile
          icon="tools"
          title={c.home.commonProblems}
          subtitle={worstProblem?.title}
          accent="teal"
          corner={worstProblem ? <SeverityDot level={worstProblem.severity} /> : undefined}
          onClick={() => onNavigate("garage")}
        />

        <Tile
          icon="calendar"
          title={c.garage.tabs.maintenance}
          subtitle={c.maintenance[0]?.title}
          accent="amber"
          onClick={() => onNavigate("garage")}
        />

        <Tile
          icon="track"
          title={c.nav.learn}
          subtitle={c.tracks[0].title}
          accent="teal"
          onClick={() => onNavigate("learn")}
          footer={
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-graphite-700">
              <div className="h-full w-1/3 rounded-full bg-amber" />
            </div>
          }
        />

        <Tile icon="consult" title={c.nav.consulting} subtitle={c.home.consultingShortcut} accent="coral" onClick={() => onNavigate("consulting")} />
      </div>
    </div>
  );
}
