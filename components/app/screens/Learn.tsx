"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { activeVehicle, usePrototype } from "@/lib/app/store";
import { carName, vehicleLabel } from "@/lib/app/content";
import { useNav } from "@/lib/app/nav";
import { Button } from "@/components/ui/Button";
import { AppHeader, Card, Chip, Icon, PremiumBadge, SectionTitle, UpgradeBanner, useContent } from "../ui";
import { VideoPlayer } from "../VideoPlayer";

const FREE_BIELA_QUESTIONS = 3;

type Item = ReturnType<typeof useContent>["lessons"][number];

function typeLabel(c: ReturnType<typeof useContent>, t: string) {
  return t === "video" ? c.learn.video : t === "checklist" ? c.learn.checklist : c.learn.article;
}
function typeIcon(t: string) {
  return t === "video" ? "diagnose" : t === "checklist" ? "check" : "book";
}

// Row for a single study item (video / article / checklist), with lock state.
function ItemRow({ item }: { item: Item }) {
  const c = useContent();
  const { s } = usePrototype();
  const { go } = useNav();
  const locked = item.premium && !s.premium;
  return (
    <button
      onClick={() => go(locked ? { name: "subscribe", ctx: "learn" } : { name: "content", id: item.id })}
      className="flex w-full items-center gap-3 rounded-2xl bg-graphite-800 p-3.5 text-left ring-1 ring-white/5 hover:ring-amber/30"
    >
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${locked ? "bg-amber/10 text-amber/70" : "bg-amber/12 text-amber"}`}>
        <Icon name={typeIcon(item.type)} className="h-6 w-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-[15px] text-cream">{item.title}</span>
        <span className="block text-xs text-cream/50">{typeLabel(c, item.type)}</span>
      </span>
      {locked ? <PremiumBadge /> : <span className="text-cream/40">›</span>}
    </button>
  );
}

// Big entry card that opens the Biela AI chat.
function BielaCard() {
  const c = useContent();
  const { go } = useNav();
  return (
    <button
      onClick={() => go({ name: "biela" })}
      className="flex w-full items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br from-amber/20 to-amber/5 p-4 text-left ring-1 ring-amber/25 hover:ring-amber/45"
    >
      <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-graphite-900/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/biela/biela-idle.png" alt="" className="h-full w-full object-contain" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="font-display text-base font-semibold text-cream">{c.biela.cardTitle}</span>
          <PremiumBadge />
        </span>
        <span className="mt-0.5 block text-sm text-cream/70">{c.biela.cardSub}</span>
      </span>
      <span className="shrink-0 text-amber">›</span>
    </button>
  );
}

// Pick the most relevant items for the active car: model-specific first, then
// brand, then fundamentals/DIY basics.
function recommendedFor(v: ReturnType<typeof activeVehicle>, lessons: Item[]): Item[] {
  const model = v ? lessons.filter((l) => l.model === v.model) : [];
  const brand = v ? lessons.filter((l) => l.make === v.make && !l.model) : [];
  const base = lessons.filter((l) => (l.track === "fundamentals" || l.track === "diy") && !l.make);
  const seen = new Set<string>();
  const out: Item[] = [];
  for (const l of [...model, ...brand, ...base]) {
    if (seen.has(l.id)) continue;
    seen.add(l.id);
    out.push(l);
    if (out.length >= 5) break;
  }
  return out;
}

// 2.6.A — Estudos: hub em árvore (busca + Biela + trilhas)
export function LearnScreen() {
  const c = useContent();
  const { s } = usePrototype();
  const { go } = useNav();
  const v = activeVehicle(s);
  const [q, setQ] = useState("");

  const query = q.trim().toLowerCase();
  const searching = query.length > 0;
  const results = searching ? c.lessons.filter((l) => l.title.toLowerCase().includes(query)) : [];
  const recommended = recommendedFor(v, c.lessons);

  return (
    <div>
      <AppHeader title={c.learn.title} />

      {/* Busca */}
      <div className="relative mb-3">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/40">
          <Icon name="explore" className="h-5 w-5" />
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={c.learn.searchPh}
          className="w-full rounded-xl bg-graphite-800 py-3 pl-11 pr-3.5 text-cream ring-1 ring-white/10 outline-none placeholder:text-cream/40 focus:ring-amber"
        />
      </div>

      {searching ? (
        <div className="space-y-2.5">
          {results.length > 0 ? results.map((l) => <ItemRow key={l.id} item={l} />) : (
            <p className="py-8 text-center text-sm text-cream/50">{c.learn.searchEmpty}</p>
          )}
        </div>
      ) : (
        <>
          <BielaCard />

          {/* Para o seu carro — um box único que abre a lista */}
          <button
            onClick={() => go({ name: "forYourCar" })}
            className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-graphite-800 p-4 text-left ring-1 ring-white/5 hover:ring-amber/30"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-teal/15 text-teal">
              <Icon name={v?.type === "moto" ? "moto" : "car"} className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-[15px] font-semibold text-cream">
                {v ? c.learn.forYourCar.replace("{car}", carName(v)) : c.learn.recommended}
              </span>
              <span className="mt-0.5 block text-xs text-cream/55">{c.learn.forYourCarCount.replace("{n}", String(recommended.length))}</span>
            </span>
            <span className="shrink-0 text-cream/40">›</span>
          </button>

          {/* Trilhas de conhecimento */}
          <SectionTitle>{c.learn.tracks}</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {c.studyTracks.map((t) => (
              <button
                key={t.id}
                onClick={() => go({ name: "studyTrack", trackId: t.id })}
                className="group flex flex-col gap-2 rounded-3xl bg-graphite-800 p-4 text-left ring-1 ring-white/5 transition-all hover:ring-white/15 active:scale-[0.98]"
              >
                <span className={`grid h-11 w-11 place-items-center rounded-2xl ${t.accent}`}>
                  <Icon name={t.icon} className="h-6 w-6" />
                </span>
                <span>
                  <span className="block font-display text-[15px] font-semibold leading-tight text-cream">{t.title}</span>
                  <span className="mt-1 block text-xs leading-snug text-cream/50">{t.subtitle}</span>
                </span>
              </button>
            ))}
          </div>

          {!s.premium && <UpgradeBanner ctx="learn" text={c.paywalls.learn.title} />}
        </>
      )}
    </div>
  );
}

// 2.6.B — Tela de uma trilha (lista de conteúdos, agrupada quando faz sentido)
export function StudyTrackScreen({ trackId }: { trackId: string }) {
  const c = useContent();
  const { s } = usePrototype();
  const track = c.studyTracks.find((t) => t.id === trackId);
  const items = c.lessons.filter((l) => l.track === trackId);
  if (!track) return <AppHeader title="—" />;

  // DIY agrupa por sistema; Montadora/Modelo por marca.
  const groupBy = trackId === "diy" ? "system" : trackId === "brand" || trackId === "model" ? "make" : null;
  const groups: { label: string; items: typeof items }[] = [];
  if (groupBy) {
    const map = new Map<string, typeof items>();
    for (const it of items) {
      const key = (groupBy === "system" ? it.system : it.make) ?? "—";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }
    for (const [label, its] of map) groups.push({ label, items: its });
  }

  return (
    <div>
      <AppHeader title={track.title} subtitle={track.subtitle} />
      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-cream/50">{c.learn.empty}</p>
      ) : groups.length > 0 ? (
        groups.map((g) => (
          <div key={g.label}>
            <SectionTitle>{g.label}</SectionTitle>
            <div className="space-y-2.5">{g.items.map((l) => <ItemRow key={l.id} item={l} />)}</div>
          </div>
        ))
      ) : (
        <div className="space-y-2.5">{items.map((l) => <ItemRow key={l.id} item={l} />)}</div>
      )}
      {!s.premium && <UpgradeBanner ctx="learn" text={c.paywalls.learn.title} />}
    </div>
  );
}

// 2.6.B′ — Para o seu carro (conteúdos escolhidos pelo carro ativo)
export function ForYourCarScreen() {
  const c = useContent();
  const { s } = usePrototype();
  const v = activeVehicle(s);
  const items = recommendedFor(v, c.lessons);
  return (
    <div>
      <AppHeader
        title={v ? c.learn.forYourCar.replace("{car}", carName(v)) : c.learn.recommended}
        subtitle={c.learn.forYourCarSub}
      />
      <div className="mt-1 space-y-2.5">
        {items.map((l) => <ItemRow key={l.id} item={l} />)}
      </div>
      {!s.premium && <UpgradeBanner ctx="learn" text={c.paywalls.learn.title} />}
    </div>
  );
}

// 2.6.C — Detalhe do conteúdo (tutorial com passos OU artigo com parágrafos)
export function ContentScreen({ id }: { id: string }) {
  const c = useContent();
  const { locale } = useI18n();
  const { s } = usePrototype();
  const v = activeVehicle(s);
  const lesson = c.lessons.find((l) => l.id === id);
  const [done, setDone] = useState(false);
  const [saved, setSaved] = useState(false);
  const [level, setLevel] = useState<"iniciante" | "avancado" | "mecanico">("avancado");
  const [leveled, setLeveled] = useState<Record<string, string[]>>({});
  const [loadingLevel, setLoadingLevel] = useState(false);
  if (!lesson) return <AppHeader title="—" />;

  const hasSteps = lesson.steps.length > 0;
  const shownSteps = level === "avancado" ? lesson.steps : leveled[level] ?? lesson.steps;

  // Switch depth level; fetch a Biela-adapted version for iniciante/mecânico.
  const chooseLevel = async (lv: "iniciante" | "avancado" | "mecanico") => {
    setLevel(lv);
    if (lv === "avancado" || leveled[lv]) return;
    setLoadingLevel(true);
    try {
      const res = await fetch("/api/lesson-steps", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: lesson.title, steps: lesson.steps, need: lesson.need, safety: lesson.safety, level: lv, locale,
          car: v ? { make: v.make, model: v.model, year: v.year } : null,
        }),
      });
      const data = await res.json();
      if (data.mode === "ai" && Array.isArray(data.steps)) setLeveled((m) => ({ ...m, [lv]: data.steps }));
    } catch { /* keep base steps */ } finally { setLoadingLevel(false); }
  };

  return (
    <div>
      <AppHeader title={lesson.title} />

      {/* Player (in-app), or a placeholder for text content */}
      {lesson.media ? (
        <VideoPlayer media={lesson.media} />
      ) : (
        <div className="grid aspect-video place-items-center rounded-2xl bg-gradient-to-br from-graphite-700 to-graphite-800 text-cream/30 ring-1 ring-white/10">
          <Icon name={typeIcon(lesson.type)} className="h-12 w-12" />
        </div>
      )}

      {/* Article body */}
      {lesson.body && lesson.body.length > 0 && (
        <div className="mt-5 space-y-3">
          {lesson.body.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-cream/85">{p}</p>
          ))}
        </div>
      )}

      {lesson.need.length > 0 && (
        <Block title={c.learn.need}>
          <ul className="space-y-1.5">
            {lesson.need.map((x) => (
              <li key={x} className="flex gap-2 text-sm text-cream/80"><span className="text-teal">✓</span>{x}</li>
            ))}
          </ul>
        </Block>
      )}

      {hasSteps && (
        <div className="mt-5">
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-cream/45">{c.learn.steps}</p>
            {/* Seletor de nível: mais iniciante = mais detalhado */}
            <div className="flex gap-1 rounded-lg bg-graphite-800 p-0.5 ring-1 ring-white/10">
              {(["iniciante", "avancado", "mecanico"] as const).map((lv) => (
                <button
                  key={lv}
                  onClick={() => chooseLevel(lv)}
                  className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${level === lv ? "bg-amber text-graphite" : "text-cream/60 hover:text-cream"}`}
                >
                  {c.learn.levels[lv]}
                </button>
              ))}
            </div>
          </div>
          {loadingLevel ? (
            <p className="flex items-center gap-2 rounded-xl bg-graphite-800 px-3.5 py-3 text-sm text-cream/55 ring-1 ring-white/5">
              <span className="text-amber">🐻</span> {c.learn.levelLoading}
            </p>
          ) : (
            <ol className="space-y-2">
              {shownSteps.map((x, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-cream/85">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber/15 font-display text-xs font-semibold text-amber">{i + 1}</span>
                  {x}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {lesson.safety.length > 0 && (
        <Block title={c.learn.safety}>
          <ul className="space-y-1.5">
            {lesson.safety.map((x) => (
              <li key={x} className="flex gap-2 rounded-lg bg-coral/10 px-3 py-2 text-sm text-cream/85 ring-1 ring-coral/15"><span className="text-coral">!</span>{x}</li>
            ))}
          </ul>
        </Block>
      )}

      <div className="mt-6 flex gap-2">
        <Button className="flex-1" onClick={() => setDone((d) => !d)}>{done ? `✓ ${c.learn.completed}` : c.learn.complete}</Button>
        <Button variant="ghost" className="flex-1" onClick={() => setSaved((v) => !v)}>{saved ? "★" : "☆"} {c.learn.saveLater}</Button>
      </div>
      {!s.premium && <UpgradeBanner ctx="learn" text={c.paywalls.learn.title} />}
    </div>
  );
}

// 2.6.D — Chat com o Biela (agente de IA / mecânico)
type Msg = { role: "user" | "biela"; text: string; note?: string };

export function BielaChatScreen({ seed }: { seed?: string }) {
  const c = useContent();
  const { locale } = useI18n();
  const { s } = usePrototype();
  const { go } = useNav();
  const v = activeVehicle(s);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "biela", text: c.biela.intro }]);
  const [input, setInput] = useState(seed ?? "");
  const [busy, setBusy] = useState(false);
  const [used, setUsed] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const gated = !s.premium && used >= FREE_BIELA_QUESTIONS;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  const ask = async (question: string) => {
    const text = question.trim();
    if (!text || busy || gated) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text }]);
    setBusy(true);
    if (!s.premium) setUsed((n) => n + 1);
    try {
      const res = await fetch("/api/biela", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          question: text,
          locale,
          car: v ? { make: v.make, model: v.model, year: v.year, km: v.odometerKm } : null,
        }),
      });
      const data = await res.json();
      setMsgs((m) => [...m, { role: "biela", text: data.answer, note: data.mode === "ai" ? undefined : c.biela.offlineNote }]);
    } catch {
      setMsgs((m) => [...m, { role: "biela", text: fallbackAnswer(v, locale), note: c.biela.offlineNote }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <AppHeader
        title={c.biela.title}
        subtitle={v ? `${c.biela.contextPrefix} ${vehicleLabel(v)}${v.odometerKm != null ? " · " + v.odometerKm.toLocaleString() + " km" : ""}` : undefined}
      />

      {/* Conversa */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto pb-2">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex items-end gap-2"}>
            {m.role === "biela" && (
              <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-graphite-800 ring-1 ring-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/biela/biela-idle.png" alt="" className="h-full w-full object-contain" />
              </span>
            )}
            <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "bg-amber text-graphite" : "bg-graphite-800 text-cream/90 ring-1 ring-white/5"}`}>
              <p className="whitespace-pre-wrap">{m.text}</p>
              {m.note && <p className="mt-1.5 text-[11px] italic text-cream/45">{m.note}</p>}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-sm text-cream/50">
            <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-graphite-800 ring-1 ring-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/biela/biela-idle.png" alt="" className="h-full w-full object-contain" />
            </span>
            {c.biela.thinking}
          </div>
        )}
      </div>

      {/* Sugestões (só no início) */}
      {msgs.length <= 1 && !gated && (
        <div className="mb-2 flex flex-wrap gap-2">
          {c.biela.suggestions.map((sug) => (
            <Chip key={sug} onClick={() => ask(sug)}>{sug}</Chip>
          ))}
        </div>
      )}

      {gated ? (
        <div className="mb-2 rounded-2xl bg-amber/10 p-4 text-center ring-1 ring-amber/25">
          <p className="text-sm text-cream/85">{c.biela.freeOver}</p>
          <Button className="mt-3 w-full" onClick={() => go({ name: "subscribe", ctx: "biela" })}>{c.biela.premiumCta}</Button>
        </div>
      ) : (
        <>
          {!s.premium && (
            <p className="mb-1.5 text-center text-[11px] text-cream/45">
              {c.biela.freeLeft.replace("{n}", String(Math.max(0, FREE_BIELA_QUESTIONS - used)))}
            </p>
          )}
          <div className="mb-2 flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input); } }}
              rows={1}
              placeholder={c.biela.inputPh}
              className="max-h-28 flex-1 resize-none rounded-xl bg-graphite-800 px-3.5 py-3 text-cream ring-1 ring-white/10 outline-none placeholder:text-cream/40 focus:ring-amber"
            />
            <button
              onClick={() => ask(input)}
              disabled={busy || !input.trim()}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber text-graphite disabled:opacity-40"
              aria-label={c.biela.send}
            >
              <Icon name="explore" className="h-5 w-5 rotate-90" />
            </button>
          </div>
        </>
      )}
      <p className="pb-1 text-center text-[11px] text-cream/40">{c.biela.disclaimer}</p>
    </div>
  );
}

// Client-side safety net when the API is unreachable.
function fallbackAnswer(v: ReturnType<typeof activeVehicle>, locale: string): string {
  const car = v ? `${v.make} ${v.model} ${v.year}` : locale === "pt" ? "seu carro" : "your car";
  return locale === "pt"
    ? `Boa pergunta! Sobre o ${car}: o caminho seguro é começar pelo manual do fabricante e pelos sintomas exatos (barulho, quando acontece, luz no painel). Se for item de segurança — freio, direção — não arrisque: leve a uma oficina de confiança. Me dá mais detalhes que eu te ajudo a afunilar.`
    : `Great question! About ${car}: the safe path is to start with the maker's manual and the exact symptoms (noise, when it happens, dashboard light). For safety items — brakes, steering — don't risk it: take it to a trusted shop. Give me more detail and I'll help narrow it down.`;
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cream/45">{title}</p>
      {children}
    </div>
  );
}
