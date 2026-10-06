"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { abastecimentosFor, activeVehicle, servicesFor, usePrototype } from "@/lib/app/store";
import { computeQuizHealth } from "@/lib/app/healthQuiz";
import { LIMITS } from "@/lib/app/premium";
import { carName, formatBRL, formatMonths, minPurchaseDate, monthsSinceDate, vehicleLabel } from "@/lib/app/content";
import { funil } from "@/lib/app/funil";
import { useNav, type View } from "@/lib/app/nav";
import { Button } from "@/components/ui/Button";
import { Atalho, Card, DateField, Icon, inputCls, Linha, Sheet, useContent } from "../ui";
import { AvatarPickerSheet } from "../AvatarPicker";
import { healthColor } from "./Cars";

export function CarHub() {
  const c = useContent();
  const { s, updateVehicle } = usePrototype();
  const { go } = useNav();
  const [avatarSheet, setAvatarSheet] = useState(false);
  const [nickOpen, setNickOpen] = useState(false);
  const [nickInput, setNickInput] = useState("");
  const [pendenciasAbertas, setPendenciasAbertas] = useState(false);
  const v = activeVehicle(s);

  if (!v) {
    return (
      <Card className="mt-6 text-center">
        <p className="font-display text-base text-cream">{c.cars.emptyTitle}</p>
        <Button className="mt-3" onClick={() => go({ name: "addCar" })}>
          {c.cars.add}
        </Button>
      </Card>
    );
  }

  const score = computeQuizHealth(v.quiz ?? {}, v).score;

  // A BARRA "DIAGNÓSTICO DO CARRO" (12/09/2026, revisão de retenção). Dos 17
  // carros na nuvem, 5 tinham data de compra, 5 o quiz de saúde e 4 um
  // serviço: o cadastro termina pela metade e o app pede o resto em pedidos
  // soltos. Aqui vira uma trilha curta: cinco dados, o que cada um destrava,
  // um toque leva ao lugar certo. Some quando os cinco existem.
  const d = c.carHub.diagnostico;
  const passos: { feito: boolean; rotulo: string; ganho: string; ir: () => void }[] = [
    { feito: v.odometerKm != null && v.odometerKm > 0, rotulo: d.km, ganho: d.kmGanho, ir: () => go({ name: "addCar", editId: v.id }) },
    { feito: !!v.purchaseDate, rotulo: d.compra, ganho: d.compraGanho, ir: () => go({ name: "revisions" }) },
    { feito: !!(v.quiz && Object.keys(v.quiz).length), rotulo: d.quiz, ganho: d.quizGanho, ir: () => go({ name: "healthQuiz" }) },
    { feito: !!v.engine?.trim(), rotulo: d.motor, ganho: d.motorGanho, ir: () => go({ name: "addCar", editId: v.id }) },
    { feito: !!v.photo, rotulo: d.foto, ganho: d.fotoGanho, ir: () => setAvatarSheet(true) },
    // As datas do carro (13/09/2026): o sexto passo, e o que mais dá motivo
    // para ligar os avisos.
    { feito: !!(v.datas && Object.keys(v.datas).length), rotulo: d.datas, ganho: d.datasGanho, ir: () => go({ name: "revisions" }) },
  ];
  const feitos = passos.filter((p) => p.feito).length;

  // AS LINHAS DE PRODUTO (06/10/2026, docs/design/limpeza-visual-nubank.md):
  // substituem os seis cards quadrados e o botão repetido de "Ver revisões".
  // Cada linha é um produto do carro, com o estado de uma linha e a seta.
  const servicos = servicesFor(s, v.id);
  const abastecimentos = abastecimentosFor(s, v.id);
  const corte = (() => { const d = new Date(); d.setMonth(d.getMonth() - 12); return d.toISOString().slice(0, 10); })();
  const gastoDoze =
    servicos.filter((r) => r.date >= corte && typeof r.total === "number").reduce((acc, r) => acc + (r.total ?? 0), 0) +
    abastecimentos.filter((a) => a.date >= corte).reduce((acc, a) => acc + a.valor, 0);
  const registros = servicos.length + abastecimentos.length;
  const temQuiz = !!(v.quiz && Object.keys(v.quiz).length);
  const pendentes = passos.filter((p) => !p.feito);
  const linhas: { icon: string; title: string; sub: string; view: View }[] = [
    { icon: "gauge", title: c.carHub.cards.health, sub: c.carHub.cards.healthSub, view: { name: "health" } },
    { icon: "calendar", title: c.carHub.cards.revisions, sub: c.carHub.cards.revisionsSub, view: { name: "revisions" } },
    { icon: "clock", title: c.carHub.cards.history, sub: registros > 0 ? c.carHub.registrosLinha.replace("{n}", String(registros)).replace("{valor}", formatBRL(gastoDoze)) : c.carHub.semRegistros, view: { name: "history" } },
    { icon: "diagnose", title: c.carHub.cards.problem, sub: c.carHub.cards.problemSub, view: { name: "symptoms" } },
    { icon: "book", title: c.carHub.cards.learn, sub: c.carHub.cards.learnSub, view: { name: "learn" } },
    { icon: "settings", title: c.carHub.cards.settings, sub: c.carHub.cards.settingsSub, view: { name: "carSettings" } },
  ];
  const atalho = (nome: string, ir: () => void) => () => {
    funil("clicou_atalho", { origem: `carro:${nome}` });
    ir();
  };

  return (
    <div className="pt-3">
      <CarSelector />

      {/* O carro: foto (toque troca), nome com apelido editável, e as linhas de
          contexto (km, desde quando, FIPE), que continuam editáveis no toque. */}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setAvatarSheet(true)}
          className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-graphite-800 text-teal"
          aria-label={c.addCar.chooseAvatar}
        >
          {v.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v.photo} alt="" className="h-full w-full object-cover" />
          ) : (
            <Icon name={v.type === "moto" ? "moto" : "car"} className="h-8 w-8" />
          )}
          <span className="absolute bottom-0.5 right-0.5 grid h-4 w-4 place-items-center rounded-full bg-amber text-graphite">
            <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </span>
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-display text-lg font-semibold text-cream">{carName(v)}</p>
            <button
              type="button"
              onClick={() => { setNickInput(v.nickname ?? ""); setNickOpen(true); }}
              className="shrink-0 text-amber/70 hover:text-amber"
              aria-label={c.common.edit}
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </button>
          </div>
          {v.nickname && <p className="truncate text-xs text-cream/50">{vehicleLabel(v)}</p>}
          <KmLine />
          <PurchaseLine />
          <FipeLine />
        </div>
      </div>

      {/* O número grande: a saúde. Sem quiz, a legenda diz o que destrava. */}
      <button onClick={() => go(temQuiz ? { name: "health" } : { name: "healthQuiz" })} className="mt-4 block w-full text-left" data-saude>
        <span className="block text-[11px] uppercase tracking-wide text-cream/45">{c.carHub.health}</span>
        <span className={`block font-display text-4xl font-bold leading-tight ${temQuiz ? healthColor(score) : "text-cream/50"}`}>{temQuiz ? `${score}%` : "--"}</span>
        <span className="mt-0.5 block text-xs text-cream/55">{temQuiz ? c.carHub.cards.healthSub : c.carHub.saudeSemQuiz}</span>
      </button>

      {/* A fila de atalhos do carro. */}
      <div className="mt-4 flex items-start gap-1" data-atalhos>
        <Atalho icone="tools" rotulo={c.home.atalhos.servico} onClick={atalho("servico", () => go({ name: "addService" }))} data-atalho="servico" />
        <Atalho icone="gauge" rotulo={c.home.atalhos.abastecer} onClick={atalho("abastecer", () => go({ name: "abastecimento", origem: "carro" }))} data-atalho="abastecer" />
        <Atalho icone="calendar" rotulo={c.home.atalhos.revisoes} onClick={atalho("revisoes", () => go({ name: "revisions" }))} data-atalho="revisoes" />
        <Atalho icone="spark" rotulo={c.nav.problems} onClick={atalho("biela", () => go({ name: "biela" }))} data-atalho="biela" />
      </div>

      <div className="mt-3">
        {/* As pendências do cadastro, numa linha com contagem (era um checklist
            aberto ocupando a tela). O toque abre a lista; cada item leva ao
            lugar certo. Some quando os seis existem. */}
        {pendentes.length > 0 && (
          <>
            <Linha
              data-pendencias
              titulo={d.titulo.replace("{carro}", carName(v)).replace("{n}", String(feitos)).replace("{total}", String(passos.length))}
              sub={pendenciasAbertas ? c.carHub.pendenciasFechar : c.carHub.pendenciasLinha.replace("{n}", String(pendentes.length)).replace("{lista}", pendentes.map((p) => p.rotulo.toLowerCase()).join(", "))}
              onClick={() => setPendenciasAbertas((x) => !x)}
            />
            {pendenciasAbertas &&
              pendentes.map((p) => (
                <Linha
                  key={p.rotulo}
                  className="pl-4"
                  esquerda={<span className="grid h-5 w-5 shrink-0 place-items-center rounded-full ring-1 ring-amber/50 text-[10px] text-amber">+</span>}
                  titulo={p.rotulo}
                  sub={p.ganho}
                  onClick={p.ir}
                />
              ))}
          </>
        )}

        {linhas.map((l) => (
          <Linha
            key={l.title}
            esquerda={<span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-graphite-800 text-amber"><Icon name={l.icon} className="h-4 w-4" /></span>}
            titulo={l.title}
            sub={l.sub}
            onClick={() => go(l.view)}
          />
        ))}
      </div>

      <AvatarPickerSheet
        open={avatarSheet}
        onClose={() => setAvatarSheet(false)}
        photo={v.photo}
        onSelect={(p) => updateVehicle(v.id, { photo: p })}
        labels={{ title: c.addCar.chooseAvatar, sub: c.addCar.avatarLabel, addPhoto: c.addCar.addPhoto, remove: c.addCar.removePhoto }}
      />

      {/* Edit car name (nickname) */}
      <Sheet open={nickOpen} onClose={() => setNickOpen(false)}>
        <h2 className="font-display text-xl font-bold text-cream">{c.cars.nameCar}</h2>
        <input value={nickInput} onChange={(e) => setNickInput(e.target.value)} placeholder={c.cars.nameCarPh} className={`mt-4 ${inputCls}`} />
        <Button size="lg" className="mt-4 w-full" onClick={() => { updateVehicle(v.id, { nickname: nickInput.trim() || undefined }); setNickOpen(false); }}>
          {c.common.save}
        </Button>
      </Sheet>
    </div>
  );
}

