"use client";

import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/app/apiBase";
import { ownedVehicles, servicesFor, soldVehicles, usePrototype } from "@/lib/app/store";
import { computeHealth } from "@/lib/app/health";
import { computeQuizHealth } from "@/lib/app/healthQuiz";
import { LIMITS, economySaved } from "@/lib/app/premium";
import { formatBRL, vehicleLabel } from "@/lib/app/content";
import { AvatarPickerSheet } from "../AvatarPicker";
import type { ServiceRecord, VehicleType } from "@/lib/app/types";
import { Button } from "@/components/ui/Button";
import { useNav } from "@/lib/app/nav";
import { funil } from "@/lib/app/funil";
import { AppHeader, Card, Chip, Icon, inputCls, SectionTitle, Sheet, useContent } from "../ui";
import BielaMascote from "@/components/BielaMascote";

function monthsSince(iso: string): number {
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return 999;
  const now = new Date();
  return Math.max(0, (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth()));
}

function healthColor(score: number) {
  return score >= 80 ? "text-teal" : score >= 60 ? "text-amber" : "text-coral";
}

export function HealthPill({ score }: { score: number }) {
  return <span className={`font-display text-sm font-semibold ${healthColor(score)}`}>{score}%</span>;
}

// Biela chegando com o carro na garagem — toca 1x ao abrir "Meus Carros" e
// congela no último frame. A `key` por montagem recria o <img> a cada visita
// para reiniciar a animação (que é loop=1 no próprio webp).
function ArrivalBanner() {
  const [mountKey] = useState(() => Date.now());
  return (
    <div className="mb-3 overflow-hidden rounded-2xl bg-graphite-800 ring-1 ring-white/5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={mountKey}
        src="/biela/cena-chegada.webp"
        alt=""
        className="aspect-[16/10] w-full object-cover"
        style={{
          objectPosition: "center 58%",
          WebkitMaskImage: "linear-gradient(to bottom, #000 78%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, #000 78%, transparent 100%)",
        }}
      />
    </div>
  );
}

