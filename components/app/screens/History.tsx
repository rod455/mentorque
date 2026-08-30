"use client";

import { useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { activeVehicle, servicesFor, usePrototype } from "@/lib/app/store";
import { LIMITS } from "@/lib/app/premium";
import { nextServiceByTime } from "@/lib/app/health";
import { planoDosItens, visitaUnica, type PlanoDeItem, type VisitaUnica } from "@/lib/app/planoDeRevisao";
import { pedirFeedback } from "@/lib/app/feedbackPrompt";
import { carName, formatBRL } from "@/lib/app/content";
import { resizeImage } from "@/lib/app/image";
import type { ServicePart, ServiceRecord, SystemKey } from "@/lib/app/types";
import { useNav } from "@/lib/app/nav";
import { Button } from "@/components/ui/Button";
import { AppHeader, Autocomplete, Card, Chip, Icon, inputCls, PremiumBadge, SectionTitle, UpgradeBanner, useContent } from "../ui";
import { ConviteDeAviso } from "../ConviteDeAviso";
import { QUIZ_ZERADO, diaLocal, sequenciaHoje } from "@/lib/app/quiz/sequencia";

const hojeISO = () => new Date().toISOString().slice(0, 10);

const SYSTEMS: SystemKey[] = ["engine", "brakes", "suspension", "tires", "electrical"];

// Default subsystem for each known service type.
const SERVICE_SYSTEM: Record<string, SystemKey> = {
  oil: "engine", brakes: "brakes", revision: "engine", suspension: "suspension",
  tires: "tires", battery: "electrical", timing: "engine", airfilter: "engine", brakefluid: "brakes",
};

// Guess the subsystem from free text (e.g. "óleo do motor" → engine).
function inferSystem(text: string): SystemKey | null {
  const t = text.toLowerCase();
  if (/(óleo|oleo|vela|correia|corrente|motor|filtro|arrefec|radiador|junta|inje[çc]|distribui|embreag|escapa|turbo|bomba d)/.test(t)) return "engine";
  if (/(freio|pastilha|disco|lona|fluido de freio|abs|tambor)/.test(t)) return "brakes";
  if (/(suspens|amortec|mola|bandeja|batente|piv[ôo]|terminal|bieleta|coxim|bucha|rolament)/.test(t)) return "suspension";
  if (/(pneu|roda|balanceam|alinham|calibr|estepe|c[aâ]mara)/.test(t)) return "tires";
  if (/(bateria|alternador|farol|l[âa]mpada|fus[íi]vel|el[ée]tr|chicote|sensor|arranque|partida|ignia|vidro el)/.test(t)) return "electrical";
  return null;
}

function useTypeLabel() {
  const c = useContent();
  return (key: string) => c.serviceTypes.find((t) => t.key === key)?.label ?? key;
}

// A picked service in the current visit.
type PickedService = { type: string; label: string; system: SystemKey | null };

// Autocomplete input that ADDS a service to the list (Enter or pick a suggestion).
function ServicePicker({ options, exclude, onAdd, placeholder }: { options: string[]; exclude: string[]; onAdd: (label: string) => void; placeholder?: string }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ql = q.trim().toLowerCase();
  const ex = exclude.map((x) => x.toLowerCase());
  const matches = options.filter((o) => !ex.includes(o.toLowerCase()) && (!ql || o.toLowerCase().includes(ql)));
  const add = (label: string) => { const l = label.trim(); if (!l) return; onAdd(l); setQ(""); setOpen(false); };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(q); } }}
          placeholder={placeholder}
          autoComplete="off"
          className={inputCls}
        />
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => add(q)} disabled={!q.trim()} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber text-lg text-graphite disabled:opacity-40" aria-label="add">+</button>
      </div>
      {open && matches.length > 0 && (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl bg-graphite-700 p-1 shadow-card ring-1 ring-white/10">
          {matches.map((m) => (
            <button key={m} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => add(m)} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-cream hover:bg-white/5">
              {m}
            </button>
          ))}
        </div>
      )}
    </div>
  );
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
// "Próximos serviços" — no Premium, um retângulo com o tempo que falta para a
// próxima revisão por calendário (+ dica de atualizar o km). Abaixo, os
// lembretes que o usuário agendou em Próximas revisões.
function UpcomingBlock() {
  const c = useContent();
  const r = c.revisions;
  const { s, toggleReminder } = usePrototype();
  const { go } = useNav();
  const v = activeVehicle(s);
  if (!v) return null;

  const servicos = servicesFor(s, v.id);
  const next = s.premium ? nextServiceByTime(v, servicos) : null;
  const mine = (s.reminders ?? []).filter((id) => id.startsWith(`${v.id}:`));
  if (!next && mine.length === 0) return null;

  // Quando cada item do calendário cai, em data e em km, e se vale juntar
  // dois ou três numa ida só à oficina. As contas estão em
  // lib/app/planoDeRevisao.ts, conferidas por scripts/verifica-revisoes.ts.
  const planos = planoDosItens(v, servicos, mine.map((id) => id.slice(v.id.length + 1)));
  const sugestao = visitaUnica(planos);

  const nextText = (() => {
    if (!next) return null;
    const m = Math.round(next.monthsLeft);
    if (m < 0) return { text: r.nextOverdue.replace("{n}", String(Math.abs(m))), tone: "coral" as const };
    if (m === 0) return { text: r.nextThisMonth, tone: "amber" as const };
    if (m === 1) return { text: r.nextInOneMonth, tone: "amber" as const };
    return { text: r.nextInMonths.replace("{n}", String(m)), tone: "teal" as const };
  })();
  const tone = { coral: "ring-coral/30 text-coral", amber: "ring-amber/30 text-amber", teal: "ring-teal/25 text-teal" };

  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cream/45">{r.upcomingTitle}</p>

      {nextText && (
        <button onClick={() => go({ name: "revisions" })} className={`mb-2 flex w-full items-center gap-3 rounded-2xl bg-graphite-800 px-3.5 py-3 text-left ring-1 ${tone[nextText.tone]}`}>
          <Icon name="calendar" className="h-5 w-5 shrink-0" />
          <span className="min-w-0 flex-1">
            <span className="block font-display text-sm text-cream">{nextText.text}</span>
            {v.odometerKm == null && <span className="mt-0.5 block text-xs text-cream/50">{r.nextKmHint}</span>}
          </span>
          <span className="shrink-0 text-cream/30">›</span>
        </button>
      )}

      {mine.length > 0 && (
        <>
          {sugestao && <VisitaUnicaCard sugestao={sugestao} />}
          <div className="space-y-1.5">
            {mine.map((id) => (
              <LembreteDeServico
                key={id}
                chave={id.slice(v.id.length + 1)}
                plano={planos.find((p) => p.key === id.slice(v.id.length + 1)) ?? null}
                onFiz={() => go({ name: "addService", preset: { type: id.slice(v.id.length + 1) } })}
                onRemover={() => toggleReminder(v.id, id.slice(v.id.length + 1))}
                avisosLigados={!!s.notifications}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Uma linha do calendário, agora dizendo QUANDO cai.
 *
 * O TÍTULO NÃO TRUNCA MAIS, e a mudança é estrutural, não de fonte: antes o
 * nome dividia UMA linha com o botão "Já fiz esse serviço" e o X de remover, e
 * em tela de 360px (a maioria dos Android) sobrava espaço para "Pneus (rodí…".
 * Agora o nome tem a linha inteira e as ações descem. Diminuir a fonte
 * resolveria o corte de hoje e voltaria a cortar no primeiro nome mais longo.
 */
function LembreteDeServico({ chave, plano, onFiz, onRemover, avisosLigados }: {
  chave: string;
  plano: PlanoDeItem | null;
  onFiz: () => void;
  onRemover: () => void;
  avisosLigados: boolean;
}) {
  const c = useContent();
  const r = c.revisions;
  const { locale } = useI18n();
  const nome = r.ruleLabels[chave] ?? chave;
  const num = (n: number) => Math.abs(n).toLocaleString(locale === "pt" ? "pt-BR" : "en-US");
  const dia = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    return isNaN(d.getTime()) ? iso : d.toLocaleDateString(locale === "pt" ? "pt-BR" : "en-US");
  };

  // A frase do "quando", montada das partes que existem. As duas bases são
  // independentes (o manual diz "a cada X km OU Y meses"), então um item pode
  // ter as duas, uma, ou nenhuma.
  const quando = (() => {
    if (!plano) return null;
    const partes: string[] = [];
    if (plano.dataPrevista) {
      partes.push((plano.vencido ? r.planVencidaData : r.planPara).replace("{data}", dia(plano.dataPrevista)));
      if (plano.kmRestantes != null) {
        partes.push(plano.kmRestantes > 0
          ? r.planEmKm.replace("{n}", num(plano.kmRestantes))
          : r.planPassouKm.replace("{n}", num(plano.kmRestantes)));
      }
    } else if (plano.kmRestantes != null) {
      partes.push(plano.kmRestantes > 0
        ? r.planSoKm.replace("{n}", num(plano.kmRestantes))
        : r.planPassouKm.replace("{n}", num(plano.kmRestantes)).replace(/^e /, ""));
    }
    return partes.join(", ");
  })();

  // De onde vem a regra. É o que transforma "confie em mim" em "o manual diz".
  const doManual = (() => {
    if (!plano) return null;
    const { mesesIntervalo: m, kmIntervalo: km } = plano;
    if (m && km) return r.planManualAmbos.replace("{meses}", String(m)).replace("{km}", num(km));
    if (m) return r.planManualMeses.replace("{meses}", String(m));
    if (km) return r.planManualKm.replace("{km}", num(km));
    return null;
  })();

  return (
    <div className="rounded-xl bg-graphite-800 px-3.5 py-3 ring-1 ring-white/5">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 text-sm">🔔</span>
        <span className={`min-w-0 flex-1 font-display text-sm leading-snug ${plano?.vencido ? "text-coral" : "text-cream/90"}`}>{nome}</span>
        <button onClick={onRemover} aria-label="remover" className="-mt-0.5 shrink-0 p-1 text-cream/35 hover:text-cream/70">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      </div>

      {quando && <p className="mt-1 pl-[26px] text-[13px] leading-snug text-cream/70">{quando}</p>}
      {doManual && <p className="mt-0.5 pl-[26px] text-[11px] leading-snug text-cream/40">{doManual}</p>}
      {plano?.ancora === "compra" && <p className="mt-0.5 pl-[26px] text-[11px] leading-snug text-cream/40">{r.planDesdeCompra}</p>}
      {plano?.kmEstimado && <p className="mt-0.5 pl-[26px] text-[11px] leading-snug text-cream/40">{r.planKmEstimado}</p>}
      {plano?.dataPrevista && !plano.vencido && (
        <p className="mt-1 pl-[26px] text-[11px] leading-snug text-teal/70">
          {avisosLigados ? r.planAvisamos : r.planAvisosDesligados}
        </p>
      )}

      <button onClick={onFiz} className="mt-2.5 ml-[26px] rounded-lg bg-amber/15 px-3 py-1.5 text-xs font-medium text-amber ring-1 ring-amber/20">
        {r.didIt}
      </button>
    </div>
  );
}

/** "Leve tudo numa visita só": o dia mais cedo do grupo, nunca o mais tarde. */
function VisitaUnicaCard({ sugestao }: { sugestao: VisitaUnica }) {
  const c = useContent();
  const r = c.revisions;
  const { locale } = useI18n();
  const nomes = sugestao.keys.map((k) => r.ruleLabels[k] ?? k);
  const lista = nomes.length > 1
    ? `${nomes.slice(0, -1).join(", ")} ${r.visitaE} ${nomes[nomes.length - 1]}`
    : nomes[0];
  const d = new Date(sugestao.dia + "T00:00:00");
  const passou = sugestao.dia < diaLocal();
  const texto = passou
    ? r.visitaCorpoVencida.replace("{lista}", lista)
    : r.visitaCorpo.replace("{lista}", lista).replace("{data}", d.toLocaleDateString(locale === "pt" ? "pt-BR" : "en-US"));

  return (
    <div className="mb-2 rounded-2xl bg-teal/[0.07] px-3.5 py-3 ring-1 ring-teal/20">
      <p className="font-display text-sm font-semibold text-cream">{r.visitaTitulo}</p>
      <p className="mt-1 text-[13px] leading-snug text-cream/70">{texto}</p>
    </div>
  );
}

export function HistoryScreen() {
  const c = useContent();
  const typeLabel = useTypeLabel();
  const dateFmt = useDateFmt();
  const { s } = usePrototype();
  const { go } = useNav();
  const v = activeVehicle(s);
  const [filter, setFilter] = useState<string>("all");
  if (!v) {
    return (
      <div>
        <AppHeader title={c.history.title} />
        <Card className="mt-2 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-graphite-700 text-cream/60">
            <Icon name="clock" className="h-6 w-6" />
          </div>
          <p className="font-display text-base text-cream">{c.history.noCarTitle}</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-cream/55">{c.history.noCarBody}</p>
          <Button className="mt-4" onClick={() => go({ name: "addCar" })}>
            {c.history.addCar}
          </Button>
        </Card>
      </div>
    );
  }

  const all = servicesFor(s, v.id);
  const list = filter === "all" ? all : all.filter((r) => r.type === filter);
  const upcoming = <UpcomingBlock />;
  const usedTypes = Array.from(new Set(all.map((r) => r.type)));
  const sequenciaDoQuiz = sequenciaHoje(s.quiz ?? QUIZ_ZERADO, diaLocal());
  const atLimit = !s.premium && all.length >= LIMITS.freeServices;
  const onAdd = () => go(atLimit ? { name: "subscribe", ctx: "history" } : { name: "addService" });

  return (
    <div>
      <AppHeader
        title={(v.type === "moto" ? c.history.titleMoto : c.history.titleCar).replace("{carro}", carName(v))}
        action={
          <button onClick={onAdd} className="grid h-9 w-9 place-items-center rounded-full bg-amber text-graphite" aria-label={c.history.add}>
            <Icon name="plus" className="h-5 w-5" />
          </button>
        }
      />

      {/* A chamada do quiz subiu para a barra de cima (QuizNoTopo), que este
          ecrã também tem. O convite de aviso fica: o contexto "o que vem por
          aí" continua sendo o certo para ele. */}
      <ConviteDeAviso momento="calendario" sequencia={sequenciaDoQuiz} />

      {upcoming}

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
          {/* Premium depois do valor entregue: quem já registrou dois ou mais
              serviços tem histórico de verdade, então a promessa (relatório de
              gastos, histórico sem limite) é concreta. Fica DEPOIS do primeiro
              serviço de propósito: é no primeiro que o app pede nota na loja, e
              dois pedidos no mesmo instante se anulam. Rodada de 23/08. */}
          {!s.premium && all.length >= 2 && (
            <UpgradeBanner ctx="pos-servico" text={c.history.upsellHistorico} />
          )}

          <div className="space-y-2">
            {list.map((r) => (
              <button key={r.id} onClick={() => go({ name: "service", id: r.id })} className="flex w-full items-center gap-3 rounded-xl bg-graphite-800 px-3.5 py-3 text-left ring-1 ring-white/5 hover:ring-white/15">
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-display text-[15px] text-cream">{typeLabel(r.type)}</span>
                    {r.system && <span className="shrink-0 rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-cream/55">{c.health.systemLabels[r.system]}</span>}
                  </span>
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
  const { back, go, root } = useNav();
  const v = activeVehicle(s);
  const editing = editId ? s.services.find((r) => r.id === editId) ?? null : null;
  const src = editing ?? preset;

  const today = new Date().toISOString().slice(0, 10);

  // Resolve a typed/picked label into a service (known key + subsystem, or free text).
  const resolveService = (label: string): PickedService => {
    const st = c.serviceTypes.find((t) => t.label.toLowerCase() === label.trim().toLowerCase());
    if (st) return { type: st.key, label: st.label, system: st.key === "other" ? inferSystem(label) : SERVICE_SYSTEM[st.key] ?? null };
    return { type: label.trim(), label: label.trim(), system: inferSystem(label) };
  };

  const initialServices = (): PickedService[] => {
    if (!src?.type) return [];
    const st = c.serviceTypes.find((t) => t.key === src.type);
    return [{ type: src.type, label: st?.label ?? src.type, system: (editing?.system ?? (st ? SERVICE_SYSTEM[src.type] : inferSystem(src.type))) ?? null }];
  };

  const [services, setServices] = useState<PickedService[]>(initialServices);
  const [date, setDate] = useState(src?.date ?? today);
  const [km, setKm] = useState(src?.km != null ? String(src.km) : v?.odometerKm != null ? String(v.odometerKm) : "");
  const [shop, setShop] = useState(src?.shop ?? "");
  const [total, setTotal] = useState(src?.total != null ? String(src.total) : "");
  const [parts, setParts] = useState<ServicePart[]>(src?.parts ?? []);
  const [notes, setNotes] = useState(src?.notes ?? "");
  const [photo, setPhoto] = useState<string | undefined>(src?.photo);
  const [category, setCategory] = useState<ServiceRecord["category"]>(src?.category);
  const inputRef = useRef<HTMLInputElement>(null);

  const addService2 = (label: string) => setServices((ss) => (ss.some((x) => x.label.toLowerCase() === label.trim().toLowerCase()) ? ss : [...ss, resolveService(label)]));
  const setSvcSystem = (i: number, sys: SystemKey | null) => setServices((ss) => ss.map((x, j) => (j === i ? { ...x, system: sys } : x)));
  const removeSvc = (i: number) => setServices((ss) => ss.filter((_, j) => j !== i));

  const addPart = () => {
    if (!s.premium && parts.length >= LIMITS.freeParts) { go({ name: "subscribe", ctx: "parts" }); return; }
    setParts((ps) => [...ps, { name: "" }]);
  };

  // Autocomplete sources: known service labels + past services; shops; parts.
  const serviceOptions = Array.from(new Set([...c.serviceTypes.filter((t) => t.key !== "other").map((t) => t.label), ...s.services.map((r) => c.serviceTypes.find((t) => t.key === r.type)?.label ?? r.type)]));
  const shopOptions = Array.from(new Set(s.services.map((r) => r.shop).filter((x): x is string => !!x && !!x.trim())));
  const pastParts = Array.from(new Set(s.services.flatMap((r) => r.parts.map((p) => p.name)).filter((x) => x.trim())));
  const partOptions = Array.from(new Set([...(c.partsByType[services[0]?.type ?? "other"] ?? []), ...pastParts]));

  if (!v) {
    // Sem carro cadastrado — mesmo estado vazio da aba Histórico.
    return (
      <div>
        <AppHeader title={a.title} />
        <Card className="mt-2 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-graphite-700 text-cream/60">
            <Icon name="clock" className="h-6 w-6" />
          </div>
          <p className="font-display text-base text-cream">{c.history.noCarTitle}</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-cream/55">{a.noCarBody}</p>
          <Button className="mt-4" onClick={() => go({ name: "addCar" })}>
            {c.history.addCar}
          </Button>
        </Card>
      </div>
    );
  }

  const kmNum = parseInt(km, 10);
  const valid = services.length > 0 && !!date && Number.isFinite(kmNum) && kmNum >= 0;

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
    const rec = (svc: PickedService, withVisit: boolean) => ({
      vehicleId: v.id,
      type: svc.type,
      system: svc.system ?? undefined,
      date,
      km: kmNum,
      shop: shop.trim() || undefined,
      total: withVisit && total ? parseInt(total, 10) : undefined,
      parts: withVisit ? parts.filter((p) => p.name.trim()) : [],
      notes: notes.trim() || undefined,
      photo,
      category: s.premium ? category : undefined,
    });
    if (editing) {
      // Update the edited record with the first service; any extra ones are new.
      updateService(editing.id, rec(services[0], true));
      services.slice(1).forEach((svc) => addService(rec(svc, false)));
    } else {
      services.forEach((svc, i) => addService(rec(svc, i === 0)));
    }
    // Depois de salvar, vai para o histórico — não para a tela anterior.
    //
    // `back()` devolvia para de onde o usuário veio, e um dos caminhos é o
    // orçamento do checklist ("Salvar no histórico"). Quem salvava por ali
    // caía de volta no formulário de orçamento, sem sinal nenhum de que o
    // serviço tinha sido registrado — parecia que o salvamento falhou. O
    // histórico é o destino que faz sentido para todos os caminhos: é onde o
    // serviço recém-criado aparece.
    root({ name: "history" });

    // Primeiro serviço registrado, e num dia diferente do cadastro.
    //
    // O "dia diferente" não é detalhe: quem monta o histórico antigo do carro
    // na primeira sessão chega aqui com três minutos de app, e a nota que daria
    // seria de primeira impressão, não do produto. Quem voltou no dia seguinte
    // para registrar a troca de óleo, sim, tem o que avaliar.
    //
    // `s.services` ainda é o estado de antes do `addService` — por isso a
    // comparação é com zero. E `startedAt` sobrevive a login em outro aparelho
    // e a reinstalação, porque o merge guarda sempre a data mais antiga.
    if (!editing && s.services.length === 0 && s.startedAt && s.startedAt !== hojeISO()) {
      pedirFeedback(s, "primeiro-servico");
    }
  };

  return (
    <div>
      {/* Sem anúncio aqui: registrar um serviço é o dado que faz o app
          funcionar (saúde, revisões, histórico). */}
      <AppHeader title={editing ? a.editTitle : a.title} />

      <div className="space-y-4 pb-4">
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-cream/45">{a.services}</p>
          <p className="mb-2 text-xs text-cream/45">{a.servicesHint}</p>
          {services.length > 0 && (
            <div className="mb-2 space-y-2">
              {services.map((sv, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl bg-graphite-800 p-2 pl-3 ring-1 ring-white/5">
                  <span className="min-w-0 flex-1 truncate text-sm text-cream">{sv.label}</span>
                  <select
                    value={sv.system ?? ""}
                    onChange={(e) => setSvcSystem(i, (e.target.value || null) as SystemKey | null)}
                    className="shrink-0 rounded-lg bg-graphite-700 px-2 py-1.5 text-xs text-cream ring-1 ring-white/10 outline-none focus:ring-amber"
                  >
                    <option value="">{a.systemGeneral}</option>
                    {SYSTEMS.map((k) => (<option key={k} value={k}>{c.health.systemLabels[k]}</option>))}
                  </select>
                  <button onClick={() => removeSvc(i)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-graphite-700 text-cream/60" aria-label="remove">✕</button>
                </div>
              ))}
            </div>
          )}
          <ServicePicker options={serviceOptions} exclude={services.map((x) => x.label)} onAdd={addService2} placeholder={a.servicePh} />
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
            <Autocomplete value={shop} onChange={setShop} options={shopOptions} placeholder={a.shopPh} />
          </Field>
          <Field label={a.total}>
            <input value={total} inputMode="numeric" onChange={(e) => setTotal(e.target.value.replace(/\D/g, ""))} placeholder={a.totalPh} className={inputCls} />
          </Field>
        </div>

        {/* Premium: classify the service */}
        {s.premium && (
          <div>
            <p className="mb-1.5 text-xs uppercase tracking-wide text-cream/45">{a.classify}</p>
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
              <div key={i} className="rounded-xl bg-graphite-800 p-2.5 ring-1 ring-white/5">
                <div className="flex items-start gap-2">
                  <Autocomplete
                    className="flex-1"
                    value={p.name}
                    onChange={(val) => setParts((ps) => ps.map((x, j) => (j === i ? { ...x, name: val } : x)))}
                    options={partOptions}
                    placeholder={a.partName}
                  />
                  <button onClick={() => setParts((ps) => ps.filter((_, j) => j !== i))} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-graphite-700 text-cream/60" aria-label="remove">✕</button>
                </div>
                <div className="mt-2 flex items-center gap-2 rounded-xl bg-graphite-900 px-3 ring-1 ring-white/10 focus-within:ring-amber">
                  <span className="text-sm text-cream/40">R$</span>
                  <input
                    value={p.value != null ? String(p.value) : ""}
                    inputMode="numeric"
                    onChange={(e) => setParts((ps) => ps.map((x, j) => (j === i ? { ...x, value: e.target.value ? parseInt(e.target.value.replace(/\D/g, ""), 10) : undefined } : x)))}
                    placeholder={a.partValue}
                    className="w-full bg-transparent py-3 text-cream outline-none placeholder:text-cream/40"
                  />
                </div>
              </div>
            ))}
            <button onClick={addPart} className="text-sm font-medium text-amber">
              {!s.premium && parts.length >= LIMITS.freeParts ? `🔒 ${a.addPart}` : `+ ${a.addPart}`}
            </button>
          </div>
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
          {r.system && <Info label={c.addService.subsystem} value={c.health.systemLabels[r.system]} />}
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
