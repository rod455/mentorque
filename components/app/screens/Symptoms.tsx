"use client";

import { useState } from "react";
import { activeVehicle, servicesFor, usePrototype } from "@/lib/app/store";
import { symptomRecommended } from "@/lib/app/premium";
import { carName, vehicleLabel } from "@/lib/app/content";
import type { SystemKey } from "@/lib/app/types";
import { useNav } from "@/lib/app/nav";
import { Button } from "@/components/ui/Button";
import { AppHeader, Card, Icon, inputCls, LockedCard, PremiumBadge, RecoBadge, SeverityDot, UpgradeBanner, useContent } from "../ui";

// Map a symptom category to a service type for pre-filling the history form.
const CATEGORY_TO_SERVICE: Record<SystemKey, string> = {
  brakes: "brakes",
  engine: "revision",
  suspension: "suspension",
  tires: "tires",
  electrical: "battery",
};

// A tappable symptom row (reused in the hub search + the by-system list).
function SymptomRow({ sx, reco }: { sx: ReturnType<typeof useContent>["symptoms"][number]; reco?: boolean }) {
  const c = useContent();
  const { go } = useNav();
  return (
    <button
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
}

// "Talk to Biela" fallback row — seeds the chat with the problem/query.
function AskBielaRow({ seed, label }: { seed: string; label: string }) {
  const { go } = useNav();
  return (
    <button
      onClick={() => go({ name: "biela", seed })}
      className="flex w-full items-center gap-3 rounded-2xl bg-gradient-to-br from-amber/15 to-amber/5 px-3.5 py-3.5 text-left ring-1 ring-amber/25 hover:ring-amber/45"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-graphite-900/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/biela/biela-idle.png" alt="" className="h-full w-full object-contain" />
      </span>
      <span className="min-w-0 flex-1 text-sm text-cream/90">{label}</span>
      <span className="shrink-0 text-amber">›</span>
    </button>
  );
}

// 2.2.A — Problemas: hub (busca + subsistemas + comuns + Biela)
export function SymptomsScreen() {
  const c = useContent();
  const ui = c.symptomsUi;
  const { s } = usePrototype();
  const { go } = useNav();
  const v = activeVehicle(s);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const query = q.trim().toLowerCase();
  const matches = query ? c.symptoms.filter((sx) => sx.label.toLowerCase().includes(query)) : [];

  return (
    <div>
      <AppHeader title={v ? ui.titleCar.replace("{car}", carName(v)) : c.nav.problems} />

      {/* Cena da Biela na garagem (banner) */}
      <div className="-mt-1 mb-4 overflow-hidden rounded-2xl">
        <img
          src="/biela/cena-biela-garagem.webp"
          alt="Biela na garagem com o carro"
          className="aspect-[3/2] w-full object-cover"
          draggable={false}
          style={{
            objectPosition: "center 42%",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 14%, #000 82%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, transparent 0%, #000 14%, #000 82%, transparent 100%)",
          }}
        />
      </div>

      {/* Busca com autocomplete */}
      <div className="relative">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={ui.searchPh}
          autoComplete="off"
          className={inputCls}
        />
        {open && query.length > 0 && (
          <div className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-xl bg-graphite-700 p-1 shadow-card ring-1 ring-white/10">
            {matches.map((sx) => (
              <button
                key={sx.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go({ name: "symptom", id: sx.id })}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left hover:bg-white/5"
              >
                <SeverityDot level={sx.urgency.level} />
                <span className="text-sm text-cream">{sx.label}</span>
              </button>
            ))}
            {/* Sempre oferece o Biela como saída */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => go({ name: "biela", seed: (v ? `Meu ${carName(v)} ` : "Meu carro ") + `está com: ${q}. O que pode ser e o que devo fazer?` })}
              className="mt-1 flex w-full items-center gap-2.5 rounded-lg bg-amber/10 px-3 py-2.5 text-left ring-1 ring-amber/20 hover:ring-amber/40"
            >
              <span className="text-amber">🐻</span>
              <span className="text-sm text-cream/90">{ui.askBielaQ.replace("{q}", q)}</span>
            </button>
          </div>
        )}
      </div>

      {!s.premium && <UpgradeBanner ctx="symptomReco" text={ui.recoNudge} />}

      {/* Grade de subsistemas + Equipamentos úteis */}
      <p className="mb-2.5 mt-4 text-xs font-semibold uppercase tracking-wide text-cream/45">{ui.browseBySystem}</p>
      <div className="grid grid-cols-2 gap-3">
        {c.problemSystems.map((sysm) => (
          <button
            key={sysm.key}
            onClick={() => go({ name: "systemProblems", system: sysm.key })}
            className="flex flex-col gap-2 rounded-3xl bg-graphite-800 p-4 text-left ring-1 ring-white/5 transition-all hover:ring-white/15 active:scale-[0.98]"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-coral/12 text-coral">
              <Icon name={sysm.icon} className="h-6 w-6" />
            </span>
            <span>
              <span className="block font-display text-[15px] font-semibold leading-tight text-cream">{sysm.label}</span>
              <span className="mt-1 block text-xs leading-snug text-cream/50">{sysm.sub}</span>
            </span>
          </button>
        ))}
        {/* Equipamentos úteis — ao lado dos subsistemas */}
        <button
          onClick={() => go({ name: "equipment" })}
          className="flex flex-col gap-2 rounded-3xl bg-graphite-800 p-4 text-left ring-1 ring-amber/20 transition-all hover:ring-amber/40 active:scale-[0.98]"
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber/15 text-amber">
            <Icon name="tools" className="h-6 w-6" />
          </span>
          <span>
            <span className="block font-display text-[15px] font-semibold leading-tight text-cream">{c.equipmentUi.cardTitle}</span>
            <span className="mt-1 block text-xs leading-snug text-cream/50">{c.equipmentUi.cardSub}</span>
          </span>
        </button>
      </div>

      <div className="mt-5">
        <AskBielaRow seed={(v ? `Meu ${carName(v)} ` : "Meu carro ") + "está com um problema que não achei na lista. Pode me ajudar a diagnosticar?"} label={ui.talkToBiela} />
      </div>

      {/* Problemas comuns — cards quadrados (mesmo formato do "Para você") */}
      <CommonProblems />
    </div>
  );
}

// Ícone ilustrativo por sistema (placeholder do card).
const SYSTEM_ICON: Record<SystemKey, string> = {
  brakes: "brakes",
  engine: "engine",
  suspension: "suspension",
  tires: "tires",
  electrical: "electrical",
};

// Sistemas tipicamente mais reclamados por marca (heurística leve, só para
// ordenar quais problemas comuns aparecem primeiro — não é um diagnóstico).
const MAKE_COMMON_SYSTEMS: Record<string, SystemKey[]> = {
  volkswagen: ["electrical", "suspension"],
  fiat: ["electrical", "suspension"],
  chevrolet: ["suspension", "electrical"],
  ford: ["electrical", "engine"],
  renault: ["electrical", "engine"],
  hyundai: ["suspension", "brakes"],
  toyota: ["brakes", "tires"],
  honda: ["suspension", "brakes"],
  jeep: ["electrical", "engine"],
  nissan: ["engine", "electrical"],
  peugeot: ["electrical", "engine"],
  citroen: ["electrical", "engine"],
  "citroën": ["electrical", "engine"],
};

// Seção "Problemas comuns": prioriza o que é relevante para os carros do
// usuário — sistema pedindo atenção/km alta (qualquer carro) e sistemas
// típicos da marca — e completa com os problemas gerais.
export function CommonProblems() {
  const c = useContent();
  const ui = c.symptomsUi;
  const { s } = usePrototype();
  const { go } = useNav();
  const cars = s.vehicles;
  const v = activeVehicle(s);
  const SYSTEMS: SystemKey[] = ["brakes", "engine", "suspension", "tires", "electrical"];

  // Sistemas que pedem atenção (saúde/km) em QUALQUER carro do usuário.
  const recoSystems = new Set<SystemKey>();
  // Sistemas típicos das marcas dos carros do usuário.
  const makeSystems = new Set<SystemKey>();
  for (const car of cars) {
    const svc = servicesFor(s, car.id);
    for (const sys of SYSTEMS) if (symptomRecommended(sys, car, svc)) recoSystems.add(sys);
    (MAKE_COMMON_SYSTEMS[(car.make || "").trim().toLowerCase()] ?? []).forEach((sys) => makeSystems.add(sys));
  }

  const isReco = (sx: (typeof c.symptoms)[number]) => recoSystems.has(sx.category);
  const score = (sx: (typeof c.symptoms)[number]) => (isReco(sx) ? 2 : 0) + (makeSystems.has(sx.category) ? 1 : 0);
  const picks = [...c.symptoms].sort((a, b) => score(b) - score(a)).slice(0, 12);

  const sub = cars.length > 1 ? ui.commonSubCars : v ? ui.commonSubCar.replace("{car}", carName(v)) : ui.commonSub;

  return (
    <section className="mt-6">
      <h3 className="font-serif text-lg font-bold text-cream">{ui.commonTitle}</h3>
      <p className="mb-3 mt-0.5 text-xs text-cream/45">{sub}</p>
      <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {picks.map((sx) => (
          <button key={sx.id} onClick={() => go({ name: "symptom", id: sx.id })} className="w-36 shrink-0 text-left">
            <div className="relative grid aspect-square place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-graphite-700 to-graphite-800 ring-1 ring-white/[0.06]">
              <Icon name={SYSTEM_ICON[sx.category] ?? "diagnose"} className="h-9 w-9 text-coral/70" />
              <span className="absolute left-2 top-2"><SeverityDot level={sx.urgency.level} /></span>
              {isReco(sx) && (
                <span className="absolute bottom-2 left-2 rounded-full bg-amber/90 px-1.5 py-0.5 text-[9px] font-semibold text-graphite">
                  {c.premium.recommended}
                </span>
              )}
            </div>
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-cream/85">{sx.label}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

// 2.2.A′ — Problemas de um subsistema
export function SystemProblemsScreen({ system }: { system: SystemKey }) {
  const c = useContent();
  const ui = c.symptomsUi;
  const { s } = usePrototype();
  const v = activeVehicle(s);
  const sysm = c.problemSystems.find((x) => x.key === system);
  const list = c.symptoms.filter((sx) => sx.category === system);
  const services = v ? servicesFor(s, v.id) : [];
  const label = sysm?.label ?? system;

  return (
    <div>
      <AppHeader title={ui.systemProblems.replace("{system}", label)} />
      <div className="mt-1 space-y-2">
        {list.length > 0 ? (
          list.map((sx) => <SymptomRow key={sx.id} sx={sx} reco={!!(s.premium && v && symptomRecommended(sx.category, v, services))} />)
        ) : (
          <p className="rounded-xl bg-graphite-800 px-3.5 py-3 text-sm text-cream/55 ring-1 ring-white/5">{ui.none}</p>
        )}
      </div>

      <p className="mb-2 mt-5 text-sm text-cream/60">{ui.notListed}</p>
      <AskBielaRow
        seed={(v ? `Meu ${carName(v)} ` : "Meu carro ") + `está com um problema no sistema de ${label.toLowerCase()} que não achei na lista. Pode me ajudar a diagnosticar?`}
        label={ui.talkToBiela}
      />
    </div>
  );
}

// 2.2.B — Detalhe do sintoma
export function SymptomDetail({ id }: { id: string }) {
  const c = useContent();
  const ui = c.symptomsUi;
  const { s } = usePrototype();
  const { go, root } = useNav();
  const v = activeVehicle(s);
  const car = carName(v, "");
  const sx = c.symptoms.find((x) => x.id === id);
  const [answers, setAnswers] = useState<Record<number, "yes" | "no">>({});
  if (!sx) return <AppHeader title="—" />;
  const pd = c.symptomPremium[sx.id];

  const shownCauses = s.premium ? sx.causes : sx.causes.slice(0, 2);
  const hiddenCauses = sx.causes.length - shownCauses.length;

  // Compose a rich prompt for Biela from the symptom + anamnese answers.
  const bielaSeed = () => {
    const ans = sx.observe
      .map((o, i) => (answers[i] ? `${o} ${answers[i] === "yes" ? ui.yes : ui.no}` : null))
      .filter(Boolean);
    const carPart = v ? `Meu ${carName(v)} (${v.year}${v.odometerKm != null ? `, ${v.odometerKm.toLocaleString()} km` : ""})` : "Meu carro";
    return `${carPart} está com: ${sx.label}.${ans.length ? " " + ans.join("; ") + "." : ""} O que pode ser e o que devo fazer?`;
  };

  return (
    <div>
      <AppHeader title={sx.label} />

      {/* Mini-anamnese: perguntas de observação viram um questionário rápido */}
      {sx.observe.length > 0 && (
        <Card className="mt-1 ring-amber/20">
          <p className="font-display text-[15px] text-cream">{ui.anamneseTitle}</p>
          <p className="mt-0.5 text-xs text-cream/55">{ui.anamneseSub}</p>
          <div className="mt-3 space-y-2.5">
            {sx.observe.map((o, i) => (
              <div key={o} className="flex items-center gap-2">
                <span className="min-w-0 flex-1 text-sm text-cream/85">{o}</span>
                <div className="flex shrink-0 gap-1.5">
                  {(["yes", "no"] as const).map((val) => (
                    <button
                      key={val}
                      onClick={() => setAnswers((a) => { const n = { ...a }; if (n[i] === val) delete n[i]; else n[i] = val; return n; })}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium ring-1 transition-colors ${
                        answers[i] === val ? "bg-amber text-graphite ring-amber" : "bg-graphite-700 text-cream/70 ring-white/10 hover:ring-amber/30"
                      }`}
                    >
                      {val === "yes" ? ui.yes : ui.no}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-4 w-full" onClick={() => go({ name: "biela", seed: bielaSeed() })}>
            🐻 {ui.diagnoseWithBiela}
          </Button>
        </Card>
      )}

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
