"use client";

import { useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { usePrototype } from "@/lib/app/store";
import { vehicleLabel } from "@/lib/app/content";
import type { ServiceRecord } from "@/lib/app/types";
import { Button } from "@/components/ui/Button";
import { Card, Chip, Icon, Sheet, useContent } from "./ui";

const OIL_INTERVAL_KM = 10000;

function useLocaleFmt() {
  const { locale } = useI18n();
  const tag = locale === "pt" ? "pt-BR" : "en-US";
  return {
    km: (n: number) => n.toLocaleString(tag),
    date: (iso: string) => {
      const d = new Date(iso + "T00:00:00");
      return isNaN(d.getTime()) ? iso : d.toLocaleDateString(tag, { day: "2-digit", month: "short", year: "numeric" });
    },
  };
}

// Downscale an uploaded image to a small JPEG data URL so it fits localStorage.
function resizeImage(file: File, max: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no ctx"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Hero card at the top of Home: the car photo + name + mileage.
export function VehicleHero() {
  const c = useContent();
  const fmt = useLocaleFmt();
  const { s, setPhoto } = usePrototype();
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = async (file?: File) => {
    if (!file) return;
    try {
      const url = await resizeImage(file, 1000, 0.72);
      setPhoto(url);
    } catch {
      /* ignore unreadable files */
    }
  };

  return (
    <div className="relative mt-1 overflow-hidden rounded-2xl ring-1 ring-white/10">
      <div className="relative aspect-[16/10] w-full bg-gradient-to-br from-graphite-700 via-graphite-800 to-teal/20">
        {s.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.photo} alt={vehicleLabel(s.vehicle, "")} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-white/10">
            <Icon name={s.vehicle?.type === "moto" ? "moto" : "car"} className="h-28 w-28" />
          </div>
        )}

        {/* bottom gradient + label */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4">
          <p className="font-display text-lg font-semibold text-white drop-shadow">{vehicleLabel(s.vehicle, "")}</p>
          {s.odometerKm != null ? (
            <p className="text-sm text-white/80">{fmt.km(s.odometerKm)} {c.hero.odometer}</p>
          ) : (
            <p className="text-xs text-white/60">{c.hero.setOdometer}</p>
          )}
        </div>

        {/* photo button */}
        <button
          onClick={() => inputRef.current?.click()}
          className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/15 backdrop-blur hover:bg-black/70"
        >
          <Icon name="diagnose" className="hidden" />
          📷 {s.photo ? c.hero.changePhoto : c.hero.addPhoto}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}

// "Última revisão" summary + register/update button + form sheet.
export function LastServiceBlock({ onPaywall }: { onPaywall: () => void }) {
  const c = useContent();
  const fmt = useLocaleFmt();
  const { s } = usePrototype();
  const [open, setOpen] = useState(false);
  const rec = s.lastService;

  return (
    <section className="mt-3">
      {rec ? (
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-cream/45">{c.service.cardTitle}</p>
              <p className="mt-0.5 font-display text-[15px] text-cream">
                {c.service.on} {fmt.date(rec.date)} · {c.service.atKm} {fmt.km(rec.km)} {c.service.kmShort}
              </p>
            </div>
            <button onClick={() => setOpen(true)} className="shrink-0 text-xs font-medium text-amber">
              {c.service.update}
            </button>
          </div>
          {rec.items.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {rec.items.map((k) => {
                const item = c.serviceItems.find((i) => i.key === k);
                return (
                  <span key={k} className="rounded-full bg-graphite-700 px-2.5 py-1 text-xs text-cream/75">
                    {item?.label ?? k}
                  </span>
                );
              })}
            </div>
          )}
          {s.oilAlertKm != null && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-teal/12 px-3 py-2 text-xs text-teal">
              <Icon name="bell" className="hidden" />
              🔔 {c.service.nextOil} {fmt.km(s.oilAlertKm)} km
            </div>
          )}
        </Card>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-3 rounded-2xl bg-graphite-800 px-4 py-3.5 text-left ring-1 ring-white/5 hover:ring-amber/30"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber/15 text-amber">
            <Icon name="calendar" className="h-5 w-5" />
          </span>
          <span className="flex-1">
            <span className="block font-display text-[15px] text-cream">{c.service.register}</span>
            <span className="block text-xs text-cream/50">{c.service.none}</span>
          </span>
          <span className="text-cream/40">›</span>
        </button>
      )}

      <LastServiceSheet open={open} onClose={() => setOpen(false)} onPaywall={onPaywall} />
    </section>
  );
}

