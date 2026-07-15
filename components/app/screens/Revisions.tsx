"use client";

import { useState } from "react";
import { activeVehicle, servicesFor, usePrototype } from "@/lib/app/store";
import { computeUpcoming, type UpcomingItem } from "@/lib/app/health";
import { useNav } from "@/lib/app/nav";
import { AppHeader, Card, Icon, SectionTitle, useContent } from "../ui";

const statusTone: Record<string, string> = { overdue: "text-coral", soon: "text-amber", ok: "text-teal" };

export function RevisionsScreen() {
  const c = useContent();
  const r = c.revisions;
  const { s } = usePrototype();
  const { go } = useNav();
  const v = activeVehicle(s);
  const [reminded, setReminded] = useState<string[]>([]);
  if (!v) return <AppHeader title={r.title} />;

  if (v.odometerKm == null) {
    return (
      <div>
        <AppHeader title={r.title} />
        <Card className="text-center text-sm text-cream/60">{r.needKm}</Card>
      </div>
    );
  }

  const items = computeUpcoming(v, servicesFor(s, v.id));
  const byKm = items.filter((i) => i.basis === "km");
  const byTime = items.filter((i) => i.basis === "time");

  const detail = (it: UpcomingItem): string => {
    if (it.basis === "km" && it.inKm != null) {
      return it.inKm <= 0 ? r.overdueKm.replace("{n}", Math.abs(it.inKm).toLocaleString()) : r.inKm.replace("{n}", it.inKm.toLocaleString());
    }
    if (it.basis === "time" && it.months != null) return r.monthsAgo.replace("{n}", String(it.months));
    return "";
  };

  const Item = ({ it }: { it: UpcomingItem }) => (
    <div className="rounded-xl bg-graphite-800 px-3.5 py-3 ring-1 ring-white/5">
      <div className="flex items-center gap-2">
        <span className="flex-1 font-display text-[15px] text-cream">{r.ruleLabels[it.key] ?? it.key}</span>
        <span className={`text-xs font-medium ${statusTone[it.status]}`}>{r.statusLabels[it.status]}</span>
      </div>
      <p className="mt-0.5 text-xs text-cream/55">{detail(it)}</p>
      <div className="mt-2.5 flex gap-2">
        <button
          onClick={() => setReminded((rm) => (rm.includes(it.key) ? rm : [...rm, it.key]))}
          className="rounded-lg bg-graphite-700 px-3 py-1.5 text-xs font-medium text-cream/80 ring-1 ring-white/10 hover:ring-white/20"
        >
          {reminded.includes(it.key) ? `🔔 ${r.reminded}` : r.remind}
        </button>
        <button
          onClick={() => go({ name: "addService", preset: { type: it.key } })}
          className="rounded-lg bg-amber/15 px-3 py-1.5 text-xs font-medium text-amber ring-1 ring-amber/20 hover:ring-amber/40"
        >
          {r.didIt}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <AppHeader title={r.title} />
      {items.length === 0 ? (
        <Card className="flex items-center gap-2 text-sm text-cream/60">
          <span className="text-teal">✓</span> {r.none}
        </Card>
      ) : (
        <>
          {byKm.length > 0 && (
            <>
              <SectionTitle>{r.byKm}</SectionTitle>
              <div className="space-y-2">{byKm.map((it) => <Item key={"km-" + it.key} it={it} />)}</div>
            </>
          )}
          {byTime.length > 0 && (
            <>
              <SectionTitle>{r.byTime}</SectionTitle>
              <div className="space-y-2">{byTime.map((it) => <Item key={"t-" + it.key} it={it} />)}</div>
            </>
          )}
        </>
      )}
    </div>
  );
}
