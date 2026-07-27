"use client";

import { useState } from "react";
import { activeVehicle, servicesFor, usePrototype } from "@/lib/app/store";
import { computeHealth, SERVICE_SYSTEMS } from "@/lib/app/health";
import { computeQuizHealth, getHealthQuiz } from "@/lib/app/healthQuiz";
import { useI18n } from "@/lib/i18n";
import { costProjection, systemPct, systemPriority } from "@/lib/app/premium";
import { formatBRL, vehicleLabel } from "@/lib/app/content";
import type { SystemKey } from "@/lib/app/types";
import { useNav } from "@/lib/app/nav";
import { Button } from "@/components/ui/Button";
import { AppHeader, Card, Icon, LockedCard, PremiumBadge, SectionTitle, SeverityDot, useContent } from "../ui";
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
const REMAINING: Record<string, string> = { ok: "80%", attention: "40%", overdue: "15%" };

// 2.3.A — Visão geral da saúde
export function HealthScreen() {
  const c = useContent();
  const h = c.health;
  const { s } = usePrototype();
  const { go } = useNav();
  const v = activeVehicle(s);
  if (!v) return <AppHeader title={h.scoreLabel} />;

  const health = computeHealth(v, servicesFor(s, v.id));
  // The score always uses the spec formula; before the quiz, unanswered
  // questions fall back to a conservative note, so it reads lower + provisional.
  const hasQuiz = !!(v.quiz && Object.keys(v.quiz).length);
  const result = computeQuizHealth(v.quiz ?? {}, v);
  const displayScore = result.score;

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
              strokeDasharray={`${(displayScore / 100) * 97.4} 97.4`}
              className={scoreColor(displayScore)}
            />
          </svg>
          <span className={`absolute font-display text-xl font-bold ${scoreColor(displayScore)}`}>{displayScore}%</span>
        </div>
        <div className="min-w-0">
          <p className="font-display text-base text-cream">{h.scoreLabel}</p>
          <p className="truncate text-sm text-cream/55">{vehicleLabel(v)}</p>
          {hasQuiz ? (
            <p className="mt-0.5 text-xs text-teal">✓ {h.quizBasedOn}</p>
          ) : (
            <p className="mt-0.5 text-xs text-amber/80">{h.quizProvisional}</p>
          )}
        </div>
      </Card>

      {/* Health quiz: CTA when not taken, breakdown when taken */}
      {hasQuiz ? (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-graphite-800 px-3.5 py-3 ring-1 ring-white/5">
              <p className="text-[11px] text-cream/45">{h.quizNow}</p>
              <p className={`font-display text-lg font-bold ${scoreColor(result.vhs)}`}>{result.vhs}%</p>
            </div>
            <div className="rounded-2xl bg-graphite-800 px-3.5 py-3 ring-1 ring-white/5">
              <p className="text-[11px] text-cream/45">{h.quizRisk}</p>
              <p className={`font-display text-lg font-bold ${scoreColor(100 - result.vri)}`}>{result.vri}</p>
            </div>
          </div>
          <button onClick={() => go({ name: "healthQuiz" })} className="mt-2 w-full py-1.5 text-center text-sm text-amber/80 hover:text-amber">
            {h.quizRedo}
          </button>
        </>
      ) : (
        <button
          onClick={() => go({ name: "healthQuiz" })}
          className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-amber/10 px-4 py-3.5 text-left ring-1 ring-amber/30 hover:ring-amber/50"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber/15 text-lg">📋</span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-sm font-semibold text-cream">{h.quizCta}</span>
            <span className="block text-xs text-cream/60">{h.quizCtaSub}</span>
          </span>
          <span className="text-amber">›</span>
        </button>
      )}

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
        {health.systems.map((sys) => {
          const gated = !s.premium && sys.status !== "ok";
          return (
            <button
              key={sys.key}
              onClick={() => go(gated ? { name: "subscribe", ctx: "health" } : { name: "system", system: sys.key })}
              className="flex w-full items-center gap-3 rounded-xl bg-graphite-800 px-3.5 py-3 text-left ring-1 ring-white/5 hover:ring-white/15"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-graphite-700 text-cream/70">
                <Icon name={sys.key} className="h-5 w-5" />
              </span>
              <span className="flex-1 font-display text-[15px] text-cream">{h.systemLabels[sys.key]}</span>
              {s.premium && <span className={`text-xs font-semibold ${statusTone[sys.status]}`}>{systemPct(sys.status)}%</span>}
              <span className={`text-xs font-medium ${statusTone[sys.status]}`}>{h.statusLabels[sys.status]}</span>
              <span className="text-cream/40">{gated ? "🔒" : "›"}</span>
            </button>
          );
        })}
      </div>

      {/* Premium: cost projection + prioritized recommendations */}
      {s.premium ? (
        <PremiumHealthExtras vehicle={v} services={servicesFor(s, v.id)} />
      ) : (
        <div className="mt-4">
          <LockedCard ctx="health" title={c.premium.lockedSystem} />
        </div>
      )}

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

      {/* Premium: remaining life + suggested action order */}
      {s.premium ? (
        <>
          <SectionTitle>{c.premium.remainingLife}</SectionTitle>
          <Card>
            <div className="flex items-center justify-between">
              <span className="text-sm text-cream/80">{h.systemLabels[system]}</span>
              <span className={`font-display text-lg font-semibold ${statusTone[status?.status ?? "ok"]}`}>{REMAINING[status?.status ?? "ok"]}</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-graphite-700">
              <div className={`h-full rounded-full ${status?.status === "overdue" ? "bg-coral" : status?.status === "attention" ? "bg-amber" : "bg-teal"}`} style={{ width: REMAINING[status?.status ?? "ok"] }} />
            </div>
          </Card>
          <SectionTitle>{c.premium.actionOrder}</SectionTitle>
          <ol className="space-y-2">
            {[`${d.state}: ${h.systemLabels[system]}`, `${c.premium.shopSuggests}`, `${c.history.add}`].map((step, i) => (
              <li key={i} className="flex gap-2.5 rounded-xl bg-graphite-800 px-3.5 py-3 text-sm text-cream/85 ring-1 ring-white/5">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber/15 font-display text-xs font-semibold text-amber">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </>
      ) : (
        <div className="mt-4">
          <LockedCard ctx="systemDetail" title={c.premium.lockedSystem} />
        </div>
      )}

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

// Premium: 6-month cost projection + prioritized recommendations.
function PremiumHealthExtras({ vehicle, services }: { vehicle: import("@/lib/app/types").Vehicle; services: import("@/lib/app/types").ServiceRecord[] }) {
  const c = useContent();
  const h = c.health;
  const proj = costProjection(vehicle, services);
  const systems = computeHealth(vehicle, services).systems;
  const groups = { now: systems.filter((x) => systemPriority(x.status) === "now"), soon: systems.filter((x) => systemPriority(x.status) === "soon") };
  const label: Record<"now" | "soon", string> = { now: c.premium.priorityNow, soon: c.premium.prioritySoon };

  return (
    <div className="mt-4 space-y-4">
      {proj.high > 0 && (
        <Card className="ring-amber/25">
          <p className="text-sm text-cream/85">
            {c.premium.projection.replace("{low}", formatBRL(proj.low)).replace("{high}", formatBRL(proj.high))}
          </p>
        </Card>
      )}
      {(["now", "soon"] as const).map((k) =>
        groups[k].length ? (
          <div key={k}>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-cream/45">{label[k]}</p>
            <div className="space-y-1.5">
              {groups[k].map((sy) => (
                <div key={sy.key} className="flex items-center gap-2.5 rounded-xl bg-graphite-800 px-3.5 py-2.5 text-sm ring-1 ring-white/5">
                  <Icon name={sy.key} className={`h-4 w-4 ${k === "now" ? "text-coral" : "text-amber"}`} />
                  <span className="flex-1 text-cream/85">{h.systemLabels[sy.key]}</span>
                  <span className={`text-xs font-medium ${statusTone[sy.status]}`}>{systemPct(sy.status)}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}

// 2.3.C — Quiz de Saúde (questionário completo → fórmula VHS/VRI do spec)
export function HealthQuizScreen() {
  const c = useContent();
  const h = c.health;
  const { locale } = useI18n();
  const { s, updateVehicle } = usePrototype();
  const { back } = useNav();
  const v = activeVehicle(s);
  const questions = getHealthQuiz(locale);
  const [answers, setAnswers] = useState<Record<string, string>>(v?.quiz ?? {});

  if (!v) return <AppHeader title={h.quizTitle} />;

  const answered = questions.filter((q) => answers[q.id]).length;
  const allDone = answered === questions.length;

  const submit = () => {
    if (!allDone) return;
    updateVehicle(v.id, { quiz: answers });
    back();
  };

  return (
    <div>
      <AppHeader title={h.quizTitle} />
      <p className="text-sm text-cream/60">{h.quizIntro}</p>
      <p className="mt-1 text-xs text-cream/45">
        {h.quizProgress.replace("{a}", String(answered)).replace("{b}", String(questions.length))}
      </p>

      <div className="mt-4 space-y-5 pb-2">
        {questions.map((q, i) => (
          <div key={q.id}>
            <p className="mb-2 font-display text-[15px] text-cream">
              <span className="text-amber">{i + 1}.</span> {q.label}
            </p>
            <div className="space-y-1.5">
              {q.options.map((o) => {
                const sel = answers[q.id] === o.key;
                return (
                  <button
                    key={o.key}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: o.key }))}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm ring-1 transition-colors ${
                      sel ? "bg-amber/15 text-cream ring-amber" : "bg-graphite-800 text-cream/75 ring-white/5 hover:ring-white/15"
                    }`}
                  >
                    <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full ring-1 ${sel ? "bg-amber ring-amber" : "ring-white/25"}`}>
                      {sel && <span className="h-1.5 w-1.5 rounded-full bg-graphite" />}
                    </span>
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Button size="lg" className="mt-3 w-full" disabled={!allDone} onClick={submit}>
        {h.quizSubmit}
      </Button>
    </div>
  );
}
