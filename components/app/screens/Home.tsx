"use client";

import { activeVehicle, servicesFor, usePrototype } from "@/lib/app/store";
import { computeHealth } from "@/lib/app/health";
import { vehicleLabel } from "@/lib/app/content";
import { useNav } from "@/lib/app/nav";
import { useContent, Card, Icon } from "../ui";
import { HealthPill } from "./Cars";

// Saudação conforme a hora do dia.
function greeting(h: { morning: string; afternoon: string; evening: string }): string {
  const hr = new Date().getHours();
  if (hr < 12) return h.morning;
  if (hr < 18) return h.afternoon;
  return h.evening;
}

// 0.0 — Início (dashboard estilo Bloom)
export function HomeScreen() {
  const c = useContent();
  const h = c.home;
  const { s } = usePrototype();
  const { go, root } = useNav();

  const car = activeVehicle(s);
  const hasCar = s.vehicles.length > 0;
  const name = (s.name || "").trim().split(/\s+/)[0] || h.driver;

  const quick: { icon: string; label: string; tint: string; go: () => void }[] = [
    { icon: "diagnose", label: h.qDiagnose, tint: "bg-coral/15 text-coral", go: () => root({ name: "symptoms" }) },
    { icon: "clock", label: h.qService, tint: "bg-teal/15 text-teal", go: () => go({ name: "addService" }) },
    { icon: "calendar", label: h.qRevisions, tint: "bg-amber/15 text-amber", go: () => root({ name: "revisions" }) },
    { icon: "book", label: h.qStudies, tint: "bg-white/10 text-cream/80", go: () => root({ name: "learn" }) },
  ];

  return (
    <div className="pb-4">
      {/* Saudação */}
      <h1 className="pt-1 font-serif text-2xl font-bold text-cream">
        {greeting(h)}, {name}!
      </h1>

      {/* Herói */}
      <div className="relative mt-3 overflow-hidden rounded-3xl bg-graphite-800 ring-1 ring-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/biela/cena-biela-garagem.webp"
          alt=""
          className="aspect-[16/12] w-full object-cover"
          style={{ objectPosition: "center 40%" }}
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-graphite-900 via-graphite-900/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h2 className="max-w-[15rem] font-serif text-2xl font-bold leading-tight text-cream">
            {hasCar ? h.heroTitle : h.heroTitleEmpty}
          </h2>
          <button
            onClick={() => (hasCar ? root({ name: "symptoms" }) : go({ name: "addCar" }))}
            className="mt-3 w-full rounded-full bg-amber py-3.5 text-center font-display text-[15px] font-semibold text-graphite active:scale-[0.99]"
          >
            {hasCar ? h.heroCta : h.heroCtaEmpty}
          </button>
        </div>
      </div>

      {/* Premium */}
      {!s.premium && (
        <button
          onClick={() => go({ name: "subscribe", ctx: "home" })}
          className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-amber/20 to-amber/5 px-4 py-3.5 text-left ring-1 ring-amber/25"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber/20 text-amber">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M3 7l4.5 3L12 4l4.5 6L21 7l-1.6 11H4.6L3 7z" /></svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[15px] font-semibold text-cream">{h.premiumTitle}</span>
            <span className="block text-xs text-cream/55">{h.premiumSub}</span>
          </span>
          <span className="shrink-0 text-lg text-amber">›</span>
        </button>
      )}

      {/* Busca (leva para Problemas) */}
      <button
        onClick={() => root({ name: "symptoms" })}
        className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-graphite-800 px-4 py-3 text-left ring-1 ring-white/[0.06]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-cream/45"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <span className="text-sm text-cream/45">{h.searchPh}</span>
      </button>

      {/* Seu carro */}
      {car && (
        <button
          onClick={() => root({ name: "car" })}
          className="mt-3 w-full text-left"
        >
          <Card className="hover:ring-white/15">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-teal/15 text-teal">
                {car.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={car.photo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Icon name={car.type === "moto" ? "moto" : "car"} className="h-6 w-6" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] uppercase tracking-wide text-cream/45">{h.yourCar}</span>
                <span className="block truncate font-display text-[15px] text-cream">{car.nickname || vehicleLabel(car)}</span>
              </span>
              <HealthPill score={computeHealth(car, servicesFor(s, car.id)).score} />
            </div>
          </Card>
        </button>
      )}

      {/* Ações rápidas */}
      <p className="mb-2 mt-5 font-display text-sm font-semibold text-cream/70">{h.quickTitle}</p>
      <div className="grid grid-cols-4 gap-2.5">
        {quick.map((q) => (
          <button key={q.label} onClick={q.go} className="flex flex-col items-center gap-1.5">
            <span className={`grid h-14 w-14 place-items-center rounded-2xl ${q.tint}`}>
              <Icon name={q.icon} className="h-6 w-6" />
            </span>
            <span className="text-center text-[11px] leading-tight text-cream/70">{q.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
