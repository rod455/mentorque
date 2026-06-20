"use client";

import { useEffect, useMemo, useState } from "react";
import { usePrototype } from "@/lib/app/store";
import { estimateFipe, formatBRL, vehicleLabel } from "@/lib/app/content";
import { fipeGetBrands, fipeGetModels, fipeGetPrices, fipeMatch, type Brand, type Model, type PriceEntry } from "@/lib/app/fipeClient";
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

function installment(principal: number, n = 48, r = 0.018): number {
  if (principal <= 0) return 0;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export function SwapFlow({ onClose }: { onClose: () => void }) {
  const c = useContent();
  const w = c.swap;
  const { s } = usePrototype();
  const type = s.vehicle?.type ?? "car";

  const steps = ["target", "current", "planning", "result"] as const;
  const [i, setI] = useState(0);
  const step = steps[i];
  const next = () => setI((v) => Math.min(v + 1, steps.length - 1));
  const back = () => (i === 0 ? onClose() : setI((v) => v - 1));

  // ---- Target car: FIPE-driven, with a local fallback ----------------------
  const [fipeMode, setFipeMode] = useState(true);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandSel, setBrandSel] = useState<Brand | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [modelSel, setModelSel] = useState<Model | null>(null);
  const [prices, setPrices] = useState<PriceEntry[]>([]);
  const [priceSel, setPriceSel] = useState<PriceEntry | null>(null);
  const [loading, setLoading] = useState(false);

  // Local fallback selection.
  const [tMake, setTMake] = useState<string | null>(null);
  const [tModel, setTModel] = useState<string | null>(null);
  const [tYear, setTYear] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fipeGetBrands(type)
      .then((b) => alive && (setBrands(b), setFipeMode(true)))
      .catch(() => alive && setFipeMode(false))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [type]);

  const pickBrand = (b: Brand) => {
    setBrandSel(b);
    setModelSel(null);
    setPrices([]);
    setPriceSel(null);
    setLoading(true);
    fipeGetModels(type, b.valor)
      .then((m) => setModels(m))
      .catch(() => setFipeMode(false))
      .finally(() => setLoading(false));
  };
  const pickModel = (m: Model) => {
    setModelSel(m);
    setPriceSel(null);
    setLoading(true);
    fipeGetPrices(type, m.valor)
      .then((p) => setPrices(p))
      .catch(() => setFipeMode(false))
      .finally(() => setLoading(false));
  };

  // Resolved target value.
  const target = useMemo(() => {
    if (fipeMode && priceSel && brandSel && modelSel) {
      return { value: priceSel.value, year: priceSel.year, label: `${brandSel.nome} ${modelSel.modelo} ${priceSel.year}`, source: "fipe" as const };
    }
    if (!fipeMode && tModel && tYear) {
      return { value: estimateFipe(tModel, tYear), year: tYear, label: `${tMake} ${tModel} ${tYear}`, source: "estimate" as const };
    }
    return null;
  }, [fipeMode, priceSel, brandSel, modelSel, tMake, tModel, tYear]);

  // ---- Current car details + price -----------------------------------------
  const [odo, setOdo] = useState<string>(s.odometerKm ? String(s.odometerKm) : "");
  const [cond, setCond] = useState<Cond>("good");
  const [curBase, setCurBase] = useState<{ value: number; source: "fipe" | "estimate" } | null>(null);

  const odoNum = parseInt(odo, 10) || 0;

  // Resolve the current car value once we reach the result (try FIPE, fall back).
  useEffect(() => {
    if (step !== "result" || curBase || !s.vehicle) return;
    let alive = true;
    const fallback = () => alive && setCurBase({ value: estimateFipe(s.vehicle!.model, s.vehicle!.year), source: "estimate" });
    fipeMatch(type, s.vehicle.make, s.vehicle.model, s.vehicle.year)
      .then((r) => alive && setCurBase({ value: r.value, source: "fipe" }))
      .catch(fallback);
  }, [step, curBase, s.vehicle, type]);

  const [down, setDown] = useState<string>("");
  const [monthly, setMonthly] = useState<string>("");
  const [months, setMonths] = useState<number>(12);
  const downNum = parseInt(down, 10) || 0;
  const monthlyNum = parseInt(monthly, 10) || 0;

  const plan = useMemo(() => {
    if (!curBase || !target) return null;
    const mileFactor = odoNum > 100000 ? 0.92 : odoNum > 60000 ? 0.97 : 1;
    const currentFipe = Math.round((curBase.value * COND_FACTOR[cond] * mileFactor) / 500) * 500;
    const targetFipe = target.value;
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
        finance = Math.max(0, remaining - monthlyNum * months);
        financePay = installment(finance);
        line = w.coveredByFinance.replace("{x}", formatBRL(finance)).replace("{p}", formatBRL(financePay));
      }
    }
    return { currentFipe, targetFipe, diff: targetFipe - currentFipe, line, saveNeeded, finance, financePay, currentSource: curBase.source };
  }, [curBase, target, odoNum, cond, downNum, monthlyNum, months, w]);

  const canNext =
    step === "target"
      ? !!target
      : step === "current"
      ? odoNum > 0
      : step === "planning"
      ? monthlyNum > 0
      : true;

  return (
    <div className="fixed inset-0 z-40 mx-auto flex w-full max-w-[440px] flex-col bg-graphite">
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
          <span className="text-lg">🔁</span>
          <span className="font-display text-xs uppercase tracking-[0.15em]">{w.flowTitle}</span>
        </div>

        {step === "target" && (
          <Step title={w.targetTitle} hint={w.targetHint}>
            {fipeMode ? (
              <>
                {!brandSel ? (
                  <SearchList items={brands} getLabel={(b) => b.nome} placeholder={w.searchBrand} loading={loading} loadingLabel={w.loadingFipe} emptyLabel={w.noResults} onPick={pickBrand} />
                ) : !modelSel ? (
                  <Picked label={brandSel.nome} onClear={() => setBrandSel(null)}>
                    <SearchList items={models} getLabel={(m) => m.modelo} placeholder={w.searchModel} loading={loading} loadingLabel={w.loadingFipe} emptyLabel={w.noResults} onPick={pickModel} />
                  </Picked>
                ) : (
                  <Picked label={`${brandSel.nome} · ${modelSel.modelo}`} onClear={() => setModelSel(null)}>
                    <p className="mb-1.5 text-xs uppercase tracking-wide text-cream/45">{w.pickYearVersion}</p>
                    {loading ? (
                      <p className="text-sm text-cream/55">{w.loadingFipe}</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {prices.map((p) => (
                          <Chip key={p.codigoFipe + p.label} active={priceSel === p} onClick={() => setPriceSel(p)}>
                            {p.label} · {formatBRL(p.value)}
                          </Chip>
                        ))}
                      </div>
                    )}
                  </Picked>
                )}
                <p className="text-[11px] text-cream/40">{w.fipeSource}</p>
              </>
            ) : (
              <>
                <p className="rounded-lg bg-amber/10 px-3 py-2 text-xs text-amber">{w.fipeOffline}</p>
                <Picker label={c.onboarding.make} options={c.makes[type]} value={tMake} onPick={(v) => { setTMake(v); setTModel(null); }} />
                {tMake && <Picker label={c.onboarding.model} options={c.modelsByMake[tMake] ?? []} value={tModel} onPick={setTModel} />}
                {tModel && <Picker label={c.onboarding.year} options={c.years.slice(0, 12)} value={tYear} onPick={setTYear} />}
              </>
            )}
          </Step>
        )}

        {step === "current" && (
          <Step title={w.currentTitle} hint={w.currentHint}>
            <p className="rounded-xl bg-graphite-800 px-3.5 py-3 text-sm text-cream/70 ring-1 ring-white/5">{vehicleLabel(s.vehicle, "—")}</p>
            <label className="block">
              <span className="mb-1 block text-xs text-cream/55">{w.odometer}</span>
              <input type="number" inputMode="numeric" value={odo} placeholder={w.odometerPh} onChange={(e) => { setOdo(e.target.value); setCurBase(null); }} className="w-full rounded-xl bg-graphite-800 px-3.5 py-3 text-cream ring-1 ring-white/10 outline-none placeholder:text-cream/40 focus:ring-amber" />
            </label>
            <div>
              <span className="mb-1.5 block text-xs text-cream/55">{w.condition}</span>
              <div className="flex gap-2">
                {([["great", w.condGreat], ["good", w.condGood], ["fair", w.condFair]] as [Cond, string][]).map(([k, label]) => (
                  <Chip key={k} active={cond === k} onClick={() => { setCond(k); setCurBase(null); }}>
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

        {step === "result" && (
          <Step title={w.result}>
            {!plan ? (
              <p className="text-sm text-cream/55">{w.loadingFipe}</p>
            ) : (
              <>
                <Card>
                  <Row label={w.currentValue} value={formatBRL(plan.currentFipe)} tag={plan.currentSource === "fipe" ? w.fipeTag : w.estimatedTag} />
                  <Row label={`${w.targetValue} · ${target?.label ?? ""}`} value={formatBRL(plan.targetFipe)} tag={target?.source === "fipe" ? w.fipeTag : w.estimatedTag} />
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
              </>
            )}
          </Step>
        )}
      </div>

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

// Shows a chosen value with a "change" affordance, wrapping the next sub-step.
function Picked({ label, onClear, children }: { label: string; onClear: () => void; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <button onClick={onClear} className="flex w-full items-center justify-between rounded-xl bg-graphite-800 px-3.5 py-2.5 text-left ring-1 ring-amber/30">
        <span className="font-display text-[15px] text-cream">{label}</span>
        <span className="text-xs text-amber">✕</span>
      </button>
      {children}
    </div>
  );
}

function SearchList<T>({
  items,
  getLabel,
  placeholder,
  onPick,
  loading,
  loadingLabel,
  emptyLabel,
}: {
  items: T[];
  getLabel: (it: T) => string;
  placeholder: string;
  onPick: (it: T) => void;
  loading?: boolean;
  loadingLabel: string;
  emptyLabel: string;
}) {
  const [q, setQ] = useState("");
  const filtered = items.filter((it) => getLabel(it).toLowerCase().includes(q.toLowerCase())).slice(0, 60);
  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl bg-graphite-800 px-3.5 py-3 text-cream ring-1 ring-white/10 outline-none placeholder:text-cream/40 focus:ring-amber"
      />
      <div className="mt-2 max-h-60 space-y-1 overflow-y-auto">
        {loading && items.length === 0 ? (
          <p className="px-1 py-2 text-sm text-cream/55">{loadingLabel}</p>
        ) : filtered.length === 0 ? (
          <p className="px-1 py-2 text-sm text-cream/55">{emptyLabel}</p>
        ) : (
          filtered.map((it) => (
            <button
              key={getLabel(it)}
              onClick={() => onPick(it)}
              className="block w-full rounded-lg bg-graphite-800 px-3.5 py-2.5 text-left font-display text-[15px] text-cream ring-1 ring-white/5 hover:ring-amber/30"
            >
              {getLabel(it)}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function Picker<T extends string | number>({ label, options, value, onPick }: { label: string; options: T[]; value: T | null; onPick: (v: T) => void }) {
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

function Row({ label, value, strong, tag }: { label: string; value: string; strong?: boolean; tag?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="min-w-0 flex-1 truncate text-sm text-cream/60">{label}</span>
      <span className="flex items-center gap-2">
        {tag && <span className="rounded bg-white/8 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-cream/45">{tag}</span>}
        <span className={`font-display ${strong ? "text-lg font-semibold text-amber" : "text-[15px] text-cream"}`}>{value}</span>
      </span>
    </div>
  );
}
