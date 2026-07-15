"use client";

import { activeVehicle, servicesFor, usePrototype } from "@/lib/app/store";
import { formatBRL, vehicleLabel } from "@/lib/app/content";
import { useNav } from "@/lib/app/nav";
import { Button } from "@/components/ui/Button";
import { AppHeader, Card, Icon, SectionTitle, useContent } from "../ui";

export function CarSettingsScreen() {
  const c = useContent();
  const cs = c.carSettings;
  const { s, removeVehicle } = usePrototype();
  const { go, root } = useNav();
  const v = activeVehicle(s);
  if (!v) return <AppHeader title={cs.title} />;

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

      <div className="mt-3 space-y-2">
        <Row icon="clock" label={cs.export} onClick={exportHistory} />
        <Row icon="explore" label={cs.shareLink} onClick={shareLink} />
      </div>

      <SectionTitle>{cs.danger}</SectionTitle>
      <button onClick={del} className="flex w-full items-center gap-3 rounded-xl bg-coral/10 px-3.5 py-3.5 text-left ring-1 ring-coral/25 hover:ring-coral/40">
        <Icon name="alert" className="h-5 w-5 shrink-0 text-coral" />
        <span className="font-display text-[15px] text-coral">{cs.deleteCar}</span>
      </button>
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
