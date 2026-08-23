"use client";

import { useEffect, useRef, useState } from "react";
import { apiPost, apiUrl } from "@/lib/app/apiBase";
import { carregarConversa, historicoParaIA, idConversa, limparConversa, salvarConversa, type Msg } from "@/lib/app/bielaChat";
import { pedirFeedback } from "@/lib/app/feedbackPrompt";
import { useI18n } from "@/lib/i18n";
import { activeVehicle, servicesFor, usePrototype } from "@/lib/app/store";
import { personalScore, vehicleSituations, vehicleTraits } from "@/lib/app/traits";
import type { ServiceRecord } from "@/lib/app/types";
import { APP_VERSION, carName, vehicleLabel } from "@/lib/app/content";
import { useNav } from "@/lib/app/nav";
import { isNativeApp, nativePlatform } from "@/lib/app/wrapper";
import { funil } from "@/lib/app/funil";
import { Button } from "@/components/ui/Button";
import { AppHeader, Card, Chip, Icon, PinButton, PremiumBadge, SectionTitle, Sheet, Thumb, UpgradeBanner, useContent } from "../ui";
import { VideoPlayer } from "../VideoPlayer";
import { AdOverlay, adsEnabled } from "../AdGate";
import { canShowAd, markAdShown, registerContentOpen } from "@/lib/app/adPolicy";

const FREE_BIELA_QUESTIONS = 0; // Biela é sempre Premium (sem perguntas grátis)

// Id anônimo do aparelho — o mesmo que o Perfil já usa nas mensagens de
// suporte. Serve só para agrupar votos do mesmo celular; não identifica conta.
function aparelhoId(): string {
  if (typeof window === "undefined") return "—";
  try {
    let id = window.localStorage.getItem("mentorque-uid");
    if (!id) { id = crypto?.randomUUID?.() ?? String(Math.random()).slice(2); window.localStorage.setItem("mentorque-uid", id); }
    return id;
  } catch { return "—"; }
}

type Item = ReturnType<typeof useContent>["lessons"][number];
type Course = ReturnType<typeof useContent>["courses"][number];

// ---- Trilhas guiadas (cursos) ----------------------------------------------
// Uma trilha referencia aulas por id em `order`. Ids desconhecidos são
// ignorados (trilha remota nova não pode quebrar num catálogo antigo), então
// tudo parte de `courseItems`, nunca do `order` cru.

function courseItems(course: Course, lessons: Item[]): Item[] {
  const byId = new Map(lessons.map((l) => [l.id, l]));
  return course.order.map((id) => byId.get(id)).filter((x): x is Item => !!x);
}

function courseProgress(course: Course, lessons: Item[], seen: string[]): { done: number; total: number; next: Item | null } {
  const items = courseItems(course, lessons);
  const seenSet = new Set(seen);
  const done = items.filter((l) => seenSet.has(l.id)).length;
  return { done, total: items.length, next: items.find((l) => !seenSet.has(l.id)) ?? null };
}

// A trilha a que uma aula pertence (a primeira, se houver mais de uma) + posição.
function courseOf(lessonId: string, courses: Course[], lessons: Item[]): { course: Course; index: number; items: Item[] } | null {
  for (const course of courses) {
    const items = courseItems(course, lessons);
    const index = items.findIndex((l) => l.id === lessonId);
    if (index >= 0) return { course, index, items };
  }
  return null;
}

// Medidor segmentado: uma casa por aula, verdes as concluídas.
function CourseMeter({ done, total }: { done: number; total: number }) {
  return (
    <div className="flex flex-1 gap-[3px]" role="img" aria-label={`${done}/${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-1.5 flex-1 rounded-full ${i < done ? "bg-teal" : "bg-white/10"}`} />
      ))}
    </div>
  );
}

// ---- Artigo estruturado -----------------------------------------------------
// O `body` continua string[] (compatível com as aulas antigas e com o catálogo
// remoto); a estrutura vem de prefixos por parágrafo:
//   "## Título"  subtítulo   ·   ">> Texto"  caixa de destaque
//   "!! Texto"   caixa de alerta
// E `[[id-da-aula|texto]]` em qualquer parágrafo vira link para a aula.

