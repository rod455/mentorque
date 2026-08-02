"use client";

import { useState } from "react";
import { usePrototype } from "@/lib/app/store";
import { useNav } from "@/lib/app/nav";
import { AppHeader, Card, SeverityDot, inputCls, useContent } from "../ui";
import { Button } from "@/components/ui/Button";

// 2.2.E — Códigos OBD2: o que são, a ferramenta e a consulta com autocomplete.
export function Obd2Screen() {
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

  // "Aprofunde": monta a pergunta pro Biela; sem premium vai pro paywall.
  const deepen = (code: string, meaning?: string) => {
    const seed = meaning
      ? t.deepenSeed.replace("{code}", code).replace("{meaning}", meaning)
      : t.deepenSeedUnknown.replace("{code}", code);
    go(s.premium ? { name: "biela", seed } : { name: "subscribe", ctx: "obd2" });
  };

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

      {/* Consulta com autocomplete */}
      <p className="mb-2 mt-6 font-serif text-lg font-bold text-cream">{t.searchTitle}</p>
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
    </div>
  );
}
