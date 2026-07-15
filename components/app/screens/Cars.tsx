"use client";

import { useRef, useState } from "react";
import { activeVehicle, servicesFor, usePrototype } from "@/lib/app/store";
import { computeHealth } from "@/lib/app/health";
import { vehicleLabel } from "@/lib/app/content";
import { resizeImage } from "@/lib/app/image";
import type { Vehicle, VehicleType } from "@/lib/app/types";
import { Button } from "@/components/ui/Button";
import { useNav } from "@/lib/app/nav";
import { AppHeader, Card, Chip, Icon, inputCls, useContent } from "../ui";

function healthColor(score: number) {
  return score >= 80 ? "text-teal" : score >= 60 ? "text-amber" : "text-coral";
}

export function HealthPill({ score }: { score: number }) {
  return <span className={`font-display text-sm font-semibold ${healthColor(score)}`}>{score}%</span>;
}

// 1.1 — Meus Carros
export function CarsScreen() {
  const c = useContent();
  const { s, setActiveVehicle } = usePrototype();
  const { go, root } = useNav();

  return (
    <div>
      <AppHeader
        title={c.cars.title}
        action={
          s.vehicles.length > 0 ? (
            <button onClick={() => go({ name: "addCar" })} className="grid h-9 w-9 place-items-center rounded-full bg-amber text-graphite" aria-label={c.cars.add}>
              <Icon name="plus" className="h-5 w-5" />
            </button>
          ) : undefined
        }
      />

      {s.vehicles.length === 0 ? (
        <Card className="mt-4 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-graphite-700 text-cream/60">
            <Icon name="car" className="h-7 w-7" />
          </div>
          <p className="font-display text-base text-cream">{c.cars.emptyTitle}</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-cream/55">{c.cars.emptyBody}</p>
          <Button className="mt-4" onClick={() => go({ name: "addCar" })}>
            {c.cars.add}
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {s.vehicles.map((v) => {
            const health = computeHealth(v, servicesFor(s, v.id));
            return (
              <button
                key={v.id}
                onClick={() => {
                  setActiveVehicle(v.id);
                  root({ name: "car" });
                }}
                className="block w-full text-left"
              >
                <Card className="flex items-center gap-3 hover:ring-white/15">
                  <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-teal/15 text-teal">
                    {v.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={v.photo} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Icon name={v.type === "moto" ? "moto" : "car"} className="h-7 w-7" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-base text-cream">{vehicleLabel(v)}</span>
                    <span className="block truncate text-xs text-cream/50">
                      {[v.plate, v.odometerKm != null ? `${v.odometerKm.toLocaleString()} km` : c.cars.noKm].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-[10px] uppercase tracking-wide text-cream/40">{c.cars.health}</span>
                    <HealthPill score={health.score} />
                  </span>
                </Card>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// 1.2 — Adicionar carro (also reused for editing via editId)
export function AddCarScreen({ editId }: { editId?: string }) {
  const c = useContent();
  const a = c.addCar;
  const { s, addVehicle, updateVehicle } = usePrototype();
  const { go, back, root } = useNav();
  const editing = editId ? s.vehicles.find((v) => v.id === editId) ?? null : null;

  const [type, setType] = useState<VehicleType>(editing?.type ?? "car");
  const [make, setMake] = useState<string | null>(editing?.make ?? null);
  const [model, setModel] = useState<string | null>(editing?.model ?? null);
  const [year, setYear] = useState<number | null>(editing?.year ?? null);
  const [engine, setEngine] = useState(editing?.engine ?? "");
  const [version, setVersion] = useState(editing?.version ?? "");
  const [plate, setPlate] = useState(editing?.plate ?? "");
  const [km, setKm] = useState(editing?.odometerKm != null ? String(editing.odometerKm) : "");
  const [photo, setPhoto] = useState<string | undefined>(editing?.photo);
  const inputRef = useRef<HTMLInputElement>(null);

  const valid = !!(make && model && year);

  const onPhoto = async (file?: File) => {
    if (!file) return;
    try {
      setPhoto(await resizeImage(file));
    } catch {
      /* ignore */
    }
  };

  const save = () => {
    if (!valid) return;
    const data = {
      type,
      make: make!,
      model: model!,
      year: year!,
      engine: engine.trim() || undefined,
      version: s.premium && version.trim() ? version.trim() : undefined,
      plate: plate.trim() || undefined,
      odometerKm: km ? parseInt(km, 10) : undefined,
      photo,
    };
    if (editing) {
      updateVehicle(editing.id, data);
      back();
    } else {
      addVehicle(data);
      root({ name: "car" });
    }
  };

  const models = make ? c.modelsByMake[make] ?? [] : [];

  return (
    <div>
      <AppHeader title={editing ? a.editTitle : a.title} />

      <div className="space-y-5 pb-4">
        <div className="grid grid-cols-2 gap-2">
          {(["car", "moto"] as VehicleType[]).map((tp) => (
            <button
              key={tp}
              onClick={() => { setType(tp); setMake(null); setModel(null); }}
              className={`flex items-center justify-center gap-2 rounded-xl py-3 font-display ring-1 transition-colors ${type === tp ? "bg-teal/15 text-teal ring-teal" : "bg-graphite-800 text-cream/70 ring-white/10"}`}
            >
              <Icon name={tp === "car" ? "car" : "moto"} className="h-5 w-5" />
              {tp === "car" ? a.car : a.moto}
            </button>
          ))}
        </div>

        <Picker label={a.make} value={make} options={c.makes[type]} onPick={(v) => { setMake(v); setModel(null); }} />
        {make && <Picker label={a.model} value={model} options={models} onPick={setModel} />}
        {model && <Picker label={a.year} value={year} options={c.years.slice(0, 14)} onPick={setYear} />}

        <Field label={a.engine}>
          <input value={engine} onChange={(e) => setEngine(e.target.value)} placeholder={a.enginePh} className={inputCls} />
        </Field>

        {/* Version — Premium ultra-personalization */}
        <Field label={a.version}>
          {s.premium ? (
            <input value={version} onChange={(e) => setVersion(e.target.value)} placeholder={a.versionPh} className={inputCls} />
          ) : (
            <button onClick={() => go({ name: "subscribe" })} className="flex w-full items-center gap-2 rounded-xl bg-amber/10 px-3.5 py-3 text-left text-sm text-amber ring-1 ring-amber/20 hover:ring-amber/40">
              🔒 {a.versionPremium}
            </button>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={a.plate}>
            <input value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} placeholder={a.platePh} className={inputCls} />
          </Field>
          <Field label={a.km}>
            <input value={km} inputMode="numeric" onChange={(e) => setKm(e.target.value.replace(/\D/g, ""))} placeholder={a.kmPh} className={inputCls} />
          </Field>
        </div>

        <Field label={a.photo}>
          <button onClick={() => inputRef.current?.click()} className="flex w-full items-center gap-3 rounded-xl bg-graphite-800 px-3.5 py-3 text-left ring-1 ring-white/10 hover:ring-amber/30">
            <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-lg bg-graphite-700 text-cream/60">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="" className="h-full w-full object-cover" />
              ) : (
                "📷"
              )}
            </span>
            <span className="text-sm text-cream/70">{photo ? a.changePhoto : a.addPhoto}</span>
          </button>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0])} />
        </Field>

        {!valid && <p className="text-xs text-cream/45">{a.needModel}</p>}

        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={back}>
            {c.common.cancel}
          </Button>
          <Button className="flex-1" disabled={!valid} onClick={save}>
            {c.common.save}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-wide text-cream/45">{label}</span>
      {children}
    </label>
  );
}

function Picker<T extends string | number>({ label, value, options, onPick }: { label: string; value: T | null; options: T[]; onPick: (v: T) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-xs uppercase tracking-wide text-cream/45">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip key={String(o)} active={value === o} onClick={() => onPick(o)}>
            {o}
          </Chip>
        ))}
      </div>
    </div>
  );
}
