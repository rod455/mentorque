"use client";

import { useEffect, useState } from "react";
import { activeVehicle, servicesFor, usePrototype } from "@/lib/app/store";
import { personalScore, vehicleSituations, vehicleTraits } from "@/lib/app/traits";
import type { ServiceRecord } from "@/lib/app/types";
import { computeQuizHealth } from "@/lib/app/healthQuiz";
import { computeStatus, MILESTONES } from "@/lib/app/gamification";
import { isNewLesson, vehicleLabel } from "@/lib/app/content";
import { useNav } from "@/lib/app/nav";
import { openStorePage, useUpdateAvailable } from "@/lib/app/appUpdate";
import { sellsInApp } from "@/lib/app/wrapper";
import { Button } from "@/components/ui/Button";
import { useContent, Card, Icon, inputCls, Sheet, Thumb } from "../ui";
import { HealthPill } from "./Cars";
import { FipeLine } from "./CarHub";
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
function forYou(lessons: Lesson[], opts: { car?: ReturnType<typeof activeVehicle>; services?: ServiceRecord[]; pref: string; seen: string[]; saved: string[]; pinned: string[] }): Lesson[] {
  // Mesma personalização da tela de Estudos: características do veículo +
  // situação do dono (ver lib/app/traits.ts), com fallback genérico.
  const car = opts.car;
  const traits = car ? vehicleTraits(car) : new Set<never>();
  const situations = car ? vehicleSituations(car, opts.services ?? []) : new Set<never>();
  const score = (l: Lesson) =>
    personalScore(l, { make: car?.make, model: car?.model, traits: traits as never, situations: situations as never, pref: opts.pref });
  // "obd2-scan" vive só na área de Estudos — no Para você fica a aula
  // "Luz de injeção ligada? Descubra!" (read-obd2), que leva até ela.
  // Fixados vivem na seção própria (abaixo do carro) — fora do Para você.
  const pool = lessons.filter(
    (l) => l.id !== "obd2-scan" && !opts.seen.includes(l.id) && !opts.saved.includes(l.id) && !opts.pinned.includes(l.id)
  );
  // Conteúdo novo (addedAt ≤ 7 dias) vai para a frente, do mais recente para
  // o mais antigo; o resto segue por relevância.
  const news = pool.filter((l) => isNewLesson(l)).sort((a, b) => (b.addedAt ?? "").localeCompare(a.addedAt ?? ""));
  const rest = pool.filter((l) => !isNewLesson(l)).sort((a, b) => score(b) - score(a));
  const fresh = [...news, ...rest];
  // Salvos na ordem em que foram guardados — SEMPRE presentes no fim da
  // lista (o corte de 8 vale só para as sugestões, senão o salvo some).
  const savedList = opts.saved
    .filter((id) => !opts.pinned.includes(id))
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
  const { s, moveLessonPinned, updateVehicle } = usePrototype();
  const { go, root } = useNav();

  const car = activeVehicle(s);
  const hasCar = s.vehicles.length > 0;
  const updateReady = useUpdateAvailable();

  // Lembrete mensal de km. O carimbo kmUpdatedAt (gravado pelo store a cada
  // mudança do odômetro) diz há quanto tempo o número está parado; passados
  // 30 dias, a tela inicial pede o valor novo. "Agora não" adia por 3 dias
  // (marcador local por veículo). Km menor que o registrado não passa: o
  // odômetro só anda para frente, então valor menor é erro de digitação.
  const [kmAsk, setKmAsk] = useState(false);
  const [kmNovo, setKmNovo] = useState("");
  const [kmErro, setKmErro] = useState<string | null>(null);
  const KM_SNOOZE = "mq-km-snooze-";
  useEffect(() => {
    if (!car || car.odometerKm == null) return;
    const DIA = 24 * 60 * 60 * 1000;
    let adiado = 0;
    try { adiado = Number(window.localStorage.getItem(KM_SNOOZE + car.id) ?? 0); } catch { /* sem armazenamento: pergunta */ }
    const informado = car.kmUpdatedAt ? Date.parse(car.kmUpdatedAt) : 0;
    if (Date.now() - informado > 30 * DIA && Date.now() - adiado > 3 * DIA) {
      setKmNovo("");
      setKmErro(null);
      setKmAsk(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [car?.id]);
  const adiarKm = () => {
    try { window.localStorage.setItem(KM_SNOOZE + (car?.id ?? ""), String(Date.now())); } catch { /* ignore */ }
    setKmAsk(false);
  };
  const salvarKm = () => {
    if (!car) return;
    const n = parseInt(kmNovo.replace(/\D/g, ""), 10);
    if (!Number.isFinite(n)) { setKmErro(h.kmAskInvalid); return; }
    if (car.odometerKm != null && n < car.odometerKm) {
      setKmErro(h.kmAskLower.replace("{novo}", n.toLocaleString()).replace("{atual}", car.odometerKm.toLocaleString()));
      return;
    }
    updateVehicle(car.id, { odometerKm: n });
    setKmAsk(false);
  };
  const status = computeStatus(s);
  const seen = s.seenLessons ?? [];
  const savedIds = s.savedLessons ?? [];
  const pinnedIds = s.pinnedLessons ?? [];
  const pinnedList = pinnedIds
    .map((id) => c.lessons.find((l) => l.id === id))
    .filter((l): l is Lesson => !!l);
  // Salvos para ver depois. Ficavam só dentro de Estudos → Salvos, e quem
  // tocava em "Salvar para depois" voltava para o Início esperando encontrar
  // ali — sem nada, parecia que o salvamento não pegou. Os já fixados saem da
  // lista: apareceriam duas vezes na mesma tela.
  const savedList = savedIds
    .filter((id) => !pinnedIds.includes(id))
    .map((id) => c.lessons.find((l) => l.id === id))
    .filter((l): l is Lesson => !!l);
  const picks = forYou(c.lessons, { car, services: car ? servicesFor(s, car.id) : [], pref: levelPref(status.phaseIndex), seen, saved: savedIds, pinned: pinnedIds });

  // Memórias: marcos e momentos conquistados, priorizando Momentos.
  const memories = MILESTONES.filter((m) => m.earned(s)).sort(
    (a, b) => (a.cat === "momento" ? 0 : 1) - (b.cat === "momento" ? 0 : 1)
  );
  const livedMoments = memories.filter((m) => m.cat === "momento").length;

  const quick: { art: string; label: string; tint: string; go: () => void }[] = [
    { art: "diagnose", label: h.qDiagnose, tint: "bg-coral/15", go: () => root({ name: "symptoms" }) },
    { art: "log-service", label: h.qService, tint: "bg-teal/15", go: () => go({ name: "addService" }) },
    { art: "service-plan", label: h.qRevisions, tint: "bg-amber/15", go: () => root({ name: "revisions" }) },
    { art: "learn", label: h.qStudies, tint: "bg-white/10", go: () => root({ name: "learn" }) },
  ];

  return (
    <div className="pb-4">
      {/* Versão nova na loja. Só no app empacotado, e só quando o build
          instalado está atrás do publicado (lib/app/appUpdate.ts). Vive no
          topo porque o motorista precisa VER antes de rolar — mas pequeno:
          é um lembrete, não um bloqueio. */}
      {updateReady && (
        <button
          onClick={openStorePage}
          className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-teal/10 px-4 py-3 text-left ring-1 ring-teal/25 active:scale-[0.99]"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal/15 text-teal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 4v11m0 0l-4-4m4 4l4-4M5 20h14" /></svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[14px] font-semibold text-cream">{h.updateTitle}</span>
            <span className="block truncate text-xs text-cream/55">{h.updateSub}</span>
          </span>
          <span className="shrink-0 rounded-full bg-teal px-3.5 py-1.5 text-xs font-bold text-graphite">{h.updateCta}</span>
        </button>
      )}

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
          {/* Cadastrar o carro não pode parecer obrigatório: problemas, aulas
              e códigos OBD2 funcionam sem nenhum veículo na garagem. */}
          {!hasCar && (
            <button
              onClick={() => root({ name: "symptoms" })}
              className="mt-2 w-full py-1.5 text-center text-[13px] text-cream/60 hover:text-cream"
            >
              {h.heroSkipEmpty}
            </button>
          )}
        </div>
      </div>

      {/* Premium (oculto no app da loja — modo leitor) */}
      {!s.premium && sellsInApp() && (
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
                <FipeLine />
              </span>
              {/* Mesma fórmula do quiz usada na Saúde e no hub — um número só no app inteiro */}
              <HealthPill score={computeQuizHealth(car.quiz ?? {}, car).score} />
            </div>
          </Card>
        </button>
      )}

      {/* Fixados — conteúdos que o usuário usa com frequência (📌 nas aulas);
          setinhas reordenam (o próprio usuário escolhe o que fica na frente) */}
      {pinnedList.length > 0 && (
        <section className="mt-5">
          <h3 className="mb-2 font-serif text-lg font-bold text-cream">{h.pinnedTitle}</h3>
          <div className="space-y-2">
            {pinnedList.map((l, i) => {
              const locked = l.premium && !s.premium;
              return (
                <div
                  key={l.id}
                  className="flex w-full items-center gap-3 rounded-2xl bg-graphite-800 px-3.5 py-2.5 ring-1 ring-white/5"
                >
                  <button
                    onClick={() => go(locked ? { name: "subscribe", ctx: "home" } : { name: "content", id: l.id })}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-graphite text-amber/80 ring-1 ring-amber/45">
                      {l.thumb ? (
                        <Thumb src={l.thumb} className="h-full w-full object-contain" />
                      ) : (
                        <Icon name={typeIcon(l.type)} className="h-5 w-5" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-display text-sm text-cream/90">{l.title}</span>
                    <span aria-hidden className="shrink-0 text-amber">📌</span>
                  </button>
                  {pinnedList.length > 1 && (
                    <span className="flex shrink-0 flex-col">
                      <button
                        onClick={() => moveLessonPinned(l.id, -1)}
                        disabled={i === 0}
                        aria-label="subir"
                        className={`grid h-6 w-7 place-items-center rounded-md ${i === 0 ? "text-cream/15" : "text-cream/60 hover:bg-white/5 hover:text-cream"}`}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3.5 w-3.5"><path d="m6 14 6-6 6 6" /></svg>
                      </button>
                      <button
                        onClick={() => moveLessonPinned(l.id, 1)}
                        disabled={i === pinnedList.length - 1}
                        aria-label="descer"
                        className={`grid h-6 w-7 place-items-center rounded-md ${i === pinnedList.length - 1 ? "text-cream/15" : "text-cream/60 hover:bg-white/5 hover:text-cream"}`}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3.5 w-3.5"><path d="m6 10 6 6 6-6" /></svg>
                      </button>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Salvos para depois */}
      {savedList.length > 0 && (
        <section className="mt-5">
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="font-serif text-lg font-bold text-cream">{c.learn.savedTitle}</h3>
            {savedList.length > 4 && (
              <button onClick={() => go({ name: "savedLessons" })} className="text-xs font-medium text-amber">{h.seeAll}</button>
            )}
          </div>
          <div className="space-y-2">
            {savedList.slice(0, 4).map((l) => {
              const locked = l.premium && !s.premium;
              return (
                <button
                  key={l.id}
                  onClick={() => go(locked ? { name: "subscribe", ctx: "home" } : { name: "content", id: l.id })}
                  className="flex w-full items-center gap-3 rounded-2xl bg-graphite-800 px-3.5 py-2.5 text-left ring-1 ring-white/5"
                >
                  <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-graphite text-amber/80 ring-1 ring-amber/45">
                    {l.thumb ? (
                      <Thumb src={l.thumb} className="h-full w-full object-contain" />
                    ) : (
                      <Icon name={typeIcon(l.type)} className="h-5 w-5" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-display text-sm text-cream/90">{l.title}</span>
                  <span aria-hidden className="shrink-0 text-amber">★</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Para você — sugestões de conteúdo (quadrados de mesmo tamanho) */}
      {picks.length > 0 && (
        <section className="mt-6">
          <div className="mb-1 flex items-baseline justify-between">
            <h3 className="font-serif text-lg font-bold text-cream">{h.forYouTitle}</h3>
            <button onClick={() => root({ name: "learn" })} className="text-xs font-medium text-amber">{h.seeAll}</button>
          </div>
          <p className="mb-3 text-xs text-cream/45">{h.forYouSub}</p>
          <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(() => {
              const lessonCard = (l: Lesson) => {
                const locked = l.premium && !s.premium;
                return (
                  <button
                    key={l.id}
                    onClick={() => go(locked ? { name: "subscribe", ctx: "home" } : { name: "content", id: l.id })}
                    className="flex w-36 shrink-0 flex-col self-start text-left"
                  >
                    {/* As capas já trazem o fundo #16181D e a margem interna — o card
                        usa o mesmo tom e zero padding para não criar moldura dupla. */}
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-graphite ring-1 ring-amber/45">
                      {l.thumb ? (
                        <Thumb src={l.thumb} className="h-full w-full object-contain" />
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
                  <div className="aspect-square overflow-hidden rounded-2xl bg-graphite ring-1 ring-amber/45">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/learn/equipment.png?v=4" alt="" className="h-full w-full object-contain" draggable={false} />
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-cream/85">{c.equipmentUi.cardTitle}</p>
                </button>
              );
              // 1ª posição: com carro cadastrado, "Próximas revisões". Se
              // faltar dado (quiz de saúde, km ou data de compra), o card
              // pede para completar — sem dados o plano não fica preciso.
              const carComplete =
                !!car && !!(car.quiz && Object.keys(car.quiz).length) && car.odometerKm != null && !!car.purchaseDate;
              const revisionsCard = car ? (
                <button
                  key="revisions"
                  onClick={() => {
                    if (carComplete) root({ name: "revisions" });
                    else if (!(car.quiz && Object.keys(car.quiz).length) || !car.purchaseDate) go({ name: "healthQuiz" });
                    else go({ name: "car" });
                  }}
                  className="flex w-36 shrink-0 flex-col self-start text-left"
                >
                  <div className="relative grid aspect-square place-items-center overflow-hidden rounded-2xl bg-graphite ring-1 ring-amber/45">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/learn/revisions.png?v=4" alt="" className="h-full w-full object-contain" draggable={false} />
                    {!carComplete && (
                      <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-amber font-display text-sm font-bold text-graphite">!</span>
                    )}
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-cream/85">
                    {carComplete ? h.revisionsCard : h.completeCarCard}
                  </p>
                  {!carComplete && <p className="line-clamp-2 text-[11px] leading-snug text-amber/80">{h.completeCarWhy}</p>}
                </button>
              ) : null;
              return [
                ...(revisionsCard ? [revisionsCard] : []),
                ...picks.slice(0, 2).map(lessonCard),
                kitCard,
                ...picks.slice(2).map(lessonCard),
              ];
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
          {/* Marcos destravam sozinhos; Momentos são os que o motorista
              registra. Sem nenhum Momento vivido, a seção só mostra o que veio
              de brinde — então o convite vem antes do carrossel, direto na aba
              certa do acervo. */}
          {livedMoments === 0 && (
            <button
              onClick={() => go({ name: "achievements", tab: "momento" })}
              className="mb-3 flex w-full items-center gap-3 rounded-2xl bg-gradient-to-br from-amber/15 to-amber/5 px-4 py-3.5 text-left ring-1 ring-amber/25 hover:ring-amber/45"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-graphite ring-1 ring-amber/35">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/memories/firstTrip.png" alt="" className="h-full w-full object-contain" draggable={false} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[15px] font-semibold text-cream">{h.addMemories}</span>
                <span className="mt-0.5 block text-xs leading-snug text-cream/55">{h.addMemoriesSub}</span>
              </span>
              <span className="shrink-0 text-amber">›</span>
            </button>
          )}
          <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {memories.map((m) => {
              const photo = s.momentPhotos?.[m.id];
              const label = gm[m.id]?.title ?? m.id;
              return (
                <button key={m.id} onClick={() => go({ name: "achievements", tab: m.cat })} className="flex w-28 shrink-0 flex-col self-start text-left">
                  <div className="grid aspect-square place-items-center overflow-hidden rounded-2xl bg-graphite ring-1 ring-white/[0.06]">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt="" className="h-full w-full object-cover" draggable={false} />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/memories/${m.id}.png`} alt="" className="h-full w-full object-contain" draggable={false} />
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
            <span className={`grid h-14 w-14 place-items-center overflow-hidden rounded-2xl p-2 ${q.tint}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/actions/${q.art}.png`} alt="" className="h-full w-full object-contain" draggable={false} />
            </span>
            <span className="text-center text-[11px] leading-tight text-cream/70">{q.label}</span>
          </button>
        ))}
      </div>

      {/* Lembrete mensal: atualizar o km do painel */}
      <Sheet open={kmAsk} onClose={adiarKm}>
        <h2 className="font-display text-xl font-bold text-cream">{h.kmAskTitle}</h2>
        <p className="mt-1 text-sm leading-relaxed text-cream/60">
          {h.kmAskBody.replace("{km}", (car?.odometerKm ?? 0).toLocaleString())}
        </p>
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          value={kmNovo}
          onChange={(e) => { setKmNovo(e.target.value); setKmErro(null); }}
          placeholder={h.kmAskPh.replace("{km}", (car?.odometerKm ?? 0).toLocaleString())}
          className={`mt-4 ${inputCls} placeholder:text-cream/30`}
        />
        {kmErro && (
          <p className="mt-2 rounded-lg bg-coral/10 px-3 py-2 text-sm leading-relaxed text-coral ring-1 ring-coral/20">{kmErro}</p>
        )}
        <Button size="lg" className="mt-4 w-full" onClick={salvarKm}>{h.kmAskSave}</Button>
        <button onClick={adiarKm} className="mx-auto mt-3 block py-1 text-sm text-cream/50 hover:text-cream">
          {h.kmAskLater}
        </button>
      </Sheet>
    </div>
  );
}