// Purchase-date line with inline edit sheet — feeds time-based revisions.
function PurchaseLine() {
  const c = useContent();
  const { locale } = useI18n();
  const { s, updateVehicle } = usePrototype();
  const v = activeVehicle(s);
  const [open, setOpen] = useState(false);
  if (!v) return null;
  const months = monthsSinceDate(v.purchaseDate);
  // Formato compacto para caber em UMA linha no cartão: até 11 meses usa
  // "X meses"; a partir de 1 ano usa anos com decimal proporcional ("5,6 anos").
  const ownedCompact = (() => {
    if (months == null) return null;
    if (months < 12) return formatMonths(months, locale);
    const y = Math.round((months / 12) * 10) / 10;
    const txt = Number.isInteger(y) ? String(y) : y.toFixed(1).replace(".", locale === "pt" ? "," : ".");
    if (y === 1) return locale === "pt" ? "1 ano" : "1 year";
    return locale === "pt" ? `${txt} anos` : `${txt} years`;
  })();

  return (
    <>
      {months != null ? (
        // `min-w-0` no <span> é o que faz o truncate funcionar de verdade: item
        // de flex tem min-width auto por padrão, então ele se recusa a encolher
        // e o texto ATRAVESSA a borda em vez de virar reticências. Era o corte
        // da foto do dono ("Você tem esse carro há menos de 1 mês" passando por
        // cima do percentual de saúde num Android de 360px).
        <button onClick={() => setOpen(true)} className="mt-0.5 flex w-full items-start gap-1.5 text-left text-xs leading-snug text-cream/55 hover:text-cream">
          <Icon name="calendar" className="mt-px h-3.5 w-3.5 shrink-0" />
          <span className="min-w-0">{c.revisions.ownedForShort.replace("{n}", ownedCompact ?? "")}</span>
        </button>
      ) : (
        // Sem data de compra: chamada em destaque — a data alimenta as revisões por tempo.
        <button
          onClick={() => setOpen(true)}
          className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-amber/15 px-2.5 py-1.5 text-xs font-semibold text-amber ring-1 ring-amber/40 hover:bg-amber/20"
        >
          <Icon name="calendar" className="h-3.5 w-3.5" />
          {c.revisions.setPurchaseCta}
        </button>
      )}
      <Sheet open={open} onClose={() => setOpen(false)}>
        <h2 className="font-display text-xl font-bold text-cream">{c.revisions.setPurchase}</h2>
        <DateField
          value={v.purchaseDate ?? ""}
          min={minPurchaseDate(v.year)}
          max={new Date().toISOString().slice(0, 10)}
          onCommit={(val) => updateVehicle(v.id, { purchaseDate: val || undefined })}
          className={`mt-4 ${inputCls}`}
        />
        <Button size="lg" className="mt-4 w-full" onClick={() => setOpen(false)}>{c.common.save}</Button>
      </Sheet>
    </>
  );
}

