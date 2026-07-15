"use client";

import { useState } from "react";
import { usePrototype } from "@/lib/app/store";
import { vehicleLabel } from "@/lib/app/content";
import type { Access } from "@/lib/app/types";
import { Button } from "@/components/ui/Button";
import { AccessBadge, Card, GateRow, Icon, SectionTitle, SeverityDot, useContent } from "../ui";
import { LastServiceBlock, VehicleHero } from "../VehicleHome";
import { SafetyPanel } from "../SafetyPanel";
import { IconArrow } from "@/lib/icons";

type GarageTab = "overview" | "maintenance" | "diagnosis" | "specs";

export function GarageScreen({ onPaywall, onLearn, onSwap }: { onPaywall: () => void; onLearn: () => void; onSwap: () => void }) {
  const c = useContent();
  const { s } = usePrototype();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<GarageTab>("overview");

  // Premium unlocks the depth rows; pure 1:1 consulting stays elsewhere.
  const eff = (a: Access): Access => (s.premium && a !== "free" ? "free" : a);

  // Learn-only path: no vehicle yet (spec §5 empty state).
  if (s.noVehicle && !s.vehicle) {
    return (
      <div className="pt-6">
        <SectionTitle>{c.garage.title}</SectionTitle>
        <Card className="text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-graphite-700 text-cream/60">
            <Icon name="car" className="h-7 w-7" />
          </div>
          <p className="font-display text-base text-cream">{c.garage.learnOnlyTitle}</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-cream/55">{c.garage.learnOnlyBody}</p>
          <Button className="mt-4" onClick={onLearn}>
            {c.learn.title}
          </Button>
        </Card>
      </div>
    );
  }

  // Vehicle list → detail.
  if (!open) {
    return (
      <div className="pt-1">
        {/* Photo hero + last-service log live with the vehicle */}
        <VehicleHero />
        <LastServiceBlock onPaywall={onPaywall} />

        <SectionTitle action={<button className="text-xs text-amber">{c.garage.add}</button>}>{c.garage.title}</SectionTitle>
        <button onClick={() => setOpen(true)} className="block w-full text-left">
          <Card className="flex items-center gap-3 hover:ring-white/15">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-teal/15 text-teal">
              <Icon name={s.vehicle?.type === "moto" ? "moto" : "car"} className="h-7 w-7" />
            </span>
            <span className="flex-1">
              <span className="block font-display text-base text-cream">{vehicleLabel(s.vehicle, "—")}</span>
              <span className="block text-xs text-cream/50">
                {[s.vehicle?.engine, s.vehicle?.version].filter(Boolean).join(" · ") || c.specs[0].value}
              </span>
            </span>
            <IconArrow className="h-5 w-5 text-cream/40" />
          </Card>
        </button>
      </div>
    );
  }

  return (
    <div className="pt-2">
      {/* Detail header */}
      <button onClick={() => setOpen(false)} className="mb-2 inline-flex items-center gap-1.5 text-sm text-cream/60 hover:text-cream">
        <IconArrow className="h-4 w-4 rotate-180" />
        {c.garage.title}
      </button>
      <h2 className="font-display text-xl font-bold text-cream">{vehicleLabel(s.vehicle, "—")}</h2>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {[c.specs[1].value, c.specs[2].value, c.specs[0].value].map((chip) => (
          <span key={chip} className="rounded-full bg-graphite-700 px-2.5 py-1 text-xs text-cream/70">
            {chip}
          </span>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-4 flex gap-1 rounded-xl bg-graphite-800 p-1 ring-1 ring-white/5">
        {(
          [
            ["overview", c.garage.tabs.overview],
            ["maintenance", c.garage.tabs.maintenance],
            ["diagnosis", c.garage.tabs.diagnosis],
            ["specs", c.garage.tabs.specs],
          ] as [GarageTab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-lg px-1 py-2 text-[12px] font-display transition-colors ${
              tab === key ? "bg-amber text-graphite" : "text-cream/60 hover:text-cream"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "overview" && (
          <div className="space-y-4">
            <Card className="ring-amber/25">
              <div className="flex items-center gap-2 text-amber">
                <Icon name="alert" className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">{c.garage.detected}</span>
              </div>
              <p className="mt-1.5 text-sm text-cream/80">{c.garage.detectedBody}</p>
            </Card>

            <div>
              <SectionTitle>{c.garage.problemsTitle}</SectionTitle>
              <div className="space-y-2">
                {c.problems.map((p) => (
                  <div key={p.title} className="flex items-center gap-3 rounded-xl bg-graphite-800 px-3.5 py-3 ring-1 ring-white/5">
                    <SeverityDot level={p.severity} />
                    <span className="flex-1 font-display text-[15px] text-cream">{p.title}</span>
                    <span className="text-sm text-cream/60">{p.cost}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live recalls / complaints / safety rating from NHTSA */}
            <SafetyPanel />

            <div className="space-y-2">
              <GateRow title={c.garage.stepByStep} access={eff("premium")} onLockedTap={onPaywall} />
              <GateRow title={c.garage.fairPrice} access={eff("premium")} onLockedTap={onPaywall} />
              <GateRow title={c.garage.teamReview} access={s.premium ? "free" : "consulting"} onLockedTap={onPaywall} />
            </div>

            {/* Trade-in decision entry inside the vehicle (spec §8) */}
            <button
              onClick={onSwap}
              className="flex w-full items-center gap-3 rounded-xl bg-graphite-800 px-3.5 py-3 text-left ring-1 ring-coral/20 hover:ring-coral/40"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-coral/15 text-coral">
                <span className="text-base">🔁</span>
              </span>
              <span className="flex-1 font-display text-[15px] text-cream">{c.home.swapTitle}</span>
              <span className="text-cream/40">›</span>
            </button>
          </div>
        )}

        {tab === "maintenance" && (
          <div className="space-y-4">
            <div>
              <SectionTitle>{c.garage.planTitle}</SectionTitle>
              <div className="space-y-2">
                {c.maintenance.map((m) => (
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
            </div>
            <div className="space-y-2">
              <GateRow
                title={c.garage.oilAffiliate}
                subtitle={c.garage.affiliateTag}
                access="free"
                left={<Icon name="tools" className="h-5 w-5 text-teal" />}
                right={<IconArrow className="h-5 w-5 text-cream/40" />}
              />
              <GateRow title={c.garage.stepByStep} access={eff("premium")} onLockedTap={onPaywall} />
              <GateRow title={c.garage.history} access={eff("premium")} onLockedTap={onPaywall} />
            </div>
          </div>
        )}

        {tab === "diagnosis" && (
          <div className="space-y-2">
            <GateRow title={c.garage.obdBasic} access="free" left={<Icon name="diagnose" className="h-5 w-5 text-teal" />} right={<AccessBadge access="free" />} />
            <GateRow title={c.garage.obdFull} access={eff("premium")} onLockedTap={onPaywall} />
            <GateRow title={c.garage.deepDiag} access={eff("premium")} onLockedTap={onPaywall} />
            <GateRow title={c.garage.teamReview} access={s.premium ? "free" : "consulting"} onLockedTap={onPaywall} />
          </div>
        )}

        {tab === "specs" && (
          <div className="space-y-2">
            <UltraBlock onPaywall={onPaywall} />
            {c.specs.map((sp) => (
              <div key={sp.label} className="flex items-center justify-between gap-3 rounded-xl bg-graphite-800 px-3.5 py-3 ring-1 ring-white/5">
                <span className="text-sm text-cream/55">{sp.label}</span>
                {sp.access === "consulting" && !s.premium ? (
                  <button onClick={onPaywall}>
                    <AccessBadge access="consulting" />
                  </button>
                ) : (
                  <span className="text-right font-display text-[15px] text-cream">{sp.value}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Premium ultra-personalization: exact engine + version of the car. Free users
// hit the paywall; Premium users get an inline form that patches the vehicle.
function UltraBlock({ onPaywall }: { onPaywall: () => void }) {
  const c = useContent();
  const { s, setVehicleSpec } = usePrototype();
  const [engine, setEngine] = useState(s.vehicle?.engine ?? "");
  const [version, setVersion] = useState(s.vehicle?.version ?? "");
  const [saved, setSaved] = useState(false);

  if (!s.premium) {
    return (
      <GateRow
        title={c.garage.ultraLockedTitle}
        subtitle={c.garage.ultraLockedBody}
        access="premium"
        left={<Icon name="spark" className="h-5 w-5 text-amber" />}
        onLockedTap={onPaywall}
      />
    );
  }

  const dirty = engine.trim() !== (s.vehicle?.engine ?? "") || version.trim() !== (s.vehicle?.version ?? "");
  const inputCls = "w-full rounded-xl bg-graphite-700 px-3.5 py-2.5 text-cream ring-1 ring-white/10 outline-none placeholder:text-cream/40 focus:ring-amber";

  const save = () => {
    setVehicleSpec({ engine: engine.trim() || undefined, version: version.trim() || undefined });
    setSaved(true);
  };

  return (
    <Card className="ring-amber/25">
      <div className="flex items-center gap-2 text-amber">
        <Icon name="spark" className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wide">{c.garage.ultraTitle}</span>
        <span className="ml-auto rounded-md bg-amber/15 px-2 py-0.5 text-[11px] font-medium text-amber">Premium</span>
      </div>
      <p className="mt-1.5 text-sm text-cream/70">{c.garage.ultraBody}</p>
      <div className="mt-3 space-y-2.5">
        <label className="block">
          <span className="mb-1 block text-xs text-cream/55">{c.garage.ultraEngine}</span>
          <input value={engine} placeholder={c.garage.ultraEnginePh} onChange={(e) => { setEngine(e.target.value); setSaved(false); }} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-cream/55">{c.garage.ultraVersion}</span>
          <input value={version} placeholder={c.garage.ultraVersionPh} onChange={(e) => { setVersion(e.target.value); setSaved(false); }} className={inputCls} />
        </label>
      </div>
      <Button size="lg" className="mt-3 w-full" disabled={!dirty} onClick={save}>
        {saved && !dirty ? c.garage.ultraSaved : c.garage.ultraSave}
      </Button>
    </Card>
  );
}
