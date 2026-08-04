"use client";

import { activeVehicle, servicesFor, usePrototype } from "@/lib/app/store";
import { computeHealth } from "@/lib/app/health";
import { computeStatus, MILESTONES } from "@/lib/app/gamification";
import { isNewLesson, vehicleLabel } from "@/lib/app/content";
import { useNav } from "@/lib/app/nav";
import { isNativeApp } from "@/lib/app/wrapper";
import { useContent, Card, Icon } from "../ui";
import { HealthPill } from "./Cars";
import { CommonProblems } from "./Symptoms";

type Lesson = ReturnType<typeof useContent>["lessons"][number];

// Dificuldade sugerida conforme a fase do motorista.
function levelPref(phaseIndex: number): "facil" | "medio" | "avancado" {
  if (phaseIndex <= 1) return "facil";
  if (phaseIndex <= 3) return "medio";
  return "avancado";
}

// "Para você": ranqueia as aulas por marca do carro + nível. Regras:
// - salvos vão pro FIM da lista (mesmo se concluídos) — ficam à mão;
// - concluído e NÃO salvo sai da seção;
// - o resto vem primeiro, por relevância.
function forYou(lessons: Lesson[], opts: { make?: string; pref: string; seen: string[]; saved: string[] }): Lesson[] {
  const make = opts.make?.toLowerCase();
  const score = (l: Lesson) => {
    let n = 0;
    if (make && l.make && l.make.toLowerCase() === make) n += 5;
    if (l.difficulty === opts.pref) n += 2;
    if (l.type === "video") n += 1;
    return n;
  };
  // "obd2-scan" vive só na área de Estudos — no Para você fica a aula
  // "Luz de injeção ligada? Descubra!" (read-obd2), que leva até ela.
  const pool = lessons.filter((l) => l.id !== "obd2-scan" && !opts.seen.includes(l.id) && !opts.saved.includes(l.id));
  // Conteúdo novo (addedAt ≤ 7 dias) vai para a frente, do mais recente para
  // o mais antigo; o resto segue por relevância.
  const news = pool.filter((l) => isNewLesson(l)).sort((a, b) => (b.addedAt ?? "").localeCompare(a.addedAt ?? ""));
  const rest = pool.filter((l) => !isNewLesson(l)).sort((a, b) => score(b) - score(a));
  const fresh = [...news, ...rest];
  // Salvos na ordem em que foram guardados — SEMPRE presentes no fim da
  // lista (o corte de 8 vale só para as sugestões, senão o salvo some).
  const savedList = opts.saved
    .map((id) => lessons.find((l) => l.id === id))
    .filter((l): l is Lesson => !!l)
    .slice(0, 4);
  return [...fresh.slice(0, Math.max(2, 8 - savedList.length)), ...savedList];
}

function typeIcon(t: string) {
  return t === "video" ? "diagnose" : t === "checklist" ? "check" : "book";
}

