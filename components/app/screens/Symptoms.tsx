"use client";

import { useState } from "react";
import { activeVehicle, servicesFor, usePrototype } from "@/lib/app/store";
import { symptomRecommended } from "@/lib/app/premium";
import { vehicleLabel } from "@/lib/app/content";
import type { SystemKey } from "@/lib/app/types";
import { useNav } from "@/lib/app/nav";
import { Button } from "@/components/ui/Button";
import { AppHeader, Card, inputCls, LockedCard, PremiumBadge, RecoBadge, SeverityDot, UpgradeBanner, useContent } from "../ui";

// Map a symptom category to a service type for pre-filling the history form.
const CATEGORY_TO_SERVICE: Record<SystemKey, string> = {
  brakes: "brakes",
  engine: "revision",
  suspension: "suspension",
  tires: "tires",
  electrical: "battery",
};

// 2.2.A — Lista de sintomas
export function SymptomsScreen() {
  const c = useContent();
  const ui = c.symptomsUi;
  const { s } = usePrototype();
  const { go } = useNav();
  const v = activeVehicle(s);
  const [q, setQ] = useState("");

  const services = v ? servicesFor(s, v.id) : [];
  const list = c.symptoms.filter((sx) => sx.label.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <AppHeader title={`${ui.title} ${v ? v.model : ""}?`} />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={ui.searchPh} className={inputCls} />

      {!s.premium && <UpgradeBanner ctx="symptomReco" text={ui.recoNudge} />}

      <div className="mt-3 space-y-2">
        {list.length === 0 ? (
          <p className="rounded-xl bg-graphite-800 px-3.5 py-3 text-sm text-cream/55 ring-1 ring-white/5">{ui.none}</p>
        ) : (
          list.map((sx) => {
            const reco = s.premium && v && symptomRecommended(sx.category, v, services);
            return (
              <button
                key={sx.id}
                onClick={() => go({ name: "symptom", id: sx.id })}
                className="flex w-full items-center gap-3 rounded-xl bg-graphite-800 px-3.5 py-3.5 text-left ring-1 ring-white/5 hover:ring-amber/30"
              >
                <SeverityDot level={sx.urgency.level} />
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[15px] text-cream">{sx.label}</span>
                  {reco && <span className="mt-1 block"><RecoBadge>{c.premium.recommended}</RecoBadge></span>}
                </span>
                <span className="text-cream/40">›</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// 2.2.B — Detalhe do sintoma
export function SymptomDetail({ id }: { id: string }) {
  const c = useContent();
  const ui = c.symptomsUi;
  const { s } = usePrototype();
  const { go, root } = useNav();
  const car = activeVehicle(s)?.model ?? "";
  const sx = c.symptoms.find((x) => x.id === id);
  if (!sx) return <AppHeader title="—" />;
  const pd = c.symptomPremium[sx.id];

  const shownCauses = s.premium ? sx.causes : sx.causes.slice(0, 2);
  const hiddenCauses = sx.causes.length - shownCauses.length;

  return (
    <div>
      <AppHeader title={sx.label} />

      <Section title={ui.causes}>
        <ul className="space-y-1.5">
          {shownCauses.map((cause) => (
            <li key={cause} className="flex gap-2 text-sm text-cream/80">
              <span className="text-amber">•</span>
              {cause}
            </li>
          ))}
        </ul>
        {!s.premium && hiddenCauses > 0 && (
          <div className="mt-2.5">
            <LockedCard ctx="symptomCauses" title={c.premium.lockedCauses.replace("{car}", car)} />
          </div>
        )}
      </Section>

      <Section title={ui.urgency}>
        <div className="flex items-center gap-2.5 rounded-xl bg-graphite-800 px-3.5 py-3 ring-1 ring-white/5">
          <SeverityDot level={sx.urgency.level} />
          <span className="text-sm text-cream/85">{sx.urgency.text}</span>
        </div>
      </Section>

      <Section title={ui.price}>
        <p className="font-display text-lg text-cream">{sx.price}</p>
        <p className="text-xs text-cream/45">{ui.priceNote}</p>
        {s.premium && pd && (
          <div className="mt-3">
            <p className="mb-1.5 flex items-center gap-2 text-xs uppercase tracking-wide text-cream/45">{ui.detailedPrice} <PremiumBadge /></p>
            <div className="space-y-1.5">
              {pd.priceDetail.map((row) => (
                <div key={row.label} className="flex items-center justify-between rounded-xl bg-graphite-800 px-3.5 py-2.5 text-sm ring-1 ring-white/5">
                  <span className="text-cream/80">{row.label}</span>
                  <span className="text-cream/60">{row.range}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 rounded-lg bg-teal/10 px-3 py-2 text-xs text-teal ring-1 ring-teal/15">{pd.regional}</p>
          </div>
        )}
      </Section>

      {s.premium && pd && (
        <>
          <Section title={c.premium.shopSuggests}>
            <ul className="space-y-1.5">
              {pd.shopSuggests.map((x) => (
                <li key={x} className="flex gap-2 text-sm text-cream/75"><span className="text-amber">⚠</span>{x}</li>
              ))}
            </ul>
          </Section>
          <Section title={c.premium.questionBefore}>
            <ul className="space-y-1.5">
              {pd.questionBefore.map((x) => (
                <li key={x} className="flex gap-2 rounded-lg bg-graphite-800 px-3 py-2 text-sm text-cream/85 ring-1 ring-white/5"><span className="text-teal">?</span>{x}</li>
              ))}
            </ul>
          </Section>
        </>
      )}

      <Section title={ui.observe}>
        <ul className="space-y-1.5">
          {sx.observe.map((o) => (
            <li key={o} className="flex gap-2 text-sm text-cream/80">
              <span className="text-teal">?</span>
              {o}
            </li>
          ))}
        </ul>
      </Section>

      <div className="mt-6 space-y-2.5">
        <Button size="lg" className="w-full" onClick={() => go({ name: "checklist", symptomId: sx.id })}>
          {ui.genChecklist}
        </Button>
        <button onClick={() => root({ name: "car" })} className="w-full py-2 text-center text-sm text-cream/55 hover:text-cream">
          {ui.knowIt}
        </button>
      </div>
    </div>
  );
}

// 2.2.C — Checklist para oficina
export function ChecklistScreen({ symptomId }: { symptomId: string }) {
  const c = useContent();
  const { s } = usePrototype();
  const { go } = useNav();
  const sx = c.symptoms.find((x) => x.id === symptomId);
  const [notes, setNotes] = useState("");
  const [total, setTotal] = useState("");
  const [shop, setShop] = useState("");
  if (!sx) return <AppHeader title="—" />;

  const items = s.premium ? sx.checklist : sx.checklist.slice(0, 3);
  const hidden = sx.checklist.length - items.length;

  const share = async () => {
    if (!s.premium) {
      go({ name: "subscribe", ctx: "checklist" });
      return;
    }
    const text = `${c.checklist.title} – ${sx.label}\n\n` + sx.checklist.map((i) => `☐ ${i}`).join("\n");
    try {
      if (navigator.share) await navigator.share({ title: sx.label, text });
      else await navigator.clipboard?.writeText(text);
    } catch {
      /* user cancelled */
    }
  };

  const saveToHistory = () => {
    go({
      name: "addService",
      preset: {
        type: CATEGORY_TO_SERVICE[sx.category] ?? "other",
        shop: shop.trim() || undefined,
        total: total ? parseInt(total, 10) : undefined,
        notes: [sx.label, notes.trim()].filter(Boolean).join(" — ") || undefined,
      },
    });
  };

  return (
    <div>
      <AppHeader title={`${c.checklist.title} – ${sx.label}`} />
      <p className="mb-3 text-sm text-cream/60">{c.checklist.intro}</p>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2.5 rounded-xl bg-graphite-800 px-3.5 py-3 ring-1 ring-white/5">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md ring-1 ring-white/20 text-cream/40">☐</span>
            <span className="text-sm text-cream/85">{item}</span>
          </div>
        ))}
      </div>
      {!s.premium && hidden > 0 && <div className="mt-2"><LockedCard ctx="checklist" title={c.checklist.lockedItems} /></div>}

      <div className="mt-4 space-y-3">
        <Field label={c.checklist.shop}>
          <input value={shop} onChange={(e) => setShop(e.target.value)} placeholder={c.checklist.shopPh} className={inputCls} />
        </Field>
        <Field label={c.checklist.total}>
          <input value={total} inputMode="numeric" onChange={(e) => setTotal(e.target.value.replace(/\D/g, ""))} placeholder={c.checklist.totalPh} className={inputCls} />
        </Field>
        <Field label={c.checklist.notes}>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder={c.checklist.notesPh} className={inputCls} />
        </Field>
      </div>

      <div className="mt-5 space-y-2.5">
        <Button size="lg" className="w-full" onClick={saveToHistory}>
          {c.checklist.saveToHistory}
        </Button>
        <Button variant="ghost" className="w-full" onClick={share}>
          {s.premium ? c.checklist.pdf : `🔒 ${c.checklist.pdf}`}
        </Button>
      </div>
      {!s.premium && <UpgradeBanner ctx="checklist" text={c.checklist.premiumNudge} />}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cream/45">{title}</p>
      {children}
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
