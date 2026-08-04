"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { activeVehicle, servicesFor, usePrototype } from "@/lib/app/store";
import { formatBRL, formatMonths, minPurchaseDate, monthsSinceDate, vehicleLabel } from "@/lib/app/content";
import { useNav } from "@/lib/app/nav";
import { Button } from "@/components/ui/Button";
import { AppHeader, Card, Icon, inputCls, SectionTitle, Sheet, useContent } from "../ui";

export function CarSettingsScreen() {
  const c = useContent();
  const cs = c.carSettings;
  const { locale } = useI18n();
  const { s, removeVehicle, updateVehicle } = usePrototype();
  const { go, root } = useNav();
  const [soldSheet, setSoldSheet] = useState(false);
  const [soldInput, setSoldInput] = useState("");
  const v = activeVehicle(s);
  if (!v) return <AppHeader title={cs.title} />;

  const ownedMonths = monthsSinceDate(v.purchaseDate);

  const services = servicesFor(s, v.id);

  const exportHistory = () => {
    if (!s.premium) { go({ name: "subscribe", ctx: "exportPdf" }); return; }
    const lines = [
      `${vehicleLabel(v)}${v.plate ? " · " + v.plate : ""}`,
      v.odometerKm != null ? `${v.odometerKm.toLocaleString()} km` : "",
      "",
      c.history.title + ":",
      ...services.map((r) => {
        const label = c.serviceTypes.find((t) => t.key === r.type)?.label ?? r.type;
        return `- ${r.date} · ${label} · ${r.km.toLocaleString()} km${r.total != null ? " · " + formatBRL(r.total) : ""}`;
      }),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${v.make}-${v.model}-${v.year}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareLink = async () => {
    const text = `${vehicleLabel(v)} — ${services.length} ${c.history.title.toLowerCase()}`;
    try {
      if (navigator.share) await navigator.share({ title: vehicleLabel(v), text });
      else await navigator.clipboard?.writeText(text);
    } catch {
      /* cancelled */
    }
  };

  const del = () => {
    if (typeof window !== "undefined" && !window.confirm(cs.deleteConfirm)) return;
    removeVehicle(v.id);
    root({ name: "cars" });
  };

  return (
    <div>
      <AppHeader title={cs.title} />

      <SectionTitle>{cs.data}</SectionTitle>
      <Card className="flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-teal/15 text-teal">
          {v.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v.photo} alt="" className="h-full w-full object-cover" />
          ) : (
            <Icon name={v.type === "moto" ? "moto" : "car"} className="h-6 w-6" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[15px] text-cream">{vehicleLabel(v)}</p>
          <p className="truncate text-xs text-cream/55">
            {[v.engine, v.version, v.plate].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
        <button onClick={() => go({ name: "addCar", editId: v.id })} className="shrink-0 text-xs font-medium text-amber">
          {c.common.edit}
        </button>
      </Card>

      {/* Purchase date — feeds time-based revisions */}
      <Card className="mt-3">
        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-xs uppercase tracking-wide text-cream/45">
            <Icon name="calendar" className="h-3.5 w-3.5" /> {cs.purchaseDate}
          </span>
          <input
            type="date"
            value={v.purchaseDate ?? ""}
            min={minPurchaseDate(v.year)}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => { const val = e.target.value; if (val && val < minPurchaseDate(v.year)) return; updateVehicle(v.id, { purchaseDate: val || undefined }); }}
            className={inputCls}
          />
        </label>
        <p className="mt-1.5 text-xs text-cream/50">
          {ownedMonths != null ? c.revisions.ownedFor.replace("{n}", formatMonths(ownedMonths, locale)) : cs.purchaseHint}
        </p>
      </Card>

      <div className="mt-3 space-y-2">
        <Row icon="clock" label={cs.export} onClick={exportHistory} />
        <Row icon="explore" label={cs.shareLink} onClick={shareLink} />
      </div>

      {/* Vendi o carro — arquiva mantendo tudo */}
      <SectionTitle>{cs.soldTitle}</SectionTitle>
      {v.soldAt ? (
        <button
          onClick={() => updateVehicle(v.id, { soldAt: undefined })}
          className="flex w-full items-center gap-3 rounded-xl bg-teal/10 px-3.5 py-3.5 text-left ring-1 ring-teal/25 hover:ring-teal/40"
        >
          <Icon name="car" className="h-5 w-5 shrink-0 text-teal" />
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[15px] text-teal">{cs.unsoldCta}</span>
            <span className="block text-xs text-cream/50">{cs.soldOn.replace("{d}", v.soldAt.split("-").reverse().join("/"))}</span>
          </span>
        </button>
      ) : (
        <button
          onClick={() => { setSoldInput(new Date().toISOString().slice(0, 10)); setSoldSheet(true); }}
          className="flex w-full items-center gap-3 rounded-xl bg-graphite-800 px-3.5 py-3.5 text-left ring-1 ring-white/10 hover:ring-amber/30"
        >
          <span className="text-lg">🤝</span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[15px] text-cream">{cs.soldCta}</span>
            <span className="block text-xs text-cream/50">{cs.soldSheetBody}</span>
          </span>
        </button>
      )}

      <SectionTitle>{cs.danger}</SectionTitle>
      <button onClick={del} className="flex w-full items-center gap-3 rounded-xl bg-coral/10 px-3.5 py-3.5 text-left ring-1 ring-coral/25 hover:ring-coral/40">
        <Icon name="alert" className="h-5 w-5 shrink-0 text-coral" />
        <span className="font-display text-[15px] text-coral">{cs.deleteCar}</span>
      </button>
      <p className="mt-1.5 text-xs leading-relaxed text-cream/45">{cs.deleteNote}</p>

      {/* Data da venda */}
      <Sheet open={soldSheet} onClose={() => setSoldSheet(false)}>
        <h2 className="font-display text-xl font-bold text-cream">{cs.soldSheetTitle}</h2>
        <p className="mt-1 text-sm leading-relaxed text-cream/60">{cs.soldSheetBody}</p>
        <label className="mt-4 block">
          <span className="mb-1 block text-xs text-cream/55">{cs.soldWhen}</span>
          <input
            type="date"
            value={soldInput}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setSoldInput(e.target.value)}
            className={inputCls}
          />
        </label>
        <Button
          size="lg"
          className="mt-4 w-full"
          onClick={() => {
            updateVehicle(v.id, { soldAt: soldInput || new Date().toISOString().slice(0, 10) });
            setSoldSheet(false);
            root({ name: "cars" });
          }}
        >
          {cs.soldSave}
        </Button>
      </Sheet>
    </div>
  );
}

function Row({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-xl bg-graphite-800 px-3.5 py-3.5 text-left ring-1 ring-white/5 hover:ring-white/15">
      <Icon name={icon} className="h-5 w-5 text-cream/60" />
      <span className="flex-1 font-display text-[15px] text-cream">{label}</span>
      <span className="text-cream/40">›</span>
    </button>
  );
}
