"use client";

import { useEffect, useState } from "react";
import { usePrototype } from "@/lib/app/store";
import { useNav } from "@/lib/app/nav";
import { courseOf } from "@/lib/app/cursos";
import { pedirFeedback } from "@/lib/app/feedbackPrompt";
import { Button } from "@/components/ui/Button";
import { AppHeader, PinButton, Sheet, Thumb, UpgradeBanner, useContent } from "../ui";
import type { Content as Conteudo } from "@/lib/app/content";
import { ItemRow } from "../estudos/ItemDeAula";
import { VideoPlayer } from "../VideoPlayer";
import { AdOverlay, adsEnabled } from "../AdGate";
import { canShowAd, markAdShown, registerContentOpen } from "@/lib/app/adPolicy";

type Item = Conteudo["lessons"][number];

// O leitor de aula: o artigo estruturado, o vídeo, e a navegação da trilha.
//
// MOROU DENTRO DE Learn.tsx, junto com mais seis telas. Quem queria mexer no
// formato do artigo abria um arquivo de mil linhas chamado "Estudos" e
// procurava. O renderizador do texto (`ArticleBody` e `InlineText`) é o miolo
// disto e agora está na primeira tela do arquivo, que é onde alguém procura.

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


export function ContentScreen({ id }: { id: string }) {
  const c = useContent();
  const { go, back } = useNav();
  const { s, markLessonSeen, toggleLessonSaved } = usePrototype();
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


function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cream/45">{title}</p>
      {children}
    </div>
  );
}