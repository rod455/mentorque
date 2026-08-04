"use client";

import { useState } from "react";
import { usePrototype } from "@/lib/app/store";
import { useNav } from "@/lib/app/nav";
import { AppHeader, Card, SeverityDot, inputCls, useContent } from "../ui";
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
  };

  const deepen = (code: string, meaning?: string) => {
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
  const { s, markLessonSeen } = usePrototype();
  const { go } = useNav();
  const done = (s.seenLessons ?? []).includes("read-obd2");

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

      {/* Concluído — mesma mecânica das outras aulas */}
      <Button variant="secondary" className="mt-6 w-full" onClick={() => markLessonSeen("read-obd2")}>
        {done ? `✓ ${c.learn.completed}` : c.learn.complete}
      </Button>
    </div>
  );
}

// Como escanear com o leitor OBD2: vídeo, onde fica a porta, passo a passo da
// leitura e, no fim, a mesma consulta de códigos.
export function Obd2ScanScreen() {
  const c = useContent();
  const t = c.obd2;
  const { s, markLessonSeen } = usePrototype();
  const done = (s.seenLessons ?? []).includes("obd2-scan");
  const lesson = c.lessons.find((l) => l.id === "obd2-scan");

  return (
    <div>
      <AppHeader title={t.scanTitle} />

      <p className="text-sm leading-relaxed text-cream/70">{t.scanIntro}</p>

      {/* Vídeo da aula */}
      {lesson?.media && (
        <div className="mt-4">
          <VideoPlayer media={lesson.media} />
        </div>
      )}

      {/* Onde fica a porta */}
      <Card className="mt-4">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal/15 text-2xl">📍</span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[15px] font-semibold text-cream">{t.whereTitle}</p>
            <p className="mt-1 text-sm leading-relaxed text-cream/65">{t.whereBody}</p>
          </div>
        </div>
      </Card>

      {/* Passo a passo */}
      <p className="mb-2 mt-6 font-serif text-lg font-bold text-cream">{t.stepsTitle}</p>
      <div className="space-y-2">
        {t.scanSteps.map((step, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl bg-graphite-800 px-3.5 py-3 ring-1 ring-white/5">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber/15 font-display text-xs font-bold text-amber">
              {i + 1}
            </span>
            <p className="text-sm leading-relaxed text-cream/80">{step}</p>
          </div>
        ))}
      </div>

      {/* Consulta de códigos — a mesma da página de códigos */}
      <p className="mb-2 mt-6 font-serif text-lg font-bold text-cream">{t.searchTitle}</p>
      <Obd2Lookup />

      {/* Concluído — mesma mecânica das outras aulas */}
      <Button variant="secondary" className="mt-6 w-full" onClick={() => markLessonSeen("obd2-scan")}>
        {done ? `✓ ${c.learn.completed}` : c.learn.complete}
      </Button>
    </div>
  );
}
