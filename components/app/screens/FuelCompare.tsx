"use client";

import { useEffect, useState } from "react";
import { activeVehicle, usePrototype } from "@/lib/app/store";
import { compareFuel, engineLooksTurbo } from "@/lib/app/fuelCompare";
import { carName } from "@/lib/app/content";
import { AppHeader, Card, inputCls, useContent } from "../ui";
import { Button } from "@/components/ui/Button";

// Etanol × Gasolina — decide qual combustível compensa no posto.
// Cenário 1: consumos conhecidos → razão real. Cenário 2: estima pelo motor
// (PCI + fator K). As respostas ficam salvas no veículo (fuelPrefs).
const num = (s: string): number | undefined => {
  const n = parseFloat(s.replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};
const fmt = (n: number, d = 2) => n.toFixed(d).replace(".", ",");

export function FuelCompareScreen() {
  const c = useContent();
  const t = c.fuelCompare;
  const { s, updateVehicle, markLessonSeen } = usePrototype();
  const v = activeVehicle(s);
  const done = (s.seenLessons ?? []).includes("fuel-compare");

  const p = v?.fuelPrefs;
  const [gasPrice, setGasPrice] = useState(p?.gasPrice != null ? fmt(p.gasPrice) : "");
  const [ethPrice, setEthPrice] = useState(p?.ethPrice != null ? fmt(p.ethPrice) : "");
  const [gasKmL, setGasKmL] = useState(p?.gasKmL != null ? fmt(p.gasKmL, 1) : "");
  const [ethKmL, setEthKmL] = useState(p?.ethKmL != null ? fmt(p.ethKmL, 1) : "");
  const [turbo, setTurbo] = useState<boolean>(p?.turbo ?? engineLooksTurbo(v?.engine));
  const [highComp, setHighComp] = useState<boolean>(p?.highComp ?? false);

  const input = {
    gasPrice: num(gasPrice) ?? 0,
    ethPrice: num(ethPrice) ?? 0,
    gasKmL: num(gasKmL),
    ethKmL: num(ethKmL),
    turbo,
    highComp,
  };
  const verdict = compareFuel(input);
  const bothKnown = !!(input.gasKmL && input.ethKmL);

  // Persiste no veículo (sincroniza entre aparelhos junto com a garagem).
  useEffect(() => {
    if (!v) return;
    const timer = setTimeout(() => {
      updateVehicle(v.id, {
        fuelPrefs: {
          gasPrice: num(gasPrice),
          ethPrice: num(ethPrice),
          gasKmL: num(gasKmL),
          ethKmL: num(ethKmL),
          turbo,
          highComp,
        },
      });
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gasPrice, ethPrice, gasKmL, ethKmL, turbo, highComp]);

  const chip = (sel: boolean) =>
    `flex-1 rounded-xl px-3 py-2.5 text-sm ring-1 transition-colors ${
      sel ? "bg-amber/15 font-semibold text-cream ring-amber" : "bg-graphite-800 text-cream/70 ring-white/5 hover:ring-white/15"
    }`;

  const savingsPct =
    verdict?.gasCostKm && verdict?.ethCostKm
      ? Math.round((1 - Math.min(verdict.gasCostKm, verdict.ethCostKm) / Math.max(verdict.gasCostKm, verdict.ethCostKm)) * 100)
      : null;

  return (
    <div>
      <AppHeader title={t.title} />

      <p className="text-sm leading-relaxed text-cream/70">{t.intro}</p>
      <p className="mt-2 text-xs text-cream/50">
        {v ? t.forCar.replace("{car}", carName(v)) : t.noCar}
      </p>

      {/* Preços do posto */}
      <p className="mb-2 mt-5 font-serif text-lg font-bold text-cream">{t.pricesTitle}</p>
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-xs text-cream/55">{t.gasPrice}</span>
          <input value={gasPrice} inputMode="decimal" onChange={(e) => setGasPrice(e.target.value)} placeholder={t.pricePh} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-cream/55">{t.ethPrice}</span>
          <input value={ethPrice} inputMode="decimal" onChange={(e) => setEthPrice(e.target.value)} placeholder={t.pricePh} className={inputCls} />
        </label>
      </div>

      {/* Consumo (opcional) */}
      <p className="mb-1 mt-5 font-serif text-lg font-bold text-cream">{t.consumptionTitle}</p>
      <p className="mb-2 text-xs leading-relaxed text-cream/50">{t.consumptionSub}</p>
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-xs text-cream/55">{t.gasKmL}</span>
          <input value={gasKmL} inputMode="decimal" onChange={(e) => setGasKmL(e.target.value)} placeholder={t.kmlPh} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-cream/55">{t.ethKmL}</span>
          <input value={ethKmL} inputMode="decimal" onChange={(e) => setEthKmL(e.target.value)} placeholder={t.kmlPh} className={inputCls} />
        </label>
      </div>

      {/* Motor — só importa quando falta algum consumo (Cenário 2) */}
      {!bothKnown && (
        <>
          <p className="mb-1 mt-5 font-serif text-lg font-bold text-cream">{t.engineTitle}</p>
          <p className="mb-2 text-xs leading-relaxed text-cream/50">{t.engineSub}</p>
          <p className="mb-1.5 text-sm text-cream/80">{t.turboQ}</p>
          <div className="flex gap-2">
            <button className={chip(!turbo)} onClick={() => setTurbo(false)}>{t.turboNo}</button>
            <button className={chip(turbo)} onClick={() => setTurbo(true)}>{t.turboYes}</button>
          </div>
          <p className="mb-1.5 mt-3 text-sm text-cream/80">{t.compQ}</p>
          <div className="flex gap-2">
            <button className={chip(!highComp)} onClick={() => setHighComp(false)}>{t.compNo}</button>
            <button className={chip(highComp)} onClick={() => setHighComp(true)}>{t.compYes}</button>
          </div>
          <p className="mt-1.5 text-xs text-cream/45">{t.compHint.replace("{car}", v ? carName(v) : "do carro")}</p>
        </>
      )}

      {/* Veredito */}
      {verdict && (
        <Card className={`mt-5 ${verdict.ethanolWins ? "ring-teal/40" : "ring-amber/40"}`}>
          <p className={`font-display text-xl font-bold ${verdict.ethanolWins ? "text-teal" : "text-amber"}`}>
            {verdict.ethanolWins ? `🌱 ${t.resultEth}` : `⛽ ${t.resultGas}`}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-cream/80">
            {t.ratioLine.replace("{ratio}", String(Math.round(verdict.priceRatio * 100)))}{" "}
            {t.thresholdLine.replace("{threshold}", String(Math.round(verdict.threshold * 100)))}
          </p>
          {verdict.gasCostKm != null && verdict.ethCostKm != null && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-graphite-900/60 px-3 py-2.5 ring-1 ring-white/5">
                <p className="text-[11px] text-cream/45">{t.costKm} — {t.costKmGas}</p>
                <p className="font-display text-base font-bold text-cream">R$ {fmt(verdict.gasCostKm)}/km</p>
              </div>
              <div className="rounded-xl bg-graphite-900/60 px-3 py-2.5 ring-1 ring-white/5">
                <p className="text-[11px] text-cream/45">{t.costKm} — {t.costKmEth}</p>
                <p className="font-display text-base font-bold text-cream">R$ {fmt(verdict.ethCostKm)}/km</p>
              </div>
            </div>
          )}
          {savingsPct != null && savingsPct > 0 && (
            <p className="mt-2 text-sm font-medium text-teal">{t.savings.replace("{pct}", String(savingsPct))}</p>
          )}
          {verdict.estimated && verdict.ethKmL != null && !input.ethKmL && (
            <p className="mt-2.5 text-xs leading-relaxed text-cream/50">
              {t.estimatedNote.replace("{kml}", fmt(verdict.ethKmL, 1))}
            </p>
          )}
        </Card>
      )}

      <p className="mt-4 text-xs leading-relaxed text-cream/45">{t.redo}</p>

      {/* Concluído — mesma mecânica das outras aulas */}
      <Button variant="secondary" className="mt-5 w-full" onClick={() => markLessonSeen("fuel-compare")}>
        {done ? `✓ ${c.learn.completed}` : c.learn.complete}
      </Button>
    </div>
  );
}