// Valor FIPE do veículo (referência mensal). Cache local de 24h por carro;
// "~" quando a versão não casou exatamente com um nome da tabela.
// Reusada na Home (cartão "Seu carro") — por isso renderiza <span>.
export function FipeLine() {
  const { s } = usePrototype();
  const v = activeVehicle(s);
  const [info, setInfo] = useState<{ value: string; month: string | null; approximate: boolean } | null>(null);

  useEffect(() => {
    if (!v) return;
    setInfo(null);
    const key = `mq-fipe-${v.id}`;
    try {
      const cached = JSON.parse(localStorage.getItem(key) ?? "null") as { at: number; info: typeof info } | null;
      if (cached?.info && Date.now() - cached.at < 24 * 60 * 60 * 1000) {
        setInfo(cached.info);
        return;
      }
    } catch { /* cache inválido — segue para a busca */ }
    const ctl = new AbortController();
    fetch(
      `/api/fipe-value?type=${v.type}&make=${encodeURIComponent(v.make)}&model=${encodeURIComponent(v.model)}&year=${v.year}&version=${encodeURIComponent(v.engine ?? "")}`,
      { signal: ctl.signal }
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((js) => {
        if (!js?.value) return;
        const next = { value: js.value as string, month: (js.month as string | null) ?? null, approximate: !!js.approximate };
        setInfo(next);
        try { localStorage.setItem(key, JSON.stringify({ at: Date.now(), info: next })); } catch { /* sem espaço */ }
      })
      .catch(() => {});
    return () => ctl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v?.id, v?.engine, v?.year]);

  if (!v || !info) return null;
  return (
    <span className="mt-0.5 flex items-center gap-1.5 text-xs text-cream/55">
      FIPE {info.approximate ? "~" : ""}{info.value}
      {info.month && <span className="text-cream/35">· {info.month}</span>}
    </span>
  );
}

// Km line with inline edit sheet.
function KmLine() {
  const c = useContent();
  const { s, updateVehicle } = usePrototype();
  const v = activeVehicle(s);
  const [open, setOpen] = useState(false);
  const [km, setKm] = useState(v?.odometerKm != null ? String(v.odometerKm) : "");

  if (!v) return null;
  const save = () => {
    updateVehicle(v.id, { odometerKm: km ? parseInt(km, 10) : undefined });
    setOpen(false);
  };

  return (
    <>
      <button onClick={() => { setKm(v.odometerKm != null ? String(v.odometerKm) : ""); setOpen(true); }} className="flex items-center gap-1.5 text-sm text-cream/60 hover:text-cream">
        {v.odometerKm != null ? `${v.odometerKm.toLocaleString()} ${c.carHub.km}` : c.cars.noKm}
        <Icon name="settings" className="h-3.5 w-3.5" />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)}>
        <h2 className="font-display text-xl font-bold text-cream">{c.carHub.updateKmTitle}</h2>
        <input value={km} inputMode="numeric" onChange={(e) => setKm(e.target.value.replace(/\D/g, ""))} placeholder={c.addCar.kmPh} className={`mt-4 ${inputCls}`} />
        <Button size="lg" className="mt-4 w-full" onClick={save}>
          {c.common.save}
        </Button>
      </Sheet>
    </>
  );
}