function LastServiceSheet({ open, onClose, onPaywall }: { open: boolean; onClose: () => void; onPaywall: () => void }) {
  const c = useContent();
  const { s, saveLastService } = usePrototype();
  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(s.lastService?.date ?? today);
  const [km, setKm] = useState<string>(s.lastService?.km ? String(s.lastService.km) : "");
  const [items, setItems] = useState<string[]>(s.lastService?.items ?? ["oil", "oilfilter"]);
  const [notes, setNotes] = useState(s.lastService?.notes ?? "");
  const [alertOn, setAlertOn] = useState(s.oilAlertKm != null);

  const toggle = (k: string) => setItems((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));

  const kmNum = parseInt(km, 10);
  const valid = !!date && Number.isFinite(kmNum) && kmNum > 0;
  const nextOilKm = Number.isFinite(kmNum) ? kmNum + OIL_INTERVAL_KM : null;

  const onAlertTap = () => {
    if (!s.premium) {
      onPaywall();
      return;
    }
    setAlertOn((v) => !v);
  };

  const save = () => {
    if (!valid) return;
    const rec: ServiceRecord = { date, km: kmNum, items, notes: notes.trim() || undefined };
    saveLastService(rec, alertOn && s.premium && nextOilKm ? nextOilKm : null);
    onClose();
  };

  const inputCls = "w-full rounded-xl bg-graphite-700 px-3.5 py-3 text-cream ring-1 ring-white/10 outline-none placeholder:text-cream/40 focus:ring-amber";

  return (
    <Sheet open={open} onClose={onClose}>
      <h2 className="font-display text-xl font-bold text-cream">{c.service.sheetTitle}</h2>

      <div className="mt-4 max-h-[60vh] space-y-4 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs text-cream/55">{c.service.date}</span>
            <input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-cream/55">{c.service.km}</span>
            <input type="number" inputMode="numeric" value={km} placeholder={c.service.kmPh} onChange={(e) => setKm(e.target.value)} className={inputCls} />
          </label>
        </div>

        <div>
          <span className="mb-1.5 block text-xs text-cream/55">{c.service.what}</span>
          <div className="flex flex-wrap gap-2">
            {c.serviceItems.map((it) => (
              <Chip key={it.key} active={items.includes(it.key)} onClick={() => toggle(it.key)}>
                {it.label}
              </Chip>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs text-cream/55">{c.service.notes}</span>
          <textarea value={notes} placeholder={c.service.notesPh} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputCls} />
        </label>

        {/* Premium oil-change reminder */}
        <button
          type="button"
          onClick={onAlertTap}
          className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left ring-1 transition-colors ${
            alertOn && s.premium ? "bg-teal/12 ring-teal/40" : "bg-graphite-700 ring-white/10 hover:ring-amber/30"
          }`}
        >
          <span className="text-lg">🔔</span>
          <span className="flex-1">
            <span className="block font-display text-[15px] text-cream">{c.service.oilAlertTitle}</span>
            <span className="block text-xs text-cream/55">
              {!s.premium
                ? c.service.oilAlertPremium
                : alertOn && nextOilKm
                ? `${c.service.nextOil} ${nextOilKm.toLocaleString()} km`
                : c.service.oilAlertBody}
            </span>
          </span>
          {!s.premium ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber/15 px-2 py-0.5 text-[11px] font-medium text-amber">
              <Icon name="diagnose" className="hidden" />🔒 Premium
            </span>
          ) : (
            <span className={`relative h-6 w-10 rounded-full transition-colors ${alertOn ? "bg-teal" : "bg-graphite-600"}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${alertOn ? "left-[18px]" : "left-0.5"}`} />
            </span>
          )}
        </button>
      </div>

      <Button size="lg" className="mt-4 w-full" disabled={!valid} onClick={save}>
        {c.service.save}
      </Button>
    </Sheet>
  );
}
