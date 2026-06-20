"use client";

import { useMemo, useState } from "react";
import { usePrototype } from "@/lib/app/store";
import { estimateFipe, formatBRL, vehicleLabel } from "@/lib/app/content";
import { Button } from "@/components/ui/Button";
import { Card, Chip, Icon, ProgressDots, useContent } from "./ui";
import { IconArrow, IconClose } from "@/lib/icons";

type Cond = "great" | "good" | "fair";
const COND_FACTOR: Record<Cond, number> = { great: 1, good: 0.93, fair: 0.85 };
const TF = [
  { months: 6, key: "tf6" },
  { months: 12, key: "tf12" },
  { months: 24, key: "tf24" },
  { months: 36, key: "tf36" },
] as const;

// Estimated installment for a financed amount (48 months at ~1.8%/mo).
function installment(principal: number, n = 48, r = 0.018): number {
  if (principal <= 0) return 0;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export function SwapFlow({ onClose }: { onClose: () => void }) {
  const c = useContent();
  const w = c.swap;
  const { s } = usePrototype();

  const steps = ["target", "current", "planning", "result"] as const;
  const [i, setI] = useState(0);
  const step = steps[i];
  const next = () => setI((v) => Math.min(v + 1, steps.length - 1));
  const back = () => (i === 0 ? onClose() : setI((v) => v - 1));

  // Target car (same type as the current vehicle).
  const type = s.vehicle?.type ?? "car";
  const [tMake, setTMake] = useState<string | null>(null);
  const [tModel, setTModel] = useState<string | null>(null);
  const [tYear, setTYear] = useState<number | null>(null);

  // Current car details.
  const [odo, setOdo] = useState<string>(s.odometerKm ? String(s.odometerKm) : "");
  const [cond, setCond] = useState<Cond>("good");

  // Plan.
  const [down, setDown] = useState<string>("");
  const [monthly, setMonthly] = useState<string>("");
  const [months, setMonths] = useState<number>(12);

  const odoNum = parseInt(odo, 10) || 0;
  const downNum = parseInt(down, 10) || 0;
  const monthlyNum = parseInt(monthly, 10) || 0;

  const plan = useMemo(() => {
    if (!s.vehicle || !tModel || !tYear) return null;
    const mileFactor = odoNum > 100000 ? 0.92 : odoNum > 60000 ? 0.97 : 1;
    const currentFipe = estimateFipe(s.vehicle.model, s.vehicle.year, COND_FACTOR[cond] * mileFactor);
    const targetFipe = estimateFipe(tModel, tYear, 1);
    const covered = currentFipe + downNum;
    const remaining = targetFipe - covered;
    const tfLabel = (w as Record<string, string>)[TF.find((t) => t.months === months)!.key];

    let line = "";
    let saveNeeded: number | null = null;
    let finance: number | null = null;
    let financePay = 0;
    if (remaining <= 0) {
      line = w.coveredAlready.replace("{x}", formatBRL(-remaining));
    } else {
      const perMonthNeeded = remaining / months;
      if (perMonthNeeded <= monthlyNum) {
        saveNeeded = perMonthNeeded;
        line = w.coveredBySaving.replace("{m}", formatBRL(perMonthNeeded)).replace("{n}", tfLabel);
      } else {
        const canSave = monthlyNum * months;
        finance = Math.max(0, remaining - canSave);
        financePay = installment(finance);
        line = w.coveredByFinance.replace("{x}", formatBRL(finance)).replace("{p}", formatBRL(financePay));
      }
    }
    return { currentFipe, targetFipe, diff: targetFipe - currentFipe, line, saveNeeded, finance, financePay };
  }, [s.vehicle, tModel, tYear, odoNum, cond, downNum, monthlyNum, months, w]);

  const canNext =
    step === "target"
      ? !!(tMake && tModel && tYear)
      : step === "current"
      ? odoNum > 0
      : step === "planning"
      ? monthlyNum > 0
      : true;

  return (
    <div className="fixed inset-0 z-40 mx-auto flex w-full max-w-[440px] flex-col bg-graphite">
      {/* header */}
      <div className="flex items-center justify-between px-5 pb-2 pt-5">
        <button onClick={back} className="grid h-9 w-9 place-items-center rounded-full bg-graphite-700 text-cream/70 hover:text-cream" aria-label={w.back}>
          <IconArrow className="h-4 w-4 rotate-180" />
        </button>
        <ProgressDots total={steps.length} index={i} />
        <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-graphite-700 text-cream/70 hover:text-cream" aria-label="close">
          <IconClose className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-6">
        <div className="mb-1 flex items-center gap-2 text-coral">
          <Icon name="swap" className="hidden" />
          <span className="text-lg">🔁</span>
          <span className="font-display text-xs uppercase tracking-[0.15em]">{w.flowTitle}</span>
        </div>

        {step === "target" && (
          <Step title={w.targetTitle} hint={w.targetHint}>
            <Picker label={c.onboarding.make} options={c.makes[type]} value={tMake} onPick={(v) => { setTMake(v); setTModel(null); }} />
            {tMake && <Picker label={c.onboarding.model} options={c.modelsByMake[tMake] ?? []} value={tModel} onPick={setTModel} />}
            {tModel && <Picker label={c.onboarding.year} options={c.years.slice(0, 12)} value={tYear} onPick={setTYear} />}
          </Step>
        )}

        {step === "current" && (
          <Step title={w.currentTitle} hint={w.currentHint}>
            <p className="rounded-xl bg-graphite-800 px-3.5 py-3 text-sm text-cream/70 ring-1 ring-white/5">
              {vehicleLabel(s.vehicle, "—")}
            </p>
            <label className="block">
              <span className="mb-1 block text-xs text-cream/55">{w.odometer}</span>
              <input
                type="number"
                inputMode="numeric"
                value={odo}
                placeholder={w.odometerPh}
                onChange={(e) => setOdo(e.target.value)}
                className="w-full rounded-xl bg-graphite-800 px-3.5 py-3 text-cream ring-1 ring-white/10 outline-none placeholder:text-cream/40 focus:ring-amber"
              />
            </label>
            <div>
              <span className="mb-1.5 block text-xs text-cream/55">{w.condition}</span>
              <div className="flex gap-2">
                {([["great", w.condGreat], ["good", w.condGood], ["fair", w.condFair]] as [Cond, string][]).map(([k, label]) => (
                  <Chip key={k} active={cond === k} onClick={() => setCond(k)}>
                    {label}
                  </Chip>
                ))}
              </div>
            </div>
          </Step>
        )}

        {step === "planning" && (
          <Step title={w.planTitle} hint={w.planHint}>
            <label className="block">
              <span className="mb-1 block text-xs text-cream/55">{w.down}</span>
              <input type="number" inputMode="numeric" value={down} placeholder={w.downPh} onChange={(e) => setDown(e.target.value)} className="w-full rounded-xl bg-graphite-800 px-3.5 py-3 text-cream ring-1 ring-white/10 outline-none placeholder:text-cream/40 focus:ring-amber" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-cream/55">{w.monthly}</span>
              <input type="number" inputMode="numeric" value={monthly} placeholder={w.monthlyPh} onChange={(e) => setMonthly(e.target.value)} className="w-full rounded-xl bg-graphite-800 px-3.5 py-3 text-cream ring-1 ring-white/10 outline-none placeholder:text-cream/40 focus:ring-amber" />
            </label>
            <div>
              <span className="mb-1.5 block text-xs text-cream/55">{w.timeframe}</span>
              <div className="flex flex-wrap gap-2">
                {TF.map((t) => (
                  <Chip key={t.months} active={months === t.months} onClick={() => setMonths(t.months)}>
                    {(w as Record<string, string>)[t.key]}
                  </Chip>
                ))}
              </div>
            </div>
          </Step>
        )}

        {step === "result" && plan && (
          <Step title={w.result}>
            <Card>
              <Row label={w.currentValue} value={formatBRL(plan.currentFipe)} />
              <Row label={`${w.targetValue} · ${tMake} ${tModel} ${tYear}`} value={formatBRL(plan.targetFipe)} />
              <div className="my-2 h-px bg-white/10" />
              <Row label={w.difference} value={formatBRL(plan.diff)} strong />
            </Card>

            <Card className="ring-amber/25">
              <p className="text-[15px] leading-relaxed text-cream">{plan.line}</p>
              {plan.saveNeeded != null && (
                <div className="mt-3 flex items-center justify-between rounded-lg bg-teal/12 px-3 py-2 text-sm text-teal">
                  <span>{w.saveNeeded}</span>
                  <span className="font-display">{formatBRL(plan.saveNeeded)} / {w.perMonth}</span>
                </div>
              )}
              {plan.finance != null && plan.finance > 0 && (
                <div className="mt-3 flex items-center justify-between rounded-lg bg-coral/12 px-3 py-2 text-sm text-coral">
                  <span>{w.financeEst}</span>
                  <span className="font-display">{formatBRL(plan.financePay)} / {w.perMonth}</span>
                </div>
              )}
            </Card>

            <p className="mt-3 rounded-lg bg-graphite-800 px-3.5 py-3 text-xs text-cream/55 ring-1 ring-white/5">{w.disclaimer}</p>
          </Step>
        )}
      </div>

      {/* footer */}
      <div className="px-5 pb-7">
        {step === "result" ? (
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setI(0)}>
              {w.redo}
            </Button>
            <Button className="flex-1" onClick={onClose}>
              {w.finish}
            </Button>
          </div>
        ) : (
          <Button size="lg" className="w-full" disabled={!canNext} onClick={next}>
            {w.next}
          </Button>
        )}
      </div>
    </div>
  );
}

function Step({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="mt-1 font-display text-2xl font-bold text-cream">{title}</h1>
      {hint && <p className="mb-4 mt-1 text-sm text-cream/60">{hint}</p>}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Picker<T extends string | number>({
  label,
  options,
  value,
  onPick,
}: {
  label: string;
  options: T[];
  value: T | null;
  onPick: (v: T) => void;
}) {
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

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="text-sm text-cream/60">{label}</span>
      <span className={`font-display ${strong ? "text-lg font-semibold text-amber" : "text-[15px] text-cream"}`}>{value}</span>
    </div>
  );
}
