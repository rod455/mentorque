"use client";

import { useState } from "react";
import { activeVehicle, servicesFor, usePrototype } from "@/lib/app/store";
import { computeHealth } from "@/lib/app/health";
import { LIMITS } from "@/lib/app/premium";
import { vehicleLabel } from "@/lib/app/content";
import { useNav, type View } from "@/lib/app/nav";
import { Button } from "@/components/ui/Button";
import { Card, Icon, inputCls, Sheet, useContent } from "../ui";
import { HealthPill } from "./Cars";

export function CarHub() {
  const c = useContent();
  const { s } = usePrototype();
  const { go } = useNav();
  const v = activeVehicle(s);

  if (!v) {
    return (
      <Card className="mt-6 text-center">
        <p className="font-display text-base text-cream">{c.cars.emptyTitle}</p>
        <Button className="mt-3" onClick={() => go({ name: "addCar" })}>
          {c.cars.add}
        </Button>
      </Card>
    );
  }

  const health = computeHealth(v, servicesFor(s, v.id));

  const cards: { icon: string; title: string; sub: string; view: View; accent: string }[] = [
    { icon: "gauge", title: c.carHub.cards.health, sub: c.carHub.cards.healthSub, view: { name: "health" }, accent: "bg-teal/15 text-teal" },
    { icon: "diagnose", title: c.carHub.cards.problem, sub: c.carHub.cards.problemSub, view: { name: "symptoms" }, accent: "bg-coral/15 text-coral" },
    { icon: "clock", title: c.carHub.cards.history, sub: c.carHub.cards.historySub, view: { name: "history" }, accent: "bg-amber/15 text-amber" },
    { icon: "calendar", title: c.carHub.cards.revisions, sub: c.carHub.cards.revisionsSub, view: { name: "revisions" }, accent: "bg-teal/15 text-teal" },
    { icon: "book", title: c.carHub.cards.learn, sub: c.carHub.cards.learnSub, view: { name: "learn" }, accent: "bg-amber/15 text-amber" },
    { icon: "settings", title: c.carHub.cards.settings, sub: c.carHub.cards.settingsSub, view: { name: "carSettings" }, accent: "bg-graphite-700 text-cream/70" },
  ];

  return (
    <div className="pt-3">
      <CarSelector />

      {/* Photo + km + health summary */}
      <Card className="mt-3 flex items-center gap-3">
        <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-teal/15 text-teal">
          {v.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v.photo} alt="" className="h-full w-full object-cover" />
          ) : (
            <Icon name={v.type === "moto" ? "moto" : "car"} className="h-8 w-8" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold text-cream">{vehicleLabel(v)}</p>
          <KmLine />
        </div>
        <button onClick={() => go({ name: "health" })} className="shrink-0 text-right">
          <span className="block text-[10px] uppercase tracking-wide text-cream/40">{c.carHub.health}</span>
          <HealthPill score={health.score} />
        </button>
      </Card>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <button
            key={card.title}
            onClick={() => go(card.view)}
            className="group flex aspect-square flex-col justify-between rounded-3xl bg-graphite-800 p-4 text-left ring-1 ring-white/5 transition-all hover:ring-white/15 active:scale-[0.98]"
          >
            <span className={`grid h-11 w-11 place-items-center rounded-2xl ${card.accent}`}>
              <Icon name={card.icon} className="h-6 w-6" />
            </span>
            <span>
              <span className="block font-display text-[15px] font-semibold leading-tight text-cream">{card.title}</span>
              <span className="mt-1 block text-xs leading-snug text-cream/50">{card.sub}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Km line with inline edit sheet.
function KmLine() {
  const c = useContent();
  const { s, updateVehicle } = usePrototype();
  const v = activeVehicle(s);
  const [open, setOpen] = useState(false);
  const [km, setKm] = useState(v?.odometerKm != null ? String(v.odometerKm) : "");

  if (!v) return null;
  const save = () => {
    updateVehicle(v.id, { odometerKm: km ? parseInt(km, 10) : undefined });
    setOpen(false);
  };

  return (
    <>
      <button onClick={() => { setKm(v.odometerKm != null ? String(v.odometerKm) : ""); setOpen(true); }} className="flex items-center gap-1.5 text-sm text-cream/60 hover:text-cream">
        {v.odometerKm != null ? `${v.odometerKm.toLocaleString()} ${c.carHub.km}` : c.cars.noKm}
        <Icon name="settings" className="h-3.5 w-3.5" />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)}>
        <h2 className="font-display text-xl font-bold text-cream">{c.carHub.updateKmTitle}</h2>
        <input value={km} inputMode="numeric" onChange={(e) => setKm(e.target.value.replace(/\D/g, ""))} placeholder={c.addCar.kmPh} className={`mt-4 ${inputCls}`} />
        <Button size="lg" className="mt-4 w-full" onClick={save}>
          {c.common.save}
        </Button>
      </Sheet>
    </>
  );
}

// Car selector: shows the active car; tap to switch or add.
export function CarSelector() {
  const c = useContent();
  const { s, setActiveVehicle } = usePrototype();
  const { go } = useNav();
  const [open, setOpen] = useState(false);
  const v = activeVehicle(s);
  if (!v) return null;

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex w-full items-center justify-between rounded-xl bg-graphite-800 px-4 py-2.5 ring-1 ring-white/10 hover:ring-white/20">
        <span className="font-display text-sm text-cream">{vehicleLabel(v)}</span>
        <span className="flex items-center gap-1 text-xs text-amber">
          {s.vehicles.length > 1 ? `${s.vehicles.length} ${c.nav.cars.toLowerCase()}` : ""} ▾
        </span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)}>
        <h2 className="font-display text-xl font-bold text-cream">{c.nav.cars}</h2>
        <div className="mt-3 space-y-2">
          {s.vehicles.map((car) => (
            <button
              key={car.id}
              onClick={() => { setActiveVehicle(car.id); setOpen(false); }}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left ring-1 ${car.id === v.id ? "bg-amber/12 ring-amber" : "bg-graphite-700 ring-white/5"}`}
            >
              <Icon name={car.type === "moto" ? "moto" : "car"} className="h-5 w-5 text-cream/70" />
              <span className="flex-1 font-display text-[15px] text-cream">{vehicleLabel(car)}</span>
              {car.id === v.id && <span className="text-amber">✓</span>}
            </button>
          ))}
        </div>
        <Button variant="ghost" className="mt-3 w-full" onClick={() => { setOpen(false); go(!s.premium && s.vehicles.length >= LIMITS.freeCars ? { name: "subscribe", ctx: "cars" } : { name: "addCar" }); }}>
          + {c.cars.add}
        </Button>
      </Sheet>
    </>
  );
}
