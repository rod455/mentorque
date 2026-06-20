"use client";

import type { Tab } from "../Shell";
import { dominantTag, usePrototype } from "@/lib/app/store";
import { Button } from "@/components/ui/Button";
import { Card, Icon, SectionTitle, SeverityDot, useContent } from "../ui";

export function HomeScreen({
  onNavigate,
  onDiagnose,
  onPaywall,
}: {
  onNavigate: (t: Tab) => void;
  onDiagnose: () => void;
  onPaywall: () => void;
}) {
  const c = useContent();
  const { s } = usePrototype();
  const dom = dominantTag(s);

  // All blocks exist for everyone; the dominant intention just leads (spec §4).
  const lead =
    s.noVehicle || ["learn", "career"].includes(dom)
      ? "track"
      : dom === "save"
      ? "problems"
      : dom === "care"
      ? "maintenance"
      : dom === "urgent"
      ? "diagnose"
      : "problems";

  const order = ["attention", lead, "problems", "maintenance", "diagnose", "track"].filter(
    (v, i, a) => a.indexOf(v) === i && v !== "attention"
  );

  const blocks: Record<string, JSX.Element> = {
    problems: (
      <section key="problems">
        <SectionTitle action={<button onClick={() => onNavigate("garage")} className="text-xs text-amber">{c.common.seeAll}</button>}>
          {c.home.commonProblems}
        </SectionTitle>
        <div className="space-y-2">
          {c.problems.slice(0, 3).map((p) => (
            <button
              key={p.title}
              onClick={() => onNavigate("garage")}
              className="flex w-full items-center gap-3 rounded-xl bg-graphite-800 px-3.5 py-3 text-left ring-1 ring-white/5 hover:ring-white/15"
            >
              <SeverityDot level={p.severity} />
              <span className="flex-1 font-display text-[15px] text-cream">{p.title}</span>
              <span className="text-sm text-cream/60">{p.cost}</span>
            </button>
          ))}
        </div>
      </section>
    ),
    maintenance: (
      <section key="maintenance">
        <SectionTitle action={<button onClick={() => onNavigate("garage")} className="text-xs text-amber">{c.common.seeAll}</button>}>
          {c.home.maintenanceNow}
        </SectionTitle>
        <div className="space-y-2">
          {c.maintenance.slice(0, 2).map((m) => (
            <div key={m.title} className="flex items-center gap-3 rounded-xl bg-graphite-800 px-3.5 py-3 ring-1 ring-white/5">
              <Icon name="calendar" className="h-5 w-5 text-teal" />
              <span className="flex-1">
                <span className="block font-display text-[15px] text-cream">{m.title}</span>
                <span className="block text-xs text-cream/50">{m.when}</span>
              </span>
              <span className="text-sm text-cream/60">{m.cost}</span>
            </div>
          ))}
        </div>
      </section>
    ),
    diagnose: (
      <section key="diagnose">
        <SectionTitle>{c.home.diagnoseHighlight}</SectionTitle>
        <Card className="flex items-center gap-3 ring-amber/20">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber/15 text-amber">
            <Icon name="diagnose" className="h-6 w-6" />
          </span>
          <span className="flex-1 text-sm text-cream/70">{c.diagnose.bySymptom} · {c.diagnose.byObd}</span>
          <Button size="md" onClick={onDiagnose}>
            {c.nav.diagnose}
          </Button>
        </Card>
      </section>
    ),
    track: (
      <section key="track">
        <SectionTitle action={<button onClick={() => onNavigate("learn")} className="text-xs text-amber">{c.common.seeAll}</button>}>
          {c.home.continueTrack}
        </SectionTitle>
        <button onClick={() => onNavigate("learn")} className="block w-full text-left">
          <Card>
            <p className="font-display text-base text-cream">{c.tracks[0].title}</p>
            <p className="mt-1 text-xs text-cream/55">{c.tracks[0].level} · {c.tracks[0].lessons} {c.learn.lessons}</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-graphite-700">
              <div className="h-full w-1/3 rounded-full bg-amber" />
            </div>
          </Card>
        </button>
      </section>
    ),
  };

  return (
    <div>
      {/* Needs attention — aggregated alerts across vehicles */}
      {!s.noVehicle && (
        <section>
          <SectionTitle>{c.home.needsAttention}</SectionTitle>
          <Card className="ring-coral/25">
            <div className="flex items-center gap-3">
              <Icon name="alert" className="h-5 w-5 text-coral" />
              <span className="flex-1 text-sm text-cream/80">{c.garage.detectedBody}</span>
            </div>
            <button onClick={onDiagnose} className="mt-3 text-sm font-medium text-amber">
              {c.nav.diagnose} →
            </button>
          </Card>
        </section>
      )}

      {order.map((k) => blocks[k])}

      {/* Trade-in decision card (appears on cost signals) */}
      {!s.noVehicle && (
        <section>
          <SectionTitle>{c.home.swapTitle}</SectionTitle>
          <Card className="ring-coral/20">
            <p className="text-sm text-cream/70">{c.home.swapBody}</p>
            <button onClick={onPaywall} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-coral">
              <Icon name="check" className="hidden" />
              {c.home.swapCta} →
            </button>
          </Card>
        </section>
      )}

      {/* Consulting shortcut */}
      <section className="mt-5">
        <button
          onClick={() => onNavigate("consulting")}
          className="flex w-full items-center gap-3 rounded-xl bg-graphite-800 px-3.5 py-3 ring-1 ring-white/5 hover:ring-white/15"
        >
          <Icon name="consult" className="h-5 w-5 text-coral" />
          <span className="flex-1 text-left font-display text-[15px] text-cream">{c.home.consultingShortcut}</span>
          <span className="text-cream/40">›</span>
        </button>
      </section>
    </div>
  );
}