// Car selector: shows the active car; tap to switch or add.
export function CarSelector() {
  const c = useContent();
  const { s, setActiveVehicle } = usePrototype();
  const { go } = useNav();
  const [open, setOpen] = useState(false);
  const v = activeVehicle(s);
  if (!v) return null;

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex w-full items-center justify-between rounded-xl bg-graphite-800 px-4 py-2.5 ring-1 ring-white/10 hover:ring-white/20">
        <span className="font-display text-sm text-cream">{vehicleLabel(v)}</span>
        <span className="flex items-center gap-1 text-xs text-amber">
          {s.vehicles.length > 1 ? `${s.vehicles.length} ${c.nav.cars.toLowerCase()}` : ""} ▾
        </span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)}>
        <h2 className="font-display text-xl font-bold text-cream">{c.nav.cars}</h2>
        <div className="mt-3 space-y-2">
          {s.vehicles.map((car) => (
            <button
              key={car.id}
              onClick={() => { setActiveVehicle(car.id); setOpen(false); }}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left ring-1 ${car.id === v.id ? "bg-amber/12 ring-amber" : "bg-graphite-700 ring-white/5"}`}
            >
              <Icon name={car.type === "moto" ? "moto" : "car"} className="h-5 w-5 text-cream/70" />
              <span className="flex-1 font-display text-[15px] text-cream">{vehicleLabel(car)}</span>
              {car.id === v.id && <span className="text-amber">✓</span>}
            </button>
          ))}
        </div>
        <Button variant="ghost" className="mt-3 w-full" onClick={() => { setOpen(false); go(!s.premium && s.vehicles.length >= LIMITS.freeCars ? { name: "subscribe", ctx: "cars" } : { name: "addCar" }); }}>
          + {c.cars.add}
        </Button>
      </Sheet>
    </>
  );
}
