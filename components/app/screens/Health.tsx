"use client";

import { activeVehicle, servicesFor, usePrototype } from "@/lib/app/store";
import { computeHealth, SERVICE_SYSTEMS } from "@/lib/app/health";
import { vehicleLabel } from "@/lib/app/content";
import type { SystemKey } from "@/lib/app/types";
import { useNav } from "@/lib/app/nav";
import { Button } from "@/components/ui/Button";
import { AppHeader, Card, Icon, SectionTitle, SeverityDot, useContent } from "../ui";
import { SafetyPanel } from "../SafetyPanel";

const SYSTEM_TO_SERVICE: Record<SystemKey, string> = {
  engine: "oil",
  brakes: "brakes",
  suspension: "suspension",
  tires: "tires",
  electrical: "battery",
};

const scoreColor = (n: number) => (n >= 80 ? "text-teal" : n >= 60 ? "text-amber" : "text-coral");
const statusTone: Record<string, string> = { ok: "text-teal", attention: "text-amber", overdue: "text-coral" };
const sevOf = (status: string) => (status === "overdue" ? "high" : status === "attention" ? "medium" : "low") as "high" | "medium" | "low";

// 2.3.A — Visão geral da saúde
export function HealthScreen() {
  const c = useContent();
  const h = c.health;
  const { s } = usePrototype();
  const { go } = useNav();
  const v = activeVehicle(s);
  if (!v) return <AppHeader title={h.scoreLabel} />;

  const health = computeHealth(v, servicesFor(s, v.id));

  const findingText = (code: string, km?: number, system?: SystemKey) => {
    let text = h.findings[code] ?? code;
    if (km != null) text = text.replace("{n}", km.toLocaleString());
    if (system) text = text.replace("{s}", h.systemLabels[system]);
    return text;
  };

  return (
    <div>
      <AppHeader title={`${h.title} ${v.model}`} />

      {/* Score */}
      <Card className="flex items-center gap-4">
        <div className="relative grid h-20 w-20 shrink-0 place-items-center">
          <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/10" />
            <circle
              cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${(health.score / 100) * 97.4} 97.4`}
              className={scoreColor(health.score)}
            />
          </svg>
          <span className={`absolute font-display text-xl font-bold ${scoreColor(health.score)}`}>{health.score}%</span>
        </div>
        <div>
          <p className="font-display text-base text-cream">{h.scoreLabel}</p>
          <p className="text-sm text-cream/55">{vehicleLabel(v)}</p>
        </div>
      </Card>

      {/* Attention points */}
      <SectionTitle>{h.attention}</SectionTitle>
      {health.findings.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl bg-graphite-800 px-3.5 py-3 text-sm text-cream/60 ring-1 ring-white/5">
          <span className="text-teal">✓</span> {h.allGood}
        </div>
      ) : (
        <div className="space-y-2">
          {health.findings.map((f, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-xl bg-graphite-800 px-3.5 py-3 ring-1 ring-white/5">
              <SeverityDot level={f.severity} />
              <span className="text-sm text-cream/85">{findingText(f.code, f.km, f.system)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Systems */}
      <SectionTitle>{h.systemsTitle}</SectionTitle>
      <div className="space-y-2">
        {health.systems.map((sys) => (
          <button
            key={sys.key}
            onClick={() => go({ name: "system", system: sys.key })}
            className="flex w-full items-center gap-3 rounded-xl bg-graphite-800 px-3.5 py-3 text-left ring-1 ring-white/5 hover:ring-white/15"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-graphite-700 text-cream/70">
              <Icon name={sys.key} className="h-5 w-5" />
            </span>
            <span className="flex-1 font-display text-[15px] text-cream">{h.systemLabels[sys.key]}</span>
            <span className={`text-xs font-medium ${statusTone[sys.status]}`}>{h.statusLabels[sys.status]}</span>
            <span className="text-cream/40">›</span>
          </button>
        ))}
      </div>

      {/* Live recalls / complaints / safety (NHTSA) */}
      <div className="mt-2">
        <SafetyPanel vehicle={v} />
      </div>

      <Button variant="secondary" className="mt-5 w-full" onClick={() => go({ name: "revisions" })}>
        {h.seeRevisions}
      </Button>
    </div>
  );
}

// 2.3.B — Detalhe por sistema
export function SystemDetail({ system }: { system: SystemKey }) {
  const c = useContent();
  const h = c.health;
  const d = c.systemDetail;
  const { s } = usePrototype();
  const { go } = useNav();
  const v = activeVehicle(s);
  if (!v) return <AppHeader title="—" />;

  const services = servicesFor(s, v.id);
  const related = services.filter((r) => (SERVICE_SYSTEMS[r.type] ?? []).includes(system));
  const status = computeHealth(v, services).systems.find((x) => x.key === system);
  const last = related[0];

  const typeLabel = (key: string) => c.serviceTypes.find((t) => t.key === key)?.label ?? key;

  return (
    <div>
      <AppHeader title={`${h.systemLabels[system]} – ${v.model}`} />

      <SectionTitle>{d.state}</SectionTitle>
      <Card className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-graphite-700 text-cream/70">
          <Icon name={system} className="h-6 w-6" />
        </span>
        <div className="flex-1">
          <p className={`font-display text-[15px] ${statusTone[status?.status ?? "ok"]}`}>{h.statusLabels[status?.status ?? "ok"]}</p>
          <p className="text-xs text-cream/55">
            {last ? `${d.lastAt} ${last.km.toLocaleString()} km` : d.never}
          </p>
        </div>
      </Card>

      <SectionTitle>{d.recommendations}</SectionTitle>
      <ul className="space-y-1.5">
        {(status?.status === "ok"
          ? [h.statusLabels.ok]
          : [h.systemLabels[system] + " — " + h.statusLabels[status?.status ?? "attention"]]
        ).map((r) => (
          <li key={r} className="flex gap-2 rounded-xl bg-graphite-800 px-3.5 py-3 text-sm text-cream/80 ring-1 ring-white/5">
            <span className="text-amber">→</span> {r}
          </li>
        ))}
      </ul>

      <SectionTitle>{d.related}</SectionTitle>
      {related.length === 0 ? (
        <p className="rounded-xl bg-graphite-800 px-3.5 py-3 text-sm text-cream/55 ring-1 ring-white/5">{d.noHistory}</p>
      ) : (
        <div className="space-y-2">
          {related.map((r) => (
            <button key={r.id} onClick={() => go({ name: "service", id: r.id })} className="flex w-full items-center gap-3 rounded-xl bg-graphite-800 px-3.5 py-3 text-left ring-1 ring-white/5 hover:ring-white/15">
              <span className="flex-1 font-display text-[15px] text-cream">{typeLabel(r.type)}</span>
              <span className="text-xs text-cream/55">{r.km.toLocaleString()} km</span>
            </button>
          ))}
        </div>
      )}

      <Button className="mt-5 w-full" onClick={() => go({ name: "addService", preset: { type: SYSTEM_TO_SERVICE[system] } })}>
        {d.addRelated}
      </Button>
    </div>
  );
}