function InlineText({ text }: { text: string }) {
  const { go } = useNav();
  const parts: React.ReactNode[] = [];
  const re = /\[\[([a-z0-9-]+)\|([^\]]+)\]\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const id = m[1];
    parts.push(
      <button key={m.index} onClick={() => go({ name: "content", id })} className="font-medium text-amber underline decoration-amber/40 underline-offset-2 hover:decoration-amber">
        {m[2]}
      </button>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function ArticleBody({ body }: { body: string[] }) {
  return (
    <div className="mt-5 space-y-3">
      {body.map((raw, i) => {
        if (raw.startsWith("## ")) {
          return (
            <h2 key={i} className="pt-2 font-serif text-lg font-bold leading-snug text-cream">
              <InlineText text={raw.slice(3)} />
            </h2>
          );
        }
        if (raw.startsWith(">> ")) {
          return (
            <div key={i} className="rounded-xl bg-amber/10 px-3.5 py-3 text-sm leading-relaxed text-cream/90 ring-1 ring-amber/20">
              <InlineText text={raw.slice(3)} />
            </div>
          );
        }
        if (raw.startsWith("!! ")) {
          return (
            <div key={i} className="flex gap-2 rounded-xl bg-coral/10 px-3.5 py-3 text-sm leading-relaxed text-cream/90 ring-1 ring-coral/20">
              <span aria-hidden className="text-coral">!</span>
              <span><InlineText text={raw.slice(3)} /></span>
            </div>
          );
        }
        return (
          <p key={i} className="text-sm leading-relaxed text-cream/85">
            <InlineText text={raw} />
          </p>
        );
      })}
    </div>
  );
}

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
      <span className={`grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-graphite ring-1 ${locked ? "text-amber/70 ring-amber/25" : "text-amber ring-amber/45"}`}>
        {item.thumb ? (
          <Thumb src={item.thumb} className={`h-full w-full object-contain ${locked ? "opacity-60" : ""}`} />
        ) : (
          <Icon name={typeIcon(item.type)} className="h-6 w-6" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-[15px] text-cream">{item.title}</span>
        <span className="block text-xs text-cream/50">{typeLabel(c, item.type)}</span>
      </span>
      {locked ? <PremiumBadge /> : <span className="text-cream/40">›</span>}
    </button>
  );
}

// Big entry card that opens the Biela AI chat. Biela é sempre Premium: sem
// assinatura, o card leva ao paywall; com assinatura, abre o chat.
function BielaCard() {
  const c = useContent();
  const { s } = usePrototype();
  const { go } = useNav();
  return (
    <button
      onClick={() => go(s.premium ? { name: "biela" } : { name: "subscribe", ctx: "biela" })}
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
// Recomendação personalizada: modelo/marca quando existe, mas principalmente
// as CARACTERÍSTICAS do veículo (turbo, CVT, elétrico, alto km…) e a SITUAÇÃO
// do dono (comprou agora, revisão vencida, sem histórico) — assim qualquer
// carro recebe conteúdo relevante, não só os 5 modelos do catálogo.
function recommendedFor(v: ReturnType<typeof activeVehicle>, lessons: Item[], services: ServiceRecord[] = []): Item[] {
  if (!v) return lessons.filter((l) => (l.track === "fundamentals" || l.track === "diy") && !l.make).slice(0, 5);
  const traits = vehicleTraits(v);
  const situations = vehicleSituations(v, services);
  const scored = lessons
    .map((l) => ({ l, n: personalScore(l, { make: v.make, model: v.model, traits, situations }) }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .map((x) => x.l);
  // Completa com fundamentos/DIY genéricos se a personalização render pouco.
  const base = lessons.filter((l) => (l.track === "fundamentals" || l.track === "diy") && !l.make);
  const seen = new Set<string>();
  const out: Item[] = [];
  for (const l of [...scored, ...base]) {
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
  const recommended = recommendedFor(v, c.lessons, v ? servicesFor(s, v.id) : []);

  // Trilhas ordenadas: a que combina com o carro (turbo → "Motor turbo") vem
  // primeiro; entre iguais, em andamento > não começada > concluída.
  const traits = new Set<string>(v ? [...vehicleTraits(v)] : []);
  const situations = new Set<string>(v ? [...vehicleSituations(v, servicesFor(s, v.id))] : []);
  const orderedCourses = c.courses
    .map((course) => {
      const { done, total } = courseProgress(course, c.lessons, s.seenLessons ?? []);
      const fits =
        (course.traits ?? []).some((t) => traits.has(t)) ||
        (course.situations ?? []).some((x) => situations.has(x));
      const started = done > 0 && done < total;
      return { course, done, total, started, rank: (fits ? 0 : 2) + (done === total ? 3 : started ? 0 : 1) };
    })
    .filter((x) => x.total > 0)
    .sort((a, b) => a.rank - b.rank);

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

          {/* Para o seu carro — só aparece quando há carro cadastrado */}
          {v && (
            <button
              onClick={() => go({ name: "forYourCar" })}
              className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-graphite-800 p-4 text-left ring-1 ring-white/5 hover:ring-amber/30"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-teal/15 text-teal">
                {v.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.photo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Icon name={v.type === "moto" ? "moto" : "car"} className="h-6 w-6" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[15px] font-semibold text-cream">
                  {c.learn.forYourCar.replace("{car}", carName(v))}
                </span>
                <span className="mt-0.5 block text-xs text-cream/55">{c.learn.forYourCarCount.replace("{n}", String(recommended.length))}</span>
              </span>
              <span className="shrink-0 text-cream/40">›</span>
            </button>
          )}

          {/* Salvos para ver depois */}
          {(s.savedLessons ?? []).length > 0 && (
            <button
              onClick={() => go({ name: "savedLessons" })}
              className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-graphite-800 p-4 text-left ring-1 ring-white/5 hover:ring-amber/30"
            >
              {/* Marcador (não a estrela do Premium) — conceitos diferentes */}
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-teal/15 text-teal">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M6 3h12a1 1 0 0 1 1 1v16.2a.8.8 0 0 1-1.24.67L12 17.5l-5.76 3.37A.8.8 0 0 1 5 20.2V4a1 1 0 0 1 1-1Z" /></svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[15px] font-semibold text-cream">{c.learn.savedTitle}</span>
                <span className="mt-0.5 block text-xs text-cream/55">{c.learn.viewSaved} · {(s.savedLessons ?? []).length}</span>
              </span>
              <span className="shrink-0 text-cream/40">›</span>
            </button>
          )}

          {/* Trilhas guiadas — cursos com ordem e progresso. Ordenadas por
              relevância para o carro ativo (traits/situations) e, entre iguais,
              as em andamento primeiro. */}
          <SectionTitle>{c.learn.coursesTitle}</SectionTitle>
          <p className="-mt-1 mb-2.5 text-xs text-cream/45">{c.learn.coursesSub}</p>
          <div className="space-y-2.5">
            {orderedCourses.map(({ course, done, total, started }) => (
              <button
                key={course.id}
                onClick={() => go({ name: "course", id: course.id })}
                className="flex w-full flex-col gap-2.5 rounded-2xl bg-graphite-800 p-4 text-left ring-1 ring-white/5 transition-all hover:ring-amber/30 active:scale-[0.99]"
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber/12 text-amber">
                    <Icon name={course.icon} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-[15px] font-semibold text-cream">{course.title}</span>
                    <span className="block text-xs text-cream/50">{c.learn.courseLevels[course.level]}</span>
                  </span>
                  <span className="shrink-0 rounded-md bg-white/5 px-2 py-0.5 font-display text-xs font-semibold tabular-nums text-cream/70">
                    {done === total ? `✓ ${c.learn.courseDoneBadge}` : `${done}/${total}`}
                  </span>
                </span>
                <span className="flex items-center gap-2.5">
                  <CourseMeter done={done} total={total} />
                  <span className="shrink-0 text-xs font-medium text-amber">
                    {done === total ? "↻" : started ? `${c.learn.courseContinue} ›` : `${c.learn.courseStart} ›`}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {/* Categorias — navegação livre */}
          <SectionTitle>{c.learn.tracks}</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {c.studyTracks.map((t) => (
              <button
                key={t.id}
                onClick={() => go({ name: "studyTrack", trackId: t.id })}
                className="group flex flex-col gap-2 rounded-3xl bg-graphite-800 p-4 text-left ring-1 ring-white/5 transition-all hover:ring-white/15 active:scale-[0.98]"
              >
                <span className={`grid h-16 w-16 place-items-center overflow-hidden rounded-2xl p-1.5 ${t.accent}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/tracks/${t.id}.png`} alt="" className="h-full w-full object-contain" draggable={false} />
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
  // Primeira ação de valor do funil: abriu uma trilha (ativação real).
  useEffect(() => { funil("abriu_trilha", { umaVez: true, origem: trackId }); }, [trackId]);
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

// 2.6.B+ — Trilha guiada (curso): objetivo, progresso e a sequência numerada.
export function CourseScreen({ id }: { id: string }) {
  const c = useContent();
  const { s } = usePrototype();
  const { go } = useNav();
  const course = c.courses.find((x) => x.id === id);
  if (!course) return <AppHeader title="—" />;

  const items = courseItems(course, c.lessons);
  const seen = new Set(s.seenLessons ?? []);
  const done = items.filter((l) => seen.has(l.id)).length;
  const next = items.find((l) => !seen.has(l.id));

  return (
    <div>
      <AppHeader title={course.title} />
      <p className="text-sm leading-relaxed text-cream/60">{course.goal}</p>

      {/* Progresso + continuar */}
      <div className="mt-4 rounded-2xl bg-graphite-800 p-4 ring-1 ring-white/5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-cream/45">{c.learn.courseLevels[course.level]}</span>
          <span className="font-display text-sm font-bold tabular-nums text-cream">
            {c.learn.courseProgress.replace("{n}", String(done)).replace("{total}", String(items.length))}
          </span>
        </div>
        <div className="mt-2.5 flex items-center gap-2.5">
          <CourseMeter done={done} total={items.length} />
        </div>
        {next ? (
          <button
            onClick={() => go({ name: "content", id: next.id })}
            className="mt-3.5 w-full rounded-full bg-amber py-3 text-center font-display text-[15px] font-semibold text-graphite active:scale-[0.99]"
          >
            {done === 0 ? c.learn.courseStart : c.learn.courseContinue} → {next.title.length > 28 ? next.title.slice(0, 28) + "…" : next.title}
          </button>
        ) : (
          <p className="mt-3.5 text-center text-sm font-medium text-teal">✓ {c.learn.courseDoneBadge}</p>
        )}
      </div>

      {/* Sequência (sugerida, nunca trancada: qualquer aula abre) */}
      <div className="mt-4 space-y-2">
        {items.map((l, i) => {
          const isDone = seen.has(l.id);
          const locked = l.premium && !s.premium;
          return (
            <button
              key={l.id}
              onClick={() => go(locked ? { name: "subscribe", ctx: "learn" } : { name: "content", id: l.id })}
              className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left ring-1 transition-all hover:ring-amber/30 ${isDone ? "bg-teal/[0.07] ring-teal/20" : "bg-graphite-800 ring-white/5"}`}
            >
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full font-display text-xs font-bold ${isDone ? "bg-teal text-graphite" : "bg-white/8 text-cream/60"}`}>
                {isDone ? "✓" : i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block truncate font-display text-sm ${isDone ? "text-cream/60" : "text-cream"}`}>{l.title}</span>
                <span className="block text-[11px] text-cream/45">{typeLabel(c, l.type)}</span>
              </span>
              {locked ? <PremiumBadge /> : <span className="shrink-0 text-cream/30">›</span>}
            </button>
          );
        })}
      </div>

      {!s.premium && <UpgradeBanner ctx="learn" text={c.paywalls.learn.title} />}
    </div>
  );
}

// 2.6.B′ — Para o seu carro (conteúdos escolhidos pelo carro ativo)
export function ForYourCarScreen() {
  const c = useContent();
  const { s } = usePrototype();
  const v = activeVehicle(s);
  const items = recommendedFor(v, c.lessons, v ? servicesFor(s, v.id) : []);
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

// 2.6.B″ — Salvos (conteúdos guardados para ver depois)
export function SavedLessonsScreen() {
  const c = useContent();
  const { s } = usePrototype();
  const items = (s.savedLessons ?? [])
    .map((id) => c.lessons.find((l) => l.id === id))
    .filter((l): l is Item => !!l);
  return (
    <div>
      <AppHeader title={c.learn.savedTitle} subtitle={c.learn.savedSub} />
      {items.length > 0 ? (
        <div className="mt-1 space-y-2.5">
          {items.map((l) => <ItemRow key={l.id} item={l} />)}
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-cream/50">{c.learn.savedEmpty}</p>
      )}
    </div>
  );
}

// 2.6.C — Detalhe do conteúdo (tutorial com passos OU artigo com parágrafos)
export function ContentScreen({ id }: { id: string }) {
  const c = useContent();
  const { go, back } = useNav();
  const { s, markLessonSeen, toggleLessonSaved, toggleLessonPinned } = usePrototype();
  const lesson = c.lessons.find((l) => l.id === id);
  const [level, setLevel] = useState<"iniciante" | "avancado" | "mecanico">("avancado");
  // Concluído e Salvo são ações do usuário (botões) — persistem na sessão.
  const done = lesson ? (s.seenLessons ?? []).includes(lesson.id) : false;
  const saved = lesson ? (s.savedLessons ?? []).includes(lesson.id) : false;

  // Conclui a aula e, na TERCEIRA da mesma trilha, pede a nota.
  //
  // Três aulas do mesmo assunto é alguém que escolheu um tema e foi fundo —
  // sinal bem mais forte que três aulas soltas. Trilha inteira seria melhor
  // ainda, mas as trilhas têm de 5 a 22 aulas e o gatilho quase nunca chegaria.
  //
  // Conta o TOTAL depois de concluir, e não o toque: `markLessonSeen` alterna
  // nos dois sentidos, e contar toques faria desmarcar-e-marcar de novo abrir a
  // pergunta a cada vez.
  // Posição desta aula na trilha guiada, se pertencer a alguma. Alimenta o
  // contexto "Aula n de N", o botão de próxima e a celebração de conclusão.
  const inCourse = lesson ? courseOf(lesson.id, c.courses, c.lessons) : null;
  const courseNext = inCourse ? inCourse.items[inCourse.index + 1] ?? null : null;
  const [celebrate, setCelebrate] = useState(false);

  const concluir = () => {
    if (!lesson) return;
    markLessonSeen(lesson.id);
    if (done) return; // estava marcada: este toque desmarcou
    const daTrilha = new Set(c.lessons.filter((l) => l.track === lesson.track).map((l) => l.id));
    const concluidas = new Set([...(s.seenLessons ?? []), lesson.id].filter((x) => daTrilha.has(x)));
    if (concluidas.size === 3) pedirFeedback(s, "tres-aulas-trilha");
    // Fechou a última aula pendente da trilha guiada? Celebra.
    if (inCourse) {
      const seenNow = new Set([...(s.seenLessons ?? []), lesson.id]);
      if (inCourse.items.every((l) => seenNow.has(l.id))) setCelebrate(true);
    }
  };

  // Concluir e já abrir a próxima da trilha — o gesto que transforma a lista
  // numa aula de curso. (`go` empilha; voltar volta para esta aula.)
  const concluirEAvancar = () => {
    if (!lesson || !courseNext) return;
    concluir();
    if (!done) go({ name: "content", id: courseNext.id });
  };
  // Interstitial ao abrir uma aula (só free), sujeito à política de anúncios:
  // carência nas primeiras aberturas, intervalo mínimo e teto diário.
  const [needAd, setNeedAd] = useState(false);
  useEffect(() => {
    registerContentOpen();
    if (adsEnabled() && !s.premium && canShowAd()) {
      markAdShown();
      setNeedAd(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  if (!lesson) return <AppHeader title="—" />;

  const byLevel = lesson.stepsByLevel; // 3 níveis fixos (sem chamada de API)
  const hasSteps = lesson.steps.length > 0;
  const shownSteps = byLevel ? byLevel[level] : lesson.steps;

  return (
    <div>
      {needAd && <AdOverlay kind="interstitial" onDone={() => setNeedAd(false)} />}
      <AppHeader
        title={lesson.title}
        subtitle={inCourse ? `${inCourse.course.title} · ${c.learn.courseLessonCtx.replace("{n}", String(inCourse.index + 1)).replace("{total}", String(inCourse.items.length))}` : undefined}
      />

      {/* Player (in-app), or a placeholder for text content */}
      {lesson.media ? (
        <VideoPlayer media={lesson.media} />
      ) : lesson.type !== "video" && lesson.thumb ? (
        // Capa de artigo: a arte é QUADRADA, então o quadro também é — num
        // quadro 16:9 ela estourava em cima e embaixo, cortando o desenho.
        // No desktop a largura é limitada para o quadrado não virar um
        // paredão; o fundo da moldura é o mesmo tom do fundo das artes, então
        // qualquer sobra é invisível.
        <div className="overflow-hidden rounded-2xl bg-graphite ring-1 ring-white/10">
          <Thumb src={lesson.thumb} className="mx-auto aspect-square w-full max-w-md object-contain" />
        </div>
      ) : (
        // Vídeo ainda não publicado (ou artigo sem capa): arte de player 16:9.
        <div className="grid aspect-video place-items-center overflow-hidden rounded-2xl bg-graphite ring-1 ring-white/10">
          <Thumb src="/learn/_video-placeholder.png?v=4" className="h-full w-full object-cover" />
        </div>
      )}

      {/* Corpo do artigo — estrutura por prefixos (##, >>, !!) e links [[..]] */}
      {lesson.body && lesson.body.length > 0 && <ArticleBody body={lesson.body} />}

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
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-cream/45">{c.learn.steps}</p>
            {/* Seletor de nível (só quando há níveis fixos): mais iniciante = mais detalhado */}
            {byLevel && (
              <div className="flex gap-1 rounded-lg bg-graphite-800 p-0.5 ring-1 ring-white/10">
                {(["iniciante", "avancado", "mecanico"] as const).map((lv) => (
                  <button
                    key={lv}
                    onClick={() => setLevel(lv)}
                    className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${level === lv ? "bg-amber text-graphite" : "text-cream/60 hover:text-cream"}`}
                  >
                    {c.learn.levels[lv]}
                  </button>
                ))}
              </div>
            )}
          </div>
          <ol className="space-y-2">
            {shownSteps.map((x, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-cream/85">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber/15 font-display text-xs font-semibold text-amber">{i + 1}</span>
                {x}
              </li>
            ))}
          </ol>
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

      {/* Ações. Dentro de uma trilha com próxima aula, o gesto primário é
          "concluir e avançar" — é o que faz a lista virar curso. */}
      {/* Os rótulos são longos ("Salvar para ver depois") e o Button tem
          altura fixa que proíbe quebra de linha: em tela estreita o texto
          estourava para fora do botão. `fluido` libera a altura e deixa o
          rótulo quebrar, então o botão cresce em vez de vazar. */}
      {courseNext && !done ? (
        <div className="mt-6 space-y-2">
          <Button className="w-full !h-auto min-h-11 whitespace-normal py-2.5 leading-snug" onClick={concluirEAvancar}>{c.learn.completeAndNext} →</Button>
          <div className="flex items-stretch gap-2">
            <Button variant="ghost" className="min-w-0 flex-1 !h-auto min-h-11 whitespace-normal py-2 text-[13px] leading-snug" onClick={concluir}>{c.learn.complete}</Button>
            <Button variant="ghost" className="min-w-0 flex-1 !h-auto min-h-11 whitespace-normal py-2 text-[13px] leading-snug" onClick={() => toggleLessonSaved(lesson.id)}>{saved ? `★ ${c.learn.savedLabel}` : `☆ ${c.learn.saveLater}`}</Button>
            <PinButton id={lesson.id} />
          </div>
        </div>
      ) : (
        <div className="mt-6 flex items-stretch gap-2">
          <Button className="min-w-0 flex-1 !h-auto min-h-11 whitespace-normal py-2 text-[13px] leading-snug" onClick={concluir}>{done ? `✓ ${c.learn.completed}` : c.learn.complete}</Button>
          <Button variant="ghost" className="min-w-0 flex-1 !h-auto min-h-11 whitespace-normal py-2 text-[13px] leading-snug" onClick={() => toggleLessonSaved(lesson.id)}>{saved ? `★ ${c.learn.savedLabel}` : `☆ ${c.learn.saveLater}`}</Button>
          <PinButton id={lesson.id} />
        </div>
      )}

      {/* A seguir na trilha */}
      {courseNext && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cream/45">{c.learn.courseNextUp}</p>
          <ItemRow item={courseNext} />
        </div>
      )}

      {/* Continue por aqui — aulas relacionadas escolhidas no conteúdo */}
      {(lesson.related ?? []).length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cream/45">{c.learn.relatedTitle}</p>
          <div className="space-y-2.5">
            {(lesson.related ?? [])
              .map((rid) => c.lessons.find((l) => l.id === rid))
              .filter((l): l is Item => !!l && l.id !== courseNext?.id)
              .slice(0, 3)
              .map((l) => <ItemRow key={l.id} item={l} />)}
          </div>
        </div>
      )}

      {!s.premium && <UpgradeBanner ctx="learn" text={c.paywalls.learn.title} />}

      {/* Trilha concluída — celebração */}
      <Sheet open={celebrate} onClose={() => setCelebrate(false)}>
        <div className="flex flex-col items-center pt-2 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/biela/biela-idle.png" alt="" className="h-28 w-28 object-contain" draggable={false} />
          <h2 className="mt-2 font-serif text-xl font-bold text-cream">{c.learn.courseDoneTitle}</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-cream/65">
            {c.learn.courseDoneBody.replace("{t}", inCourse?.course.title ?? "")}
          </p>
          <Button className="mt-5 w-full" onClick={() => { setCelebrate(false); back(); }}>
            {c.learn.courseDoneCta}
          </Button>
          {/* O pedido de Premium logo depois do valor entregue: a pessoa
              acabou de concluir a trilha inteira. Momento mapeado na rodada
              do CRO de 23/08; o ctx vira a origem no funil, então dá para
              comparar quanto ESTE momento converte contra os demais. */}
          {!s.premium && (
            <div className="w-full">
              <UpgradeBanner ctx="trilha-concluida" text={c.learn.courseDoneUpsell} />
            </div>
          )}
        </div>
      </Sheet>
    </div>
  );
}

// 2.6.D — Chat com o Biela (agente de IA / mecânico)
// O tipo Msg e a persistência moram em lib/app/bielaChat.ts.

export function BielaChatScreen({ seed }: { seed?: string }) {
  const c = useContent();
  const { locale } = useI18n();
  const { s } = usePrototype();
  const { go } = useNav();
  const v = activeVehicle(s);
  // Uma conversa por carro: quem tem um só nunca percebe, e quem tem dois não
  // vê resposta sobre o Argo pendurada acima de uma pergunta sobre o outro.
  const idChat = idConversa(v?.id);
  // A saudação é sempre remontada aqui (fica fora do que é gravado), então ela
  // acompanha o idioma atual.
  const abertura = (): Msg[] => [{ role: "biela", text: c.biela.intro }];
  const [msgs, setMsgs] = useState<Msg[]>(() => [...abertura(), ...carregarConversa(idChat)]);
  const [input, setInput] = useState(seed ?? "");
  const [busy, setBusy] = useState(false);
  const [used, setUsed] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [motivoDe, setMotivoDe] = useState<number | null>(null); // índice da resposta esperando motivo
  const [comentario, setComentario] = useState("");
  const relogio = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Grava a cada mudança. `msgs.slice(1)` tira a saudação; o recorte das 15
  // últimas interações é feito lá dentro.
  useEffect(() => {
    salvarConversa(idChat, msgs.slice(1), s.vehicles.map((x) => x.id));
  }, [msgs, idChat, s.vehicles]);

  // Trocar de carro com a tela montada não acontece hoje (não há seletor de
  // veículo aqui), mas se um dia houver, a conversa recarrega em vez de ser
  // gravada no carro errado. `pular` evita o retrabalho na primeira montagem,
  // onde o useState já leu o mesmo dado.
  const pular = useRef(true);
  useEffect(() => {
    if (pular.current) { pular.current = false; return; }
    setMsgs([...abertura(), ...carregarConversa(idChat)]);
    setMotivoDe(null);
    setComentario("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idChat]);

  const gated = !s.premium && used >= FREE_BIELA_QUESTIONS;

  // O 👍 ARMA o pedido de nota; quem dispara é o silêncio.
  //
  // Perguntar na hora do polegar interromperia alguém no meio de um problema no
  // carro — o pior momento possível para pedir estrelas. Trinta segundos sem
  // pergunta nova é o sinal de que a conversa acabou bem.
  //
  // O 👎 fica guardado só na tela por ora: ele é o melhor material para corrigir
  // a Biela, mas mandar cada polegar para baixo por e-mail encheria a caixa.
  const desarmar = () => {
    if (relogio.current) { clearTimeout(relogio.current); relogio.current = null; }
  };
  // Sair da tela cancela: a folha não deve pular numa tela onde o momento não
  // aconteceu.
  useEffect(() => desarmar, []);

  const novaConversa = () => {
    desarmar();
    limparConversa(idChat);
    setMsgs(abertura());
    setMotivoDe(null);
    setComentario("");
    setInput("");
  };

  // Manda o voto para /api/biela-voto, que guarda o par pergunta+resposta.
  // Falhar aqui não pode atrapalhar ninguém: quem tocou no polegar já seguiu a
  // vida, e uma mensagem de erro por causa disso seria pior que o silêncio.
  const registrar = (i: number, voto: "up" | "down", motivo?: string, comentario?: string) => {
    const msg = msgs[i];
    if (!msg?.pergunta) return;
    void apiPost("/api/biela-voto", {
      voto, motivo, comentario,
      pergunta: msg.pergunta, resposta: msg.text,
      carro: v ? `${v.make} ${v.model} ${v.year}` : undefined,
      comManual: msg.comManual, modo: msg.modo, locale,
      plataforma: isNativeApp() ? (nativePlatform() ?? "nativo") : "web",
      versao: APP_VERSION, aparelho: aparelhoId(),
    }).catch(() => undefined);
  };

  const votar = (i: number, v: "up" | "down") => {
    setMsgs((m) => m.map((msg, j) => (j === i ? { ...msg, voto: v } : msg)));
    desarmar();
    if (v === "down") { setMotivoDe(i); return; } // o motivo é que vale; o voto vai com ele
    // Voltar para 👍 fecha o "O que faltou?".
    //
    // Sem isto, quem tocasse 👎 e se arrependesse ficava com a pergunta de
    // motivo aberta embaixo de um polegar para cima — a tela dizia duas coisas
    // contrárias ao mesmo tempo, e um toque no motivo teria gravado um voto
    // negativo que a pessoa já tinha desfeito.
    setMotivoDe((atual) => (atual === i ? null : atual));
    setComentario("");
    registrar(i, "up");
    relogio.current = setTimeout(() => {
      relogio.current = null;
      // Meia pergunta escrita não é fim de conversa, é alguém formulando —
      // e interromper aí é pior do que interromper logo.
      if (inputRef.current?.value.trim()) return;
      pedirFeedback(s, "biela-util");
    }, 30_000);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  // Campo cresce conforme o texto (inclusive quando já vem preenchido pelo seed).
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  }, [input, gated]);

  const ask = async (question: string) => {
    const text = question.trim();
    if (!text || busy || gated) return;
    desarmar(); // ainda está resolvendo algo: o próximo 👍 arma de novo
    setInput("");
    // Recortado ANTES de empilhar a pergunta nova: `historicoParaIA` só junta
    // pares fechados, e a pergunta que acabou de sair ainda não tem resposta.
    const historico = historicoParaIA(msgs);
    setMsgs((m) => [...m, { role: "user", text }]);
    setBusy(true);
    if (!s.premium) setUsed((n) => n + 1);
    try {
      const res = await apiPost("/api/biela", {
        question: text,
        locale,
        historico,
        car: v ? { make: v.make, model: v.model, year: v.year, km: v.odometerKm, engine: v.engine, version: v.version } : null,
      });
      const data = await res.json();
      setMsgs((m) => [...m, {
        role: "biela", text: data.answer, note: data.mode === "ai" ? undefined : c.biela.offlineNote,
        pergunta: text, modo: data.mode, comManual: data.usedManual,
      }]);
    } catch (e) {
      // No app, mostra o motivo real da falha junto do aviso. Sem isto a tela
      // ficava idêntica para "sem internet", "endereço errado" e "navegador
      // bloqueou" — e cada diagnóstico custava um build inteiro.
      const detalhe = isNativeApp()
        ? ` · ${apiUrl("/api/biela")} → ${e instanceof Error ? e.message : String(e)}`
        : "";
      setMsgs((m) => [...m, { role: "biela", text: fallbackAnswer(v, locale), note: c.biela.offlineNote + detalhe, pergunta: text, modo: "offline" }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <AppHeader
        title={c.biela.title}
        subtitle={v ? `${c.biela.contextPrefix} ${vehicleLabel(v)}${v.odometerKm != null ? " · " + v.odometerKm.toLocaleString() + " km" : ""}` : undefined}
        action={
          msgs.length > 1 ? (
            <button
              onClick={novaConversa}
              aria-label={c.biela.novaConversa}
              title={c.biela.novaConversa}
              className="grid h-9 w-9 place-items-center rounded-full bg-graphite-700 text-cream/70 hover:text-cream"
            >
              <Icon name="plus" className="h-4 w-4" />
            </button>
          ) : undefined
        }
      />

      {/* Conversa.
          `mt-auto` no miolo encosta as mensagens embaixo enquanto elas cabem na
          tela, como em qualquer conversa — antes a saudação ficava colada no
          topo e sobrava um vão até as sugestões. Quando passam da altura, o
          `mt-auto` deixa de ter efeito e a rolagem volta ao normal (é por isso
          que não dá para usar `justify-end`, que corta o começo). */}
      <div ref={scrollRef} className="flex flex-1 flex-col overflow-y-auto pb-2">
        <div className="mt-auto space-y-3">
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
              {m.role === "biela" && i > 0 && (
                <div className="mt-2 border-t border-white/5 pt-2">
                  <div className="flex gap-1">
                    {([["up", "\u{1F44D}", c.feedback.bielaUtil], ["down", "\u{1F44E}", c.feedback.bielaInutil]] as const).map(([opcao, icone, rotulo]) => (
                      <button
                        key={opcao}
                        onClick={() => votar(i, opcao)}
                        aria-label={rotulo}
                        aria-pressed={m.voto === opcao}
                        className={`rounded-lg px-2 py-1 text-sm transition-colors ${m.voto === opcao ? "bg-amber/20" : "opacity-45 hover:opacity-100"}`}
                      >
                        {icone}
                      </button>
                    ))}
                  </div>

                  {/* O motivo é o que transforma "resposta ruim" em conserto. */}
                  {motivoDe === i && (
                    <div className="mt-2">
                      <p className="text-xs text-cream/50">{c.feedback.bielaPorQue}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {([["errada", c.feedback.bielaErrada], ["incompleta", c.feedback.bielaIncompleta], ["confusa", c.feedback.bielaConfusa]] as const).map(([chave, rotulo]) => (
                          <button
                            key={chave}
                            onClick={() => { registrar(i, "down", chave, comentario.trim() || undefined); setMotivoDe(null); setComentario(""); }}
                            className="rounded-full bg-graphite-700 px-2.5 py-1 text-xs text-cream/80 ring-1 ring-white/10 hover:bg-graphite-600"
                          >
                            {rotulo}
                          </button>
                        ))}
                      </div>
                      <input
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        placeholder={c.feedback.bielaComentario}
                        className="mt-2 w-full rounded-lg bg-graphite-900 px-2.5 py-1.5 text-xs text-cream placeholder:text-cream/30 ring-1 ring-white/10 focus:outline-none focus:ring-amber/40"
                      />
                    </div>
                  )}
                  {m.voto === "down" && motivoDe !== i && (
                    <p className="mt-1.5 text-xs text-cream/40">{c.feedback.bielaObrigado}</p>
                  )}
                </div>
              )}
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
          <div className="mb-2 flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input); } }}
              rows={1}
              placeholder={c.biela.inputPh}
              className="max-h-44 flex-1 resize-none overflow-y-auto rounded-xl bg-graphite-800 px-3.5 py-3 text-cream ring-1 ring-white/10 outline-none placeholder:text-cream/40 focus:ring-amber"
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
