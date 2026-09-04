"use client";

import { useState } from "react";
import { usePrototype } from "@/lib/app/store";
import { useNav } from "@/lib/app/nav";
import { anotaCodigo } from "@/lib/app/obd2Consultados";
import { AppHeader, Card, PinButton, SeverityDot, UpgradeBanner, inputCls, useContent } from "../ui";
import { Button } from "@/components/ui/Button";
import { VideoPlayer } from "../VideoPlayer";

// Consulta de códigos com autocomplete — usada na página de códigos e na de
// "como escanear". "Aprofunde" monta a pergunta pro Biela (premium).
function Obd2Lookup() {
  const c = useContent();
  const t = c.obd2;
  const { s } = usePrototype();
  const { go } = useNav();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<(typeof t.codes)[number] | null>(null);

  const query = q.trim().toUpperCase();
  const matches =
    query.length >= 1
      ? t.codes.filter((r) => r.code.startsWith(query) || r.meaning.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 8)
      : [];
  // Código digitado com formato válido mas fora da tabela → ainda oferece o Biela.
  const unknownTyped = /^[PCBU]\d{4}$/.test(query) && !t.codes.some((r) => r.code === query);

  const pick = (row: (typeof t.codes)[number]) => {
    setPicked(row);
    setQ(row.code);
    setOpen(false);
    // A BIELA PASSA A SABER DESTE CÓDIGO.
    //
    // Antes, o código só chegava até ela como frase, e apenas quando estava
    // FORA da tabela. Quem consultava P0300 aqui, lia o significado e depois
    // perguntava "meu carro está falhando" recebia resposta sem o dado mais
    // duro que existe sobre o carro. Ver lib/app/obd2Consultados.ts.
    anotaCodigo(row.code);
  };

  const deepen = (code: string, meaning?: string) => {
    anotaCodigo(code);
    const seed = meaning
      ? t.deepenSeed.replace("{code}", code).replace("{meaning}", meaning)
      : t.deepenSeedUnknown.replace("{code}", code);
    go(s.premium ? { name: "biela", seed } : { name: "subscribe", ctx: "obd2" });
  };

  return (
    <>
      <div className="relative">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setPicked(null); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={t.searchPh}
          autoComplete="off"
          autoCapitalize="characters"
          className={inputCls + " uppercase placeholder:normal-case"}
        />
        {open && query.length >= 1 && matches.length > 0 && !picked && (
          <div className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-xl bg-graphite-700 p-1 shadow-card ring-1 ring-white/10">
            {matches.map((row) => (
              <button
                key={row.code}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(row)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left hover:bg-white/5"
              >
                <span className="w-14 shrink-0 font-mono text-sm font-semibold text-amber">{row.code}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-cream">{row.meaning}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Resultado: só a linha do código escolhido */}
      {picked && (
        <Card className="mt-3">
          <div className="flex items-center gap-2.5">
            <SeverityDot level={picked.level} />
            <span className="font-mono text-lg font-bold text-amber">{picked.code}</span>
            <span className="ml-auto rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] font-medium text-cream/70">
              {t.system}: {picked.system}
            </span>
          </div>
          <p className="mt-2.5 text-[11px] font-semibold uppercase tracking-wide text-cream/45">{t.meaning}</p>
          <p className="mt-1 text-sm leading-relaxed text-cream/90">{picked.meaning}</p>
          <Button className="mt-4 w-full" onClick={() => deepen(picked.code, picked.meaning)}>
            🐻 {t.deepen}
          </Button>
        </Card>
      )}

      {/* Código válido fora da tabela → Biela conhece todos */}
      {!picked && unknownTyped && (
        <Card className="mt-3">
          <p className="text-sm text-cream/70">{t.notFound}</p>
          <Button className="mt-3 w-full" onClick={() => deepen(query)}>
            🐻 {t.deepen}
          </Button>
        </Card>
      )}
    </>
  );
}

// 2.2.E — Códigos OBD2: o que são, a ferramenta e a consulta com autocomplete.
// Concluir é ação do usuário (botão no fim), como nas outras aulas.
export function Obd2Screen() {
  const c = useContent();
  const t = c.obd2;
  const { s, markLessonSeen, toggleLessonSaved } = usePrototype();
  const { go } = useNav();
  const done = (s.seenLessons ?? []).includes("read-obd2");
  const saved = (s.savedLessons ?? []).includes("read-obd2");

  return (
    <div>
      <AppHeader title={t.title} />

      {/* O que são os códigos */}
      <p className="text-sm leading-relaxed text-cream/70">{t.intro}</p>
      <p className="mt-2.5 text-sm leading-relaxed text-cream/70">{t.howToRead}</p>

      {/* Ferramenta necessária */}
      <Card className="mt-4">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber/15 text-2xl">🔌</span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[15px] font-semibold text-cream">{t.toolTitle}</p>
            <p className="mt-1 text-sm leading-relaxed text-cream/65">{t.toolBody}</p>
          </div>
        </div>
      </Card>

      {/* Como escanear — aula com vídeo e passo a passo */}
      <button
        onClick={() => go({ name: "content", id: "obd2-scan" })}
        className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-amber/10 px-4 py-3.5 text-left ring-1 ring-amber/30 hover:ring-amber/50"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber/15 text-lg">🎬</span>
        <span className="min-w-0 flex-1 font-display text-sm font-semibold text-cream">{t.scanCta}</span>
        <span className="text-amber">›</span>
      </button>

      {/* Consulta com autocomplete */}
      <p className="mb-2 mt-6 font-serif text-lg font-bold text-cream">{t.searchTitle}</p>
      <Obd2Lookup />

      {/* Botões padrão: concluir + salvar + fixar */}
      <div className="mt-6 flex gap-2">
        <Button className="flex-1" onClick={() => markLessonSeen("read-obd2")}>{done ? `✓ ${c.learn.completed}` : c.learn.complete}</Button>
        <Button variant="ghost" className="flex-1" onClick={() => toggleLessonSaved("read-obd2")}>{saved ? `★ ${c.learn.savedLabel}` : `☆ ${c.learn.saveLater}`}</Button>
        <PinButton id="read-obd2" />
      </div>
      {!s.premium && <UpgradeBanner ctx="learn" text={c.paywalls.learn.title} />}
    </div>
  );
}

// "Como usar seu scanner OBD2" — mesmo template visual das outras aulas
// (vídeo → texto → você vai precisar → passo a passo → segurança → botões),
// com a consulta de códigos como seção extra antes dos botões.
export function Obd2ScanScreen() {
  const c = useContent();
  const t = c.obd2;
  const { s, markLessonSeen, toggleLessonSaved } = usePrototype();
  const lesson = c.lessons.find((l) => l.id === "obd2-scan");
  const done = (s.seenLessons ?? []).includes("obd2-scan");
  const saved = (s.savedLessons ?? []).includes("obd2-scan");
  if (!lesson) return <AppHeader title={t.scanTitle} />;

  return (
    <div>
      <AppHeader title={lesson.title} />

      {/* Player (in-app), igual às demais aulas */}
      {lesson.media && <VideoPlayer media={lesson.media} />}

      {/* Corpo do artigo */}
      <div className="mt-5 space-y-3">
        <p className="text-sm leading-relaxed text-cream/85">{t.scanIntro}</p>
        <p className="text-sm leading-relaxed text-cream/85">
          <span className="font-semibold text-cream">{t.whereTitle}:</span> {t.whereBody}
        </p>
      </div>

      {/* Você vai precisar */}
      <div className="mt-5">
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-cream/45">{c.learn.need}</p>
        <ul className="space-y-1.5">
          {lesson.need.map((x) => (
            <li key={x} className="flex gap-2 text-sm text-cream/80"><span className="text-teal">✓</span>{x}</li>
          ))}
        </ul>
      </div>

      {/* Passo a passo */}
      <div className="mt-5">
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-cream/45">{c.learn.steps}</p>
        <ol className="space-y-2">
          {t.scanSteps.map((x, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-cream/85">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber/15 font-display text-xs font-semibold text-amber">{i + 1}</span>
              {x}
            </li>
          ))}
        </ol>
      </div>

      {/* Dicas de segurança */}
      {lesson.safety.length > 0 && (
        <div className="mt-5">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-cream/45">{c.learn.safety}</p>
          <ul className="space-y-1.5">
            {lesson.safety.map((x) => (
              <li key={x} className="flex gap-2 rounded-lg bg-coral/10 px-3 py-2 text-sm text-cream/85 ring-1 ring-coral/15"><span className="text-coral">!</span>{x}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Consulta de códigos — extra desta aula */}
      <div className="mt-5">
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-cream/45">{t.searchTitle}</p>
        <Obd2Lookup />
      </div>

      {/* Botões padrão: concluir + salvar + fixar */}
      <div className="mt-6 flex gap-2">
        <Button className="flex-1" onClick={() => markLessonSeen("obd2-scan")}>{done ? `✓ ${c.learn.completed}` : c.learn.complete}</Button>
        <Button variant="ghost" className="flex-1" onClick={() => toggleLessonSaved("obd2-scan")}>{saved ? `★ ${c.learn.savedLabel}` : `☆ ${c.learn.saveLater}`}</Button>
        <PinButton id="obd2-scan" />
      </div>
      {!s.premium && <UpgradeBanner ctx="learn" text={c.paywalls.learn.title} />}
    </div>
  );
}
