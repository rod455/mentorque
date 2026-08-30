"use client";

import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/app/apiBase";
import { useI18n } from "@/lib/i18n";
import { activeVehicle, servicesFor, usePrototype } from "@/lib/app/store";
import { computeUpcoming, type UpcomingItem } from "@/lib/app/health";
import { carName, formatMonths, minPurchaseDate, monthsSinceDate } from "@/lib/app/content";
import { useNav } from "@/lib/app/nav";
import { Button } from "@/components/ui/Button";
import { AppHeader, Card, DateField, Icon, inputCls, PremiumBadge, SectionTitle, Sheet, UpgradeBanner, useContent } from "../ui";

const statusTone: Record<string, string> = { overdue: "text-coral", soon: "text-amber", ok: "text-teal", unknown: "text-cream/50" };

// Prévia do plano Premium para quem é free: mostra COMO o plano fica —
// item do manual, quando, a observação e o custo — tudo borrado com cadeado.
function PremiumPreview({ car }: { car: string }) {
  const c = useContent();
  const r = c.revisions;
  const { go } = useNav();
  return (
    <div className="mt-5">
      <p className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-cream/45">
        {r.previewTitle.replace("{car}", car)} <PremiumBadge />
      </p>
      <div className="relative space-y-2">
        {r.previewItems.map((it, i) => (
          <div key={i} className="rounded-xl bg-graphite-800 px-3.5 py-3 ring-1 ring-white/5">
            <div className="flex items-center gap-2">
              <span aria-hidden className="flex-1 select-none font-display text-[15px] text-cream blur-[4px]">{it.item}</span>
              <span className="shrink-0 text-amber">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
              </span>
            </div>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs">
              <span aria-hidden className="select-none text-cream/55 blur-[3px]">{it.when}</span>
              <span className="rounded bg-teal/15 px-1.5 py-0.5 text-[10px] text-teal">✦ {r.fromManual}</span>
            </p>
            <p aria-hidden className="mt-1 select-none text-xs leading-relaxed text-cream/70 blur-[4px]">{it.note}</p>
            <p className="mt-1 text-xs text-cream/70">
              {r.estCost}: <span aria-hidden className="select-none text-amber blur-[4px]">{it.cost}</span>
            </p>
          </div>
        ))}
        {/* Camada clicável por cima: qualquer toque leva ao paywall */}
        <button
          onClick={() => go({ name: "subscribe", ctx: "revisions" })}
          aria-label={r.previewCta}
          className="absolute inset-0 z-10 flex items-end justify-center rounded-xl bg-gradient-to-t from-graphite-900/70 via-transparent to-transparent pb-3"
        >
          <span className="rounded-full bg-amber px-4 py-2 font-display text-xs font-semibold text-graphite shadow-card">
            🔓 {r.previewCta}
          </span>
        </button>
      </div>
    </div>
  );
}

