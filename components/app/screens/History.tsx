"use client";

import { useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { activeVehicle, servicesFor, usePrototype } from "@/lib/app/store";
import { LIMITS } from "@/lib/app/premium";
import { formatBRL } from "@/lib/app/content";
import { resizeImage } from "@/lib/app/image";
import type { ServicePart, ServiceRecord } from "@/lib/app/types";
import { useNav } from "@/lib/app/nav";
import { Button } from "@/components/ui/Button";
import { AppHeader, Card, Chip, Icon, inputCls, PremiumBadge, SectionTitle, useContent } from "../ui";

// Suggested common parts per service type (Premium).
const SUGGESTED_PARTS: Record<string, string[]> = {
  oil: ["Óleo do motor", "Filtro de óleo"],
  brakes: ["Pastilhas", "Discos", "Fluido de freio"],
  revision: ["Óleo", "Filtro de ar", "Filtro de combustível", "Velas"],
  suspension: ["Amortecedores", "Bieletas", "Batentes"],
  tires: ["Pneus", "Alinhamento", "Balanceamento"],
  battery: ["Bateria"],
  timing: ["Correia dentada", "Tensor", "Bomba d'água"],
};

function useTypeLabel() {
  const c = useContent();
  return (key: string) => c.serviceTypes.find((t) => t.key === key)?.label ?? key;
}

function fmtDate(iso: string, locale: string) {
  const d = new Date(iso + "T00:00:00");
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString(locale === "pt" ? "pt-BR" : "en-US", { day: "2-digit", month: "short", year: "numeric" });
}
function useDateFmt() {
  const { locale } = useI18n();
  return (iso: string) => fmtDate(iso, locale);
}

// 2.4.A — Lista de histórico
export function HistoryScreen() {
  const c = useContent();
  const typeLabel = useTypeLabel();
  const dateFmt = useDateFmt();
  const { s } = usePrototype();
  const { go } = useNav();
  const v = activeVehicle(s);
  const [filter, setFilter] = useState<string>("all");
  if (!v) return <AppHeader title={c.history.title} />;

  const all = servicesFor(s, v.id);
  const list = filter === "all" ? all : all.filter((r) => r.type === filter);
  const usedTypes = Array.from(new Set(all.map((r) => r.type)));
  const atLimit = !s.premium && all.length >= LIMITS.freeServices;
  const onAdd = () => go(atLimit ? { name: "subscribe", ctx: "history" } : { name: "addService" });

  return (
    <div>
      <AppHeader
        title={c.history.title}
        action={
          <button onClick={onAdd} className="grid h-9 w-9 place-items-center rounded-full bg-amber text-graphite" aria-label={c.history.add}>
            <Icon name="plus" className="h-5 w-5" />
          </button>
        }
      />

      {all.length === 0 ? (
        <Card className="mt-2 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-graphite-700 text-cream/60">
            <Icon name="clock" className="h-6 w-6" />
          </div>
          <p className="text-sm text-cream/60">{c.history.none}</p>
          <Button className="mt-4" onClick={() => go({ name: "addService" })}>
            {c.history.add}
          </Button>
        </Card>
      ) : (
        <>
          {s.premium && <SpendReport services={all} />}
          {usedTypes.length > 1 && (
            <div className="mb-3 flex flex-wrap gap-2">
              <Chip active={filter === "all"} onClick={() => setFilter("all")}>{c.history.all}</Chip>
              {usedTypes.map((t) => (
                <Chip key={t} active={filter === t} onClick={() => setFilter(t)}>{typeLabel(t)}</Chip>
              ))}
            </div>
          )}
          <div className="space-y-2">
            {list.map((r) => (
              <button key={r.id} onClick={() => go({ name: "service", id: r.id })} className="flex w-full items-center gap-3 rounded-xl bg-graphite-800 px-3.5 py-3 text-left ring-1 ring-white/5 hover:ring-white/15">
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[15px] text-cream">{typeLabel(r.type)}</span>
                  <span className="block text-xs text-cream/50">{dateFmt(r.date)} · {r.km.toLocaleString()} km</span>
                </span>
                {r.total != null && <span className="shrink-0 text-sm text-cream/70">{formatBRL(r.total)}</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// 2.4.B — Adicionar / editar serviço
export function AddServiceScreen({ preset, editId }: { preset?: Partial<ServiceRecord>; editId?: string }) {
  const c = useContent();
  const a = c.addService;
  const { s, addService, updateService } = usePrototype();
  const { back, go } = useNav();
  const v = activeVehicle(s);
  const editing = editId ? s.services.find((r) => r.id === editId) ?? null : null;
  const src = editing ?? preset;

  const today = new Date().toISOString().slice(0, 10);
  const [type, setType] = useState(src?.type ?? "oil");
  const [date, setDate] = useState(src?.date ?? today);
  const [km, setKm] = useState(src?.km != null ? String(src.km) : v?.odometerKm != null ? String(v.odometerKm) : "");
  const [shop, setShop] = useState(src?.shop ?? "");
  const [total, setTotal] = useState(src?.total != null ? String(src.total) : "");
  const [parts, setParts] = useState<ServicePart[]>(src?.parts ?? []);
  const [notes, setNotes] = useState(src?.notes ?? "");
  const [photo, setPhoto] = useState<string | undefined>(src?.photo);
  const [category, setCategory] = useState<ServiceRecord["category"]>(src?.category);
  const inputRef = useRef<HTMLInputElement>(null);

  const addPart = () => {
    if (!s.premium && parts.length >= LIMITS.freeParts) { go({ name: "subscribe", ctx: "parts" }); return; }
    setParts((ps) => [...ps, { name: "" }]);
  };
  const suggestions = (SUGGESTED_PARTS[type] ?? []).filter((sp) => !parts.some((p) => p.name === sp));

  if (!v) return <AppHeader title={a.title} />;

  const kmNum = parseInt(km, 10);
  const valid = !!date && Number.isFinite(kmNum) && kmNum >= 0;

  const onPhoto = async (file?: File) => {
    if (!file) return;
    try {
      setPhoto(await resizeImage(file, 1200, 0.7));
    } catch {
      /* ignore */
    }
  };

  const save = () => {
    if (!valid) return;
    const rec = {
      vehicleId: v.id,
      type,
      date,
      km: kmNum,
      shop: shop.trim() || undefined,
      total: total ? parseInt(total, 10) : undefined,
      parts: parts.filter((p) => p.name.trim()),
      notes: notes.trim() || undefined,
      photo,
      category: s.premium ? category : undefined,
    };
    if (editing) updateService(editing.id, rec);
    else addService(rec);
    back();
  };

  return (
    <div>
      <AppHeader title={editing ? a.editTitle : a.title} />

      <div className="space-y-4 pb-4">
        <div>
          <p className="mb-1.5 text-xs uppercase tracking-wide text-cream/45">{a.type}</p>
          <div className="flex flex-wrap gap-2">
            {c.serviceTypes.map((t) => (
              <Chip key={t.key} active={type === t.key} onClick={() => setType(t.key)}>{t.label}</Chip>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label={a.date}>
            <input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </Field>
          <Field label={a.km}>
            <input value={km} inputMode="numeric" onChange={(e) => setKm(e.target.value.replace(/\D/g, ""))} placeholder={a.kmPh} className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label={a.shop}>
            <input value={shop} onChange={(e) => setShop(e.target.value)} placeholder={a.shopPh} className={inputCls} />
          </Field>
          <Field label={a.total}>
            <input value={total} inputMode="numeric" onChange={(e) => setTotal(e.target.value.replace(/\D/g, ""))} placeholder={a.totalPh} className={inputCls} />
          </Field>
        </div>

        {/* Premium: classify the service */}
        {s.premium && (
          <div>
            <p className="mb-1.5 text-xs uppercase tracking-wide text-cream/45">{a.type}</p>
            <div className="flex flex-wrap gap-2">
              {([["preventive", c.premium.preventive], ["corrective", c.premium.corrective], ["upgrade", c.premium.upgrade]] as const).map(([k, lbl]) => (
                <Chip key={k} active={category === k} onClick={() => setCategory(category === k ? undefined : k)}>{lbl}</Chip>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-1.5 text-xs uppercase tracking-wide text-cream/45">{a.parts}</p>
          <div className="space-y-2">
            {parts.map((p, i) => (
              <div key={i} className="flex gap-2">
                <input value={p.name} onChange={(e) => setParts((ps) => ps.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder={a.partName} className={`${inputCls} flex-1`} />
                <input value={p.value != null ? String(p.value) : ""} inputMode="numeric" onChange={(e) => setParts((ps) => ps.map((x, j) => (j === i ? { ...x, value: e.target.value ? parseInt(e.target.value.replace(/\D/g, ""), 10) : undefined } : x)))} placeholder={a.partValue} className={`${inputCls} w-24`} />
                <button onClick={() => setParts((ps) => ps.filter((_, j) => j !== i))} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-graphite-700 text-cream/60" aria-label="remove">✕</button>
              </div>
            ))}
            <button onClick={addPart} className="text-sm font-medium text-amber">
              {!s.premium && parts.length >= LIMITS.freeParts ? `🔒 ${a.addPart}` : `+ ${a.addPart}`}
            </button>
          </div>
          {/* Premium: suggested common parts */}
          {s.premium && suggestions.length > 0 && (
            <div className="mt-2">
              <p className="mb-1 text-[11px] text-cream/45">{c.premium.suggestedParts}</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((sp) => (
                  <button key={sp} onClick={() => setParts((ps) => [...ps, { name: sp }])} className="rounded-full bg-graphite-700 px-2.5 py-1 text-xs text-cream/75 ring-1 ring-white/10 hover:ring-amber/30">+ {sp}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Field label={a.notes}>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder={a.notesPh} className={inputCls} />
        </Field>

        <Field label={a.photo}>
          <button onClick={() => inputRef.current?.click()} className="flex w-full items-center gap-3 rounded-xl bg-graphite-800 px-3.5 py-3 text-left ring-1 ring-white/10 hover:ring-amber/30">
            <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-lg bg-graphite-700 text-cream/60">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="" className="h-full w-full object-cover" />
              ) : (
                "📷"
              )}
            </span>
            <span className="text-sm text-cream/70">{photo ? c.addCar.changePhoto : c.addCar.addPhoto}</span>
          </button>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0])} />
        </Field>

        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={back}>{c.common.cancel}</Button>
          <Button className="flex-1" disabled={!valid} onClick={save}>{c.common.save}</Button>
        </div>
      </div>
    </div>
  );
}

// 2.4.C — Detalhe do serviço
export function ServiceDetail({ id }: { id: string }) {
  const c = useContent();
  const typeLabel = useTypeLabel();
  const dateFmt = useDateFmt();
  const { s, removeService } = usePrototype();
  const { go, back } = useNav();
  const r = s.services.find((x) => x.id === id);
  if (!r) return <AppHeader title="—" />;

  const del = () => {
    if (typeof window !== "undefined" && !window.confirm(c.serviceDetail.deleteConfirm)) return;
    removeService(r.id);
    back();
  };

  return (
    <div>
      <AppHeader title={typeLabel(r.type)} />

      <Card>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Info label={c.addService.date} value={dateFmt(r.date)} />
          <Info label={c.addService.km} value={`${r.km.toLocaleString()} km`} />
          {r.shop && <Info label={c.addService.shop} value={r.shop} />}
          {r.total != null && <Info label={c.addService.total} value={formatBRL(r.total)} />}
        </div>
      </Card>

      {r.parts.length > 0 && (
        <>
          <SectionTitle>{c.serviceDetail.parts}</SectionTitle>
          <div className="space-y-1.5">
            {r.parts.map((p, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-graphite-800 px-3.5 py-2.5 text-sm ring-1 ring-white/5">
                <span className="text-cream/85">{p.name}</span>
                {p.value != null && <span className="text-cream/60">{formatBRL(p.value)}</span>}
              </div>
            ))}
          </div>
        </>
      )}

      {r.notes && (
        <>
          <SectionTitle>{c.serviceDetail.notes}</SectionTitle>
          <p className="rounded-xl bg-graphite-800 px-3.5 py-3 text-sm text-cream/80 ring-1 ring-white/5">{r.notes}</p>
        </>
      )}

      {r.photo && (
        <>
          <SectionTitle>{c.serviceDetail.photo}</SectionTitle>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={r.photo} alt="" className="w-full rounded-xl ring-1 ring-white/10" />
        </>
      )}

      {/* Premium: export + price comparison */}
      <Button className="mt-6 w-full" onClick={() => {
        if (!s.premium) { go({ name: "subscribe", ctx: "exportPdf" }); return; }
        const label = typeLabel(r.type);
        const text = `${label} — ${dateFmt(r.date)} · ${r.km.toLocaleString()} km${r.total != null ? " · " + formatBRL(r.total) : ""}\n${r.parts.map((p) => "• " + p.name).join("\n")}`;
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = `${label}.txt`; a.click(); URL.revokeObjectURL(url);
      }}>
        {s.premium ? c.premium.exportPdf : `🔒 ${c.premium.exportPdf}`}
      </Button>
      {s.premium && r.total != null && <p className="mt-2 text-center text-xs text-cream/55">{c.premium.vsAverage}</p>}

      <div className="mt-4 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={() => go({ name: "addService", editId: r.id })}>{c.common.edit}</Button>
        <Button variant="ghost" className="flex-1 !text-coral" onClick={del}>{c.common.delete}</Button>
      </div>
    </div>
  );
}

// Premium spending report: per-year bars + average per km.
function SpendReport({ services }: { services: ServiceRecord[] }) {
  const c = useContent();
  const withTotal = services.filter((r) => r.total != null);
  const byYear = new Map<string, number>();
  for (const r of withTotal) byYear.set(r.date.slice(0, 4), (byYear.get(r.date.slice(0, 4)) ?? 0) + (r.total ?? 0));
  const years = [...byYear.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const max = Math.max(1, ...years.map(([, v]) => v));
  const kms = services.map((r) => r.km).filter((k) => k > 0);
  const totalSpend = withTotal.reduce((a, r) => a + (r.total ?? 0), 0);
  const kmRange = kms.length > 1 ? Math.max(...kms) - Math.min(...kms) : 0;
  const perKm = kmRange > 0 ? totalSpend / kmRange : 0;

  if (years.length === 0) return null;

  return (
    <Card className="mb-3">
      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-cream/45">{c.premium.chartsTitle} <PremiumBadge /></p>
      <p className="mb-1 text-[11px] text-cream/45">{c.premium.perYear}</p>
      <div className="space-y-1.5">
        {years.map(([y, v]) => (
          <div key={y} className="flex items-center gap-2">
            <span className="w-9 shrink-0 text-xs text-cream/55">{y}</span>
            <span className="h-3 flex-1 overflow-hidden rounded-full bg-graphite-700">
              <span className="block h-full rounded-full bg-amber" style={{ width: `${Math.round((v / max) * 100)}%` }} />
            </span>
            <span className="w-16 shrink-0 text-right text-xs text-cream/70">{formatBRL(v)}</span>
          </div>
        ))}
      </div>
      {perKm > 0 && (
        <p className="mt-2.5 text-xs text-cream/55">{c.premium.perKm}: <span className="text-cream/80">{formatBRL(perKm)}/km</span></p>
      )}
    </Card>
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
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-cream/45">{label}</p>
      <p className="font-display text-[15px] text-cream">{value}</p>
    </div>
  );
}