// 1.1 — Meus Carros
export function CarsScreen() {
  const c = useContent();
  const { s, setActiveVehicle, updateVehicle } = usePrototype();
  const { go, root } = useNav();
  const [editNickId, setEditNickId] = useState<string | null>(null);
  const [nickInput, setNickInput] = useState("");

  const openNick = (id: string, current?: string) => { setNickInput(current ?? ""); setEditNickId(id); };
  const saveNick = () => {
    if (editNickId) updateVehicle(editNickId, { nickname: nickInput.trim() || undefined });
    setEditNickId(null);
  };

  const owned = ownedVehicles(s);
  const sold = soldVehicles(s);
  const atLimit = !s.premium && owned.length >= LIMITS.freeCars;
  const onAdd = () => go(atLimit ? { name: "subscribe", ctx: "cars" } : { name: "addCar" });
  const totalSaved = s.premium ? economySaved(s.services) : 0;

  return (
    <div>
      <AppHeader
        title={c.cars.title}
        action={
          <button onClick={onAdd} className="grid h-9 w-9 place-items-center rounded-full bg-amber text-graphite" aria-label={c.cars.add}>
            <Icon name="plus" className="h-5 w-5" />
          </button>
        }
      />

      {s.premium && totalSaved > 0 && (
        <div className="mb-3 flex items-center gap-2.5 rounded-2xl bg-teal/10 px-4 py-3 ring-1 ring-teal/20">
          <span className="text-lg">💰</span>
          <span className="text-sm text-cream/85">{c.premium.saved.replace("{v}", formatBRL(totalSaved))}</span>
        </div>
      )}

      {owned.length > 0 && <ArrivalBanner />}

      {owned.length === 0 ? (
        // Garagem vazia — mascote centralizado, sem caixa/contorno (estilo Bloom)
        <div className="flex min-h-[62vh] flex-col items-center justify-center text-center">
          <BielaMascote pose="acenando" size={200} />
          <p className="mt-4 font-serif text-2xl font-bold text-cream">{c.cars.emptyTitle}</p>
          <p className="mx-auto mt-1.5 max-w-xs text-sm text-cream/55">{c.cars.emptyBody}</p>
          <button
            onClick={() => go({ name: "addCar" })}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber px-7 py-3.5 font-display text-[15px] font-semibold text-graphite active:scale-[0.99]"
          >
            <Icon name="plus" className="h-5 w-5" /> {c.cars.add}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {owned.map((v) => {
            const services = servicesFor(s, v.id);
            const health = computeHealth(v, services);
            const score = computeQuizHealth(v.quiz ?? {}, v).score;
            return (
              <div
                key={v.id}
                role="button"
                tabIndex={0}
                onClick={() => { setActiveVehicle(v.id); root({ name: "car" }); }}
                className="block w-full cursor-pointer text-left"
              >
                <Card className="hover:ring-white/15">
                  <div className="flex items-center gap-3">
                    <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-teal/15 text-teal">
                      {v.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={v.photo} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Icon name={v.type === "moto" ? "moto" : "car"} className="h-7 w-7" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate font-display text-base text-cream">{v.nickname || v.model}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); openNick(v.id, v.nickname); }}
                          className="shrink-0 text-amber/70 hover:text-amber"
                          aria-label={c.common.edit}
                        >
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                          </svg>
                        </button>
                      </span>
                      <span className="block truncate text-xs text-cream/50">
                        {v.odometerKm != null ? `${v.odometerKm.toLocaleString()} km` : c.cars.noKm}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[10px] uppercase tracking-wide text-cream/40">{c.cars.health}</span>
                      <HealthPill score={score} />
                    </span>
                  </div>
                  <div className="mt-2 flex items-end justify-between gap-2">
                    <div className="min-w-0">
                      {s.premium ? <PremiumCarDetail services={services} systems={health.systems} /> : <FreeCarAlert vehicleId={v.id} findings={health.findings} />}
                    </div>
                    <span className="shrink-0 text-[11px] text-cream/45">{vehicleLabel(v)}</span>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Carros que já tive — vendidos: histórico preservado, sem alertas */}
      {sold.length > 0 && (
        <>
          <SectionTitle>{c.cars.soldSection}</SectionTitle>
          <div className="space-y-2">
            {sold.map((v) => (
              <button
                key={v.id}
                onClick={() => { setActiveVehicle(v.id); root({ name: "car" }); }}
                className="flex w-full items-center gap-3 rounded-2xl bg-graphite-800/60 px-3.5 py-3 text-left ring-1 ring-white/5 hover:ring-white/15"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-graphite-700 text-cream/40">
                  {v.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.photo} alt="" className="h-full w-full object-cover opacity-60" />
                  ) : (
                    <Icon name={v.type === "moto" ? "moto" : "car"} className="h-5 w-5" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-sm text-cream/70">{v.nickname || vehicleLabel(v)}</span>
                  <span className="block text-xs text-cream/40">
                    {c.carSettings.soldOn.replace("{d}", (v.soldAt ?? "").split("-").reverse().join("/"))}
                  </span>
                </span>
                <span className="shrink-0 rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-cream/45">
                  {c.carSettings.soldBadge}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Edit car name (nickname) */}
      <Sheet open={editNickId != null} onClose={() => setEditNickId(null)}>
        <h2 className="font-display text-xl font-bold text-cream">{c.cars.nameCar}</h2>
        <input
          value={nickInput}
          onChange={(e) => setNickInput(e.target.value)}
          placeholder={c.cars.nameCarPh}
          className={`mt-4 ${inputCls}`}
        />
        <Button size="lg" className="mt-4 w-full" onClick={saveNick}>
          {c.common.save}
        </Button>
      </Sheet>
    </div>
  );
}

// Free: one generic alert chip.
// Selo de alerta do carro. Quando há pendência, é um atalho direto para
// Próximas revisões (o lugar onde o usuário resolve o que está vencido).
function FreeCarAlert({ vehicleId, findings }: { vehicleId: string; findings: { code: string; severity: string }[] }) {
  const c = useContent();
  const { root } = useNav();
  const { setActiveVehicle } = usePrototype();
  const overdue = findings.some((f) => f.code === "oil_overdue" || f.code.startsWith("revision_overdue"));
  const label = overdue ? c.cars.alertOverdue : findings.length ? c.cars.alertPending : c.cars.ok;
  const tone = overdue ? "bg-coral/15 text-coral" : findings.length ? "bg-amber/15 text-amber" : "bg-teal/15 text-teal";
  const pending = overdue || findings.length > 0;

  if (!pending) {
    return (
      <div className="mt-2.5">
        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${tone}`}>{label}</span>
      </div>
    );
  }
  return (
    <div className="mt-2.5">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setActiveVehicle(vehicleId); root({ name: "revisions" }); }}
        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-transparent hover:ring-current ${tone}`}
      >
        {label} ›
      </button>
    </div>
  );
}

// Premium: last service + system attention icons.
function PremiumCarDetail({ services, systems }: { services: ServiceRecord[]; systems: { key: string; status: string }[] }) {
  const c = useContent();
  const last = services[0];
  const lastText = last ? c.premium.lastService.replace("{t}", c.premium.monthsAgo.replace("{n}", String(monthsSince(last.date)))) : c.premium.never;
  const attention = systems.filter((sy) => sy.status !== "ok").slice(0, 3);
  return (
    <div className="mt-2.5 flex items-center gap-2">
      <span className="text-xs text-cream/55">{lastText}</span>
      <span className="ml-auto flex items-center gap-1.5">
        {attention.length === 0 ? (
          <span className="text-teal">✓</span>
        ) : (
          attention.map((sy) => (
            <Icon key={sy.key} name={sy.key} className={`h-4 w-4 ${sy.status === "overdue" ? "text-coral" : "text-amber"}`} />
          ))
        )}
      </span>
    </div>
  );
}

// 1.2 — Adicionar carro (also reused for editing via editId)
export function AddCarScreen({ editId }: { editId?: string }) {
  const c = useContent();
  const a = c.addCar;
  const { s, addVehicle, updateVehicle } = usePrototype();
  const { back, root } = useNav();
  const editing = editId ? s.vehicles.find((v) => v.id === editId) ?? null : null;

  const [type, setType] = useState<VehicleType>(editing?.type ?? "car");
  const [make, setMake] = useState<string | null>(editing?.make ?? null);
  const [model, setModel] = useState<string | null>(editing?.model ?? null);
  const [year, setYear] = useState<number | null>(editing?.year ?? null);
  const [engine, setEngine] = useState(editing?.engine ?? "");
  const [km, setKm] = useState(editing?.odometerKm != null ? String(editing.odometerKm) : "");
  const [makeOpen, setMakeOpen] = useState(false);
  const [photo, setPhoto] = useState<string | undefined>(editing?.photo);
  const [avatarSheet, setAvatarSheet] = useState(false);
  // Combined car search (single field) vs. manual make/model entry.
  const [query, setQuery] = useState(editing?.make && editing?.model ? `${editing.model} · ${editing.make}` : "");
  const [comboOpen, setComboOpen] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  // Versões reais do veículo (tabela FIPE) quando marca+modelo+ano estão
  // definidos — viram sugestões no campo Versão/Motor (digitação livre segue).
  const [versions, setVersions] = useState<string[]>([]);
  const [verOpen, setVerOpen] = useState(false);
  useEffect(() => {
    setVersions([]);
    if (!make || !model || !year) return;
    const ctl = new AbortController();
    fetch(apiUrl(`/api/versions?type=${type}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`), { signal: ctl.signal })
      .then((r) => (r.ok ? r.json() : { versions: [] }))
      .then((js) => setVersions(Array.isArray(js.versions) ? js.versions : []))
      .catch(() => {});
    return () => ctl.abort();
  }, [type, make, model, year]);
  const verQ = engine.trim().toLowerCase();
  const verMatches = versions
    .filter((v) => !verQ || v.toLowerCase().includes(verQ))
    .filter((v) => v.toLowerCase() !== verQ)
    .slice(0, 12);

  const valid = !!(make && model && year);

  const save = () => {
    if (!valid) return;
    const data = {
      type,
      make: make!,
      model: model!,
      year: year!,
      engine: engine.trim() || undefined,
      odometerKm: km ? parseInt(km, 10) : undefined,
      photo,
    };
    if (editing) {
      updateVehicle(editing.id, data);
      back();
    } else {
      addVehicle(data);
      // Primeira ação de valor do funil: cadastrou um veículo (ativação real).
      funil("cadastrou_carro", { umaVez: true, origem: type });
      root({ name: "car" });
    }
  };

  const modelsMap = type === "moto" ? c.motoModelsByMake : c.modelsByMake;
  const models = make ? modelsMap[make] ?? [] : [];
  const makeMatches = c.makes[type].filter(
    (m) => !make || (m.toLowerCase().includes(make.toLowerCase()) && m.toLowerCase() !== make.toLowerCase())
  );

  // Flat make+model catalog for the combined search field.
  const catalog = c.makes[type].flatMap((mk) => (modelsMap[mk] ?? []).map((md) => ({ make: mk, model: md })));
  const q = query.trim().toLowerCase();
  const comboResults = q
    ? catalog
        .filter((p) => p.model.toLowerCase().includes(q) || p.make.toLowerCase().includes(q))
        .map((p) => {
          const ml = p.model.toLowerCase();
          const rank = ml === q ? 0 : ml.startsWith(q) ? 1 : ml.includes(q) ? 2 : 3;
          return { ...p, rank };
        })
        .sort((x, y) => x.rank - y.rank || x.make.localeCompare(y.make) || x.model.localeCompare(y.model))
        .slice(0, 40)
    : [];

  const pickCar = (mk: string, md: string) => {
    setMake(mk); setModel(md); setQuery(`${md} · ${mk}`); setComboOpen(false);
  };

  return (
    <div>
      {/* Sem anúncio aqui: cadastrar o carro é a primeira ação útil do app e
          não pode ficar atrás de um vídeo de 8 segundos. */}
      <AppHeader title={editing ? a.editTitle : a.title} />

      <div className="space-y-5 pb-4">
        <div className="grid grid-cols-2 gap-2">
          {(["car", "moto"] as VehicleType[]).map((tp) => (
            <button
              key={tp}
              onClick={() => { setType(tp); setMake(null); setModel(null); setQuery(""); }}
              className={`flex items-center justify-center gap-2 rounded-xl py-3 font-display ring-1 transition-colors ${type === tp ? "bg-teal/15 text-teal ring-teal" : "bg-graphite-800 text-cream/70 ring-white/10"}`}
            >
              <Icon name={tp === "car" ? "car" : "moto"} className="h-5 w-5" />
              {tp === "car" ? a.car : a.moto}
            </button>
          ))}
        </div>

        {!manualMode ? (
          /* Campo único: busca combinada marca + modelo */
          <Field label={a.carField}>
            <div className="relative">
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setMake(null); setModel(null); setComboOpen(true); }}
                onFocus={() => setComboOpen(true)}
                onBlur={() => setTimeout(() => setComboOpen(false), 150)}
                placeholder={a.carFieldPh}
                autoComplete="off"
                className={inputCls}
              />
              {comboOpen && q.length > 0 && (
                <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl bg-graphite-700 p-1 shadow-card ring-1 ring-white/10">
                  {comboResults.length > 0 ? (
                    comboResults.map((p) => (
                      <button
                        key={p.make + "/" + p.model}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pickCar(p.make, p.model)}
                        className="flex w-full items-baseline gap-2 rounded-lg px-3 py-2 text-left hover:bg-white/5"
                      >
                        <span className="font-display text-sm text-cream">{p.model}</span>
                        <span className="text-xs text-cream/50">· {p.make}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-cream/50">{a.noCarMatch}</div>
                  )}
                </div>
              )}
            </div>
            <button type="button" onClick={() => { setManualMode(true); setComboOpen(false); }} className="mt-1.5 text-xs font-medium text-amber/80 hover:text-amber">
              {a.manualEntry}
            </button>
          </Field>
        ) : (
          /* Fallback: marca + modelo manuais (carros fora do catálogo) */
          <>
            <Field label={a.make}>
              <div className="relative">
                <input
                  value={make ?? ""}
                  onChange={(e) => { setMake(e.target.value || null); setModel(null); setMakeOpen(true); }}
                  onFocus={() => setMakeOpen(true)}
                  onBlur={() => setTimeout(() => setMakeOpen(false), 120)}
                  placeholder={a.makePh}
                  autoComplete="off"
                  className={inputCls}
                />
                {makeOpen && makeMatches.length > 0 && (
                  <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl bg-graphite-700 p-1 shadow-card ring-1 ring-white/10">
                    {makeMatches.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { setMake(m); setModel(null); setMakeOpen(false); }}
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-cream hover:bg-white/5"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Field>
            {models.length > 0 ? (
              <Picker label={a.model} value={model} options={models} onPick={setModel} />
            ) : (
              <Field label={a.model}>
                <input value={model ?? ""} onChange={(e) => setModel(e.target.value || null)} placeholder={a.modelPh} className={inputCls} />
              </Field>
            )}
            <button type="button" onClick={() => setManualMode(false)} className="text-xs font-medium text-amber/80 hover:text-amber">
              {a.backToSearch}
            </button>
          </>
        )}

        {model && (
          <Field label={a.year}>
            <select
              value={year ?? ""}
              onChange={(e) => setYear(e.target.value ? Number(e.target.value) : null)}
              className={inputCls}
            >
              <option value="" disabled>{a.yearPh}</option>
              {c.years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </Field>
        )}

        <Field label={a.engine}>
          <div className="relative">
            <input
              value={engine}
              onChange={(e) => { setEngine(e.target.value); setVerOpen(true); }}
              onFocus={() => setVerOpen(true)}
              onBlur={() => setTimeout(() => setVerOpen(false), 150)}
              placeholder={a.enginePh}
              autoComplete="off"
              className={inputCls}
            />
            {verOpen && verMatches.length > 0 && (
              <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl bg-graphite-700 p-1 shadow-card ring-1 ring-white/10">
                {verMatches.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { setEngine(v); setVerOpen(false); }}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-cream hover:bg-white/5"
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Field>

        <Field label={a.km}>
          <input value={km} inputMode="numeric" onChange={(e) => setKm(e.target.value.replace(/\D/g, ""))} placeholder={a.kmPh} className={inputCls} />
        </Field>

        <Field label={a.photo}>
          {/* Botão que abre a janela de avatares/foto */}
          <button
            type="button"
            onClick={() => setAvatarSheet(true)}
            className="flex w-full items-center gap-3 rounded-xl bg-graphite-800 px-3.5 py-3 text-left ring-1 ring-white/10 hover:ring-amber/30"
          >
            <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-lg bg-graphite-700 text-lg text-cream/60">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="" className="h-full w-full object-cover" />
              ) : (
                "🚗"
              )}
            </span>
            <span className="flex-1 text-sm text-cream/70">{photo ? a.changeAvatar : a.chooseAvatar}</span>
            <span className="text-cream/40">›</span>
          </button>
        </Field>

        {!valid && <p className="text-xs text-cream/45">{a.needModel}</p>}

        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={back}>
            {c.common.cancel}
          </Button>
          <Button className="flex-1" disabled={!valid} onClick={save}>
            {c.common.save}
          </Button>
        </div>
      </div>

      {/* Janela de avatares / foto */}
      <AvatarPickerSheet
        open={avatarSheet}
        onClose={() => setAvatarSheet(false)}
        photo={photo}
        onSelect={setPhoto}
        labels={{ title: a.chooseAvatar, sub: a.avatarLabel, addPhoto: a.addPhoto, remove: a.removePhoto }}
      />
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

function Picker<T extends string | number>({ label, value, options, onPick }: { label: string; value: T | null; options: T[]; onPick: (v: T) => void }) {
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
