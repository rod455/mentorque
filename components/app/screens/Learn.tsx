"use client";

import { useEffect, useState } from "react";
import { activeVehicle, servicesFor, usePrototype } from "@/lib/app/store";
import { personalScore, vehicleSituations, vehicleTraits } from "@/lib/app/traits";
import type { ServiceRecord } from "@/lib/app/types";
import { carName } from "@/lib/app/content";
import { courseItems, courseProgress } from "@/lib/app/cursos";
import { useNav } from "@/lib/app/nav";
import { funil } from "@/lib/app/funil";
import { AppHeader, Icon, PremiumBadge, SectionTitle, UpgradeBanner, useContent } from "../ui";
import { ItemRow, typeLabel } from "../estudos/ItemDeAula";

// A área de Estudos: a lista, as trilhas, "para o seu carro" e as salvas.
//
// O que SAIU daqui, e por quê: este arquivo tinha sete telas e mil linhas,
// incluindo o leitor de aula e a conversa com a Biela. Nenhuma das duas tem a
// ver com listar aulas, e ninguém procuraria o chat da IA num arquivo chamado
// "Estudos". Ver screens/Content.tsx e screens/Biela.tsx.


type Item = ReturnType<typeof useContent>["lessons"][number];

// ---- Trilhas guiadas (cursos) ----------------------------------------------
// Uma trilha referencia aulas por id em `order`. Ids desconhecidos são
// ignorados (trilha remota nova não pode quebrar num catálogo antigo), então
// tudo parte de `courseItems`, nunca do `order` cru.

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