// Lembrete persistido: fica salvo no perfil e aparece em "Próximos serviços"
// (aba Histórico). Tocar de novo remove.
function ReminderButton({ vehicleId, itemKey }: { vehicleId: string; itemKey: string }) {
  const c = useContent();
  const r = c.revisions;
  const { s, toggleReminder } = usePrototype();
  const on = (s.reminders ?? []).includes(`${vehicleId}:${itemKey}`);
  return (
    <button
      onClick={() => toggleReminder(vehicleId, itemKey)}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium ring-1 transition-colors ${
        on ? "bg-teal/15 text-teal ring-teal/30" : "bg-graphite-700 text-cream/80 ring-white/10 hover:ring-white/20"
      }`}
    >
      {on ? `🔔 ${r.reminded}` : r.remind}
    </button>
  );
}

// O convite a cadastrar a última revisão, quando o plano roda em estimativa.
//
// Ele é a SAÍDA do estado "km estimado": desde 30/08 um carro sem histórico
// mostra previsões marcadas "A confirmar", que é honesto mas não resolve. O
// que resolve é a pessoa contar quando foi a última troca, e este banner é o
// convite. Aproximado serve, e o texto diz isso: uma âncora imprecisa de
// verdade planeja melhor que uma estimativa precisa de mentira.
//
// O X dispensa POR VEÍCULO e não volta (localStorage): quem disse "não sei"
// para o Golf não precisa repetir o não a cada visita, mas um segundo carro
// merece o convite dele. E ele some sozinho quando o primeiro serviço é
// cadastrado, porque aí a missão dele acabou.
const BASE_DISPENSADO = "mq-base-revisao";

function BannerUltimaRevisao({ vehicleId }: { vehicleId: string }) {
  const c = useContent();
  const r = c.revisions;
  const { go } = useNav();
  const chave = `${BASE_DISPENSADO}:${vehicleId}`;
  const [fechado, setFechado] = useState(true);

  // Começa fechado e abre depois de ler o aparelho: nascer aberto e sumir no
  // instante seguinte (quando o localStorage responde) é um piscar que parece
  // defeito. O atraso de um render é invisível; o piscar não.
  useEffect(() => {
    try { setFechado(!!window.localStorage.getItem(chave)); } catch { setFechado(false); }
  }, [chave]);

  if (fechado) return null;
  const dispensar = () => {
    setFechado(true);
    try { window.localStorage.setItem(chave, "1"); } catch { /* modo privado: vale a sessão */ }
  };

  return (
    <div className="mb-3 rounded-2xl bg-teal/[0.07] p-4 ring-1 ring-teal/20">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 text-base">🗓️</span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-semibold text-cream">{r.baseTitulo}</p>
          <p className="mt-1 text-[13px] leading-snug text-cream/65">{r.baseCorpo}</p>
        </div>
        <button onClick={dispensar} aria-label="dispensar" className="-mr-1 -mt-1 shrink-0 p-1.5 text-cream/35 hover:text-cream/70">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      </div>
      <button
        onClick={() => go({ name: "addService", preset: { type: "oil" } })}
        className="mt-3 ml-[26px] rounded-lg bg-teal/15 px-3 py-1.5 text-xs font-medium text-teal ring-1 ring-teal/30"
      >
        {r.baseCta}
      </button>
    </div>
  );
}

type PlanItem = { item: string; status: "overdue" | "soon" | "ok" | "unknown"; when: string; note?: string; source: "manual" | "general"; serviceType?: string };
type Plan = { summary: string; items: PlanItem[] };

export function RevisionsScreen() {
  const c = useContent();
  const r = c.revisions;
  const { locale } = useI18n();
  const { s, updateVehicle } = usePrototype();
  const { go } = useNav();
  const v = activeVehicle(s);
  const services = v ? servicesFor(s, v.id) : [];

  const [plan, setPlan] = useState<Plan | null>(null);
  const [grounded, setGrounded] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [kmSheet, setKmSheet] = useState(false);
  const [dateSheet, setDateSheet] = useState(false);
  const [kmInput, setKmInput] = useState("");

  // Fetch the AI plan (Premium): manual + history + km + time owned.
  useEffect(() => {
    if (!v || !s.premium) { setPlan(null); return; }
    const ctrl = new AbortController();
    setLoadingPlan(true);
    fetch(apiUrl("/api/revisions"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        locale,
        car: { make: v.make, model: v.model, year: v.year, engine: v.engine, km: v.odometerKm, purchaseDate: v.purchaseDate },
        services: services.map((x) => ({ type: x.type, date: x.date, km: x.km, parts: x.parts })),
      }),
      signal: ctrl.signal,
    })
      .then((res) => res.json())
      .then((d) => { if (d.mode === "ai" && d.plan) { setPlan(d.plan); setGrounded(!!d.grounded); } else setPlan(null); })
      .catch(() => setPlan(null))
      .finally(() => setLoadingPlan(false));
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v?.id, v?.odometerKm, v?.purchaseDate, s.premium, locale, services.length]);

  if (!v) return <AppHeader title={r.title} />;

  const months = monthsSinceDate(v.purchaseDate);
  const detItems = computeUpcoming(v, services);

  const saveKm = () => { updateVehicle(v.id, { odometerKm: kmInput ? parseInt(kmInput, 10) : undefined }); setKmSheet(false); };

  // Context strip: mileage + purchase date, both editable inline.
  const ContextCard = (
    <Card className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
      <button onClick={() => { setKmInput(v.odometerKm != null ? String(v.odometerKm) : ""); setKmSheet(true); }} className="flex items-center gap-1.5 text-sm text-cream/80 hover:text-cream">
        <Icon name="gauge" className="h-4 w-4 text-cream/50" />
        {v.odometerKm != null ? `${v.odometerKm.toLocaleString()} km` : r.setKm}
      </button>
      <button onClick={() => setDateSheet(true)} className="flex items-center gap-1.5 text-sm text-cream/80 hover:text-cream">
        <Icon name="calendar" className="h-4 w-4 text-cream/50" />
        {months != null ? r.ownedFor.replace("{n}", formatMonths(months, locale)) : r.setPurchaseCta}
      </button>
    </Card>
  );

  const PlanItemCard = ({ it }: { it: PlanItem }) => (
    <div className="rounded-xl bg-graphite-800 px-3.5 py-3 ring-1 ring-white/5">
      <div className="flex items-center gap-2">
        <span className="flex-1 font-display text-[15px] text-cream">{it.item}</span>
        <span className={`text-xs font-medium ${statusTone[it.status] ?? "text-cream/50"}`}>{r.statusLabels[it.status] ?? it.status}</span>
      </div>
      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-cream/55">
        {it.when}
        <span className={`rounded px-1.5 py-0.5 text-[10px] ${it.source === "manual" ? "bg-teal/15 text-teal" : "bg-graphite-700 text-cream/45"}`}>
          {it.source === "manual" ? `✦ ${r.fromManual}` : r.general}
        </span>
      </p>
      {it.note && <p className="mt-1 text-xs text-cream/70">{it.note}</p>}
      <div className="mt-2.5 flex gap-2">
        <ReminderButton vehicleId={v.id} itemKey={it.serviceType ?? it.item} />
        <button onClick={() => go({ name: "addService", preset: { type: it.serviceType ?? "other" } })} className="rounded-lg bg-amber/15 px-3 py-1.5 text-xs font-medium text-amber ring-1 ring-amber/20 hover:ring-amber/40">
          {r.didIt}
        </button>
      </div>
    </div>
  );

  // Deterministic fallback (also what free users see).
  const detDetail = (it: UpcomingItem): string => {
    if (it.basis === "km" && it.inKm != null) {
      const base = it.inKm <= 0
        ? r.overdueKm.replace("{n}", Math.abs(it.inKm).toLocaleString())
        : r.inKm.replace("{n}", it.inKm.toLocaleString());
      // Sem registro do último serviço, o número é uma estimativa e a tela
      // precisa dizer isso. Número inventado sem aviso é pior que nenhum.
      // Parênteses, não travessão: texto visível segue a regra da casa.
      return it.estimado ? `${base} (${r.planKmEstimado})` : base;
    }
    if (it.basis === "time" && it.months != null) return r.monthsAgo.replace("{n}", String(it.months));
    return "";
  };
  const DetItemCard = ({ it }: { it: UpcomingItem }) => (
    <div className="rounded-xl bg-graphite-800 px-3.5 py-3 ring-1 ring-white/5">
      <div className="flex items-center gap-2">
        <span className="flex-1 font-display text-[15px] text-cream">{r.ruleLabels[it.key] ?? it.key}</span>
        <span className={`text-xs font-medium ${statusTone[it.status]}`}>{r.statusLabels[it.status]}</span>
      </div>
      <p className="mt-0.5 text-xs text-cream/55">{detDetail(it)}</p>
      {s.premium && r.cost[it.key] && <p className="mt-1 text-xs text-cream/70">{r.estCost}: <span className="text-amber">{r.cost[it.key]}</span></p>}
      <div className="mt-2.5 flex gap-2">
        <ReminderButton vehicleId={v.id} itemKey={it.key} />
        <button onClick={() => go({ name: "addService", preset: { type: it.key } })} className="rounded-lg bg-amber/15 px-3 py-1.5 text-xs font-medium text-amber ring-1 ring-amber/20 hover:ring-amber/40">
          {r.didIt}
        </button>
      </div>
    </div>
  );

  const renderDeterministic = () => {
    if (v.odometerKm == null && !v.purchaseDate) return <Card className="text-center text-sm text-cream/60">{r.needKm}</Card>;
    if (detItems.length === 0) return <Card className="flex items-center gap-2 text-sm text-cream/60"><span className="text-teal">✓</span> {r.none}</Card>;
    return <div className="space-y-2">{detItems.map((it) => <DetItemCard key={it.basis + it.key} it={it} />)}</div>;
  };

  return (
    <div>
      <AppHeader title={r.title} />
      {ContextCard}

      {/* Sem nenhum serviço registrado, todo o plano é estimativa: convida a
          cadastrar a última revisão. Cadastrou uma, ele some por conta. */}
      {services.length === 0 && <BannerUltimaRevisao vehicleId={v.id} />}

      {s.premium ? (
        loadingPlan && !plan ? (
          <Card className="flex items-center gap-2.5 text-sm text-cream/70">
            <span className="text-lg">🔮</span> {r.planLoading}
          </Card>
        ) : plan ? (
          <>
            {plan.summary && (
              <Card className="mb-3 flex items-start gap-2.5 ring-amber/25">
                <span className="text-lg">🔮</span>
                <span className="text-sm text-cream/85">{plan.summary}</span>
              </Card>
            )}
            <p className="mb-2.5 text-xs text-cream/45">{r.basedOn}</p>
            <div className="space-y-2">{plan.items.map((it, i) => <PlanItemCard key={i} it={it} />)}</div>
          </>
        ) : (
          // AI unavailable → deterministic
          renderDeterministic()
        )
      ) : (
        <>
          <UpgradeBanner ctx="revisions" text={r.nudge.replace("{car}", carName(v))} />
          <div className="mt-3" />
          {renderDeterministic()}
          <PremiumPreview car={carName(v)} />
        </>
      )}

      {/* Set mileage */}
      <Sheet open={kmSheet} onClose={() => setKmSheet(false)}>
        <h2 className="font-display text-xl font-bold text-cream">{r.setKm}</h2>
        <input value={kmInput} inputMode="numeric" onChange={(e) => setKmInput(e.target.value.replace(/\D/g, ""))} placeholder={c.addService.kmPh} className={`mt-4 ${inputCls}`} />
        <Button size="lg" className="mt-4 w-full" onClick={saveKm}>{c.common.save}</Button>
      </Sheet>

      {/* Set purchase date */}
      <Sheet open={dateSheet} onClose={() => setDateSheet(false)}>
        <h2 className="font-display text-xl font-bold text-cream">{r.setPurchase}</h2>
        <DateField
          value={v.purchaseDate ?? ""}
          min={minPurchaseDate(v.year)}
          max={new Date().toISOString().slice(0, 10)}
          onCommit={(val) => updateVehicle(v.id, { purchaseDate: val || undefined })}
          className={`mt-4 ${inputCls}`}
        />
        <Button size="lg" className="mt-4 w-full" onClick={() => setDateSheet(false)}>{c.common.save}</Button>
      </Sheet>
    </div>
  );
}