// 0.0 — Início (dashboard estilo Bloom)
export function HomeScreen() {
  const c = useContent();
  const h = c.home;
  const gm = c.gamification.milestones;
  const { s } = usePrototype();
  const { go, root } = useNav();

  const car = activeVehicle(s);
  const hasCar = s.vehicles.length > 0;
  const status = computeStatus(s);
  const seen = s.seenLessons ?? [];
  const savedIds = s.savedLessons ?? [];
  const picks = forYou(c.lessons, { make: car?.make, pref: levelPref(status.phaseIndex), seen, saved: savedIds });

  // Memórias: marcos e momentos conquistados, priorizando Momentos.
  const memories = MILESTONES.filter((m) => m.earned(s)).sort(
    (a, b) => (a.cat === "momento" ? 0 : 1) - (b.cat === "momento" ? 0 : 1)
  );

  const quick: { icon: string; label: string; tint: string; go: () => void }[] = [
    { icon: "diagnose", label: h.qDiagnose, tint: "bg-coral/15 text-coral", go: () => root({ name: "symptoms" }) },
    { icon: "clock", label: h.qService, tint: "bg-teal/15 text-teal", go: () => go({ name: "addService" }) },
    { icon: "calendar", label: h.qRevisions, tint: "bg-amber/15 text-amber", go: () => root({ name: "revisions" }) },
    { icon: "book", label: h.qStudies, tint: "bg-white/10 text-cream/80", go: () => root({ name: "learn" }) },
  ];

  return (
    <div className="pb-4">
      {/* Herói */}
      <div className="relative mt-3 overflow-hidden rounded-3xl bg-graphite-800 ring-1 ring-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/biela/cena-chegada.webp"
          alt=""
          className="aspect-[16/12] w-full object-cover"
          style={{ objectPosition: "center 52%" }}
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-graphite-900 via-graphite-900/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h2 className="max-w-[15rem] font-serif text-2xl font-bold leading-tight text-cream">
            {hasCar ? h.heroTitle : h.heroTitleEmpty}
          </h2>
          <button
            onClick={() => (hasCar ? root({ name: "symptoms" }) : go({ name: "addCar" }))}
            className="mt-3 w-full rounded-full bg-amber py-3.5 text-center font-display text-[15px] font-semibold text-graphite active:scale-[0.99]"
          >
            {hasCar ? h.heroCta : h.heroCtaEmpty}
          </button>
        </div>
      </div>

      {/* Premium (oculto no app da loja — modo leitor) */}
      {!s.premium && !isNativeApp() && (
        <button
          onClick={() => go({ name: "subscribe", ctx: "home" })}
          className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-amber/20 to-amber/5 px-4 py-3.5 text-left ring-1 ring-amber/25"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber/20 text-amber">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M3 7l4.5 3L12 4l4.5 6L21 7l-1.6 11H4.6L3 7z" /></svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[15px] font-semibold text-cream">{h.premiumTitle}</span>
            <span className="block text-xs text-cream/55">{h.premiumSub}</span>
          </span>
          <span className="shrink-0 text-lg text-amber">›</span>
        </button>
      )}

      {/* Busca (abre a tela de busca) */}
      <button
        onClick={() => go({ name: "search" })}
        className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-graphite-800 px-4 py-3 text-left ring-1 ring-white/[0.06]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-cream/45"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <span className="text-sm text-cream/45">{h.searchPh}</span>
      </button>

      {/* Seu carro */}
      {car && (
        <button onClick={() => root({ name: "car" })} className="mt-3 w-full text-left">
          <Card className="hover:ring-white/15">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-teal/15 text-teal">
                {car.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={car.photo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Icon name={car.type === "moto" ? "moto" : "car"} className="h-6 w-6" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] uppercase tracking-wide text-cream/45">{h.yourCar}</span>
                <span className="block truncate font-display text-[15px] text-cream">{car.nickname || vehicleLabel(car)}</span>
              </span>
              <HealthPill score={computeHealth(car, servicesFor(s, car.id)).score} />
            </div>
          </Card>
        </button>
      )}

      {/* Para você — sugestões de conteúdo (quadrados de mesmo tamanho) */}
      {picks.length > 0 && (
        <section className="mt-6">
          <div className="mb-1 flex items-baseline justify-between">
            <h3 className="font-serif text-lg font-bold text-cream">{h.forYouTitle}</h3>
            <button onClick={() => root({ name: "learn" })} className="text-xs font-medium text-amber">{h.seeAll}</button>
          </div>
          <p className="mb-3 text-xs text-cream/45">{h.forYouSub}</p>
          <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(() => {
              const lessonCard = (l: Lesson) => {
                const locked = l.premium && !s.premium;
                return (
                  <button
                    key={l.id}
                    onClick={() => go(locked ? { name: "subscribe", ctx: "home" } : { name: "content", id: l.id })}
                    className="flex w-36 shrink-0 flex-col self-start text-left"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-graphite-700 to-graphite-800 ring-1 ring-white/[0.06]">
                      {l.thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={l.thumb} alt="" className="h-full w-full object-cover" draggable={false} />
                      ) : (
                        <span className="grid h-full w-full place-items-center text-amber/70">
                          <Icon name={typeIcon(l.type)} className="h-9 w-9" />
                        </span>
                      )}
                      {locked && (
                        <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-graphite-900/80 text-amber">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
                        </span>
                      )}
                      {savedIds.includes(l.id) && (
                        <span className="absolute left-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-graphite-900/80 text-xs text-amber">★</span>
                      )}
                      {isNewLesson(l) && !savedIds.includes(l.id) && !seen.includes(l.id) && (
                        <span className="absolute left-2 top-2 rounded-full bg-amber px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-graphite">
                          {h.newBadge}
                        </span>
                      )}
                      {seen.includes(l.id) && !locked && (
                        <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-teal/90 text-graphite">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3 w-3"><path d="M20 6 9 17l-5-5" /></svg>
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-cream/85">{l.title}</p>
                  </button>
                );
              };
              // Kit do motorista na 3ª posição — arranjo INICIAL, não regra:
              // quando o ranking por engajamento (content_events) entrar, o
              // Kit participa como os demais e pode subir/descer.
              const kitCard = (
                <button key="kit" onClick={() => go({ name: "equipment" })} className="flex w-36 shrink-0 flex-col self-start text-left">
                  <div className="grid aspect-square place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-graphite-700 to-graphite-800 ring-1 ring-white/[0.06]">
                    <Icon name="tools" className="h-9 w-9 text-amber/70" />
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-cream/85">{c.equipmentUi.cardTitle}</p>
                </button>
              );
              return [...picks.slice(0, 2).map(lessonCard), kitCard, ...picks.slice(2).map(lessonCard)];
            })()}
          </div>
        </section>
      )}

      {/* Memórias — marcos e momentos conquistados (Momentos primeiro) */}
      {memories.length > 0 && (
        <section className="mt-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-serif text-lg font-bold text-cream">{h.memoriesTitle}</h3>
            <button onClick={() => go({ name: "achievements" })} className="text-xs font-medium text-amber">{h.seeAll}</button>
          </div>
          <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {memories.map((m) => {
              const photo = s.momentPhotos?.[m.id];
              const label = gm[m.id]?.title ?? m.id;
              return (
                <button key={m.id} onClick={() => go({ name: "achievements" })} className="flex w-28 shrink-0 flex-col self-start text-left">
                  <div className="grid aspect-square place-items-center overflow-hidden rounded-2xl bg-graphite-800 ring-1 ring-white/[0.06]">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt="" className="h-full w-full object-cover" draggable={false} />
                    ) : (
                      <span className="text-3xl">{m.emoji}</span>
                    )}
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-[12px] leading-snug text-cream/80">{label}</p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Problemas comuns — mesmo formato dos cards (reusa a lógica da aba Problemas) */}
      <CommonProblems />

      {/* Ações rápidas */}
      <p className="mb-2 mt-6 font-display text-sm font-semibold text-cream/70">{h.quickTitle}</p>
      <div className="grid grid-cols-4 gap-2.5">
        {quick.map((q) => (
          <button key={q.label} onClick={q.go} className="flex flex-col items-center gap-1.5">
            <span className={`grid h-14 w-14 place-items-center rounded-2xl ${q.tint}`}>
              <Icon name={q.icon} className="h-6 w-6" />
            </span>
            <span className="text-center text-[11px] leading-tight text-cream/70">{q.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
