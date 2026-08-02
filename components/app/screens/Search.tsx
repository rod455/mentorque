"use client";

import { useEffect, useRef, useState } from "react";
import { activeVehicle, usePrototype } from "@/lib/app/store";
import { carName } from "@/lib/app/content";
import { useNav } from "@/lib/app/nav";
import { AppHeader, Icon, SeverityDot, useContent } from "../ui";

// Tela de busca dedicada (aberta pela barra da Home). Mesma lógica de
// "Descreva o problema" da aba Problemas: filtra sintomas e cai na Biela.
export function SearchScreen() {
  const c = useContent();
  const t = c.search;
  const { s } = usePrototype();
  const { go, back } = useNav();
  const v = activeVehicle(s);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Abre já com o campo focado (teclado sobe direto).
  useEffect(() => { inputRef.current?.focus(); }, []);

  const query = q.trim().toLowerCase();
  const matches = query.length >= 2 ? c.symptoms.filter((sx) => sx.label.toLowerCase().includes(query)) : [];
  const bielaSeed = (v ? `Meu ${carName(v)} ` : "Meu carro ") + `está com: ${q}. O que pode ser e o que devo fazer?`;

  return (
    <div>
      {/* Cabeçalho: voltar + campo de busca */}
      <div className="flex items-center gap-2.5 pb-3 pt-5">
        <button onClick={back} aria-label="voltar" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-graphite-700 text-cream/70 hover:text-cream">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <div className="flex flex-1 items-center gap-2.5 rounded-full bg-graphite-800 px-4 py-2.5 ring-1 ring-white/10">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-cream/45"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.ph}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-cream outline-none placeholder:text-cream/40"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="limpar" className="text-cream/40 hover:text-cream">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          )}
        </div>
      </div>

      {/* Estado vazio (menos de 2 caracteres) */}
      {query.length < 2 ? (
        <div className="mt-14 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/biela/biela-idle.png" alt="Biela" className="h-28 w-28 object-contain" draggable={false} />
          <p className="mt-2 font-serif text-lg font-semibold text-cream">{t.title}</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-cream/55">{t.hint}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {matches.map((sx) => (
            <button
              key={sx.id}
              onClick={() => go({ name: "symptom", id: sx.id })}
              className="flex w-full items-center gap-3 rounded-xl bg-graphite-800 px-3.5 py-3.5 text-left ring-1 ring-white/5 hover:ring-amber/30"
            >
              <SeverityDot level={sx.urgency.level} />
              <span className="min-w-0 flex-1 font-display text-[15px] text-cream">{sx.label}</span>
              <span className="text-cream/40">›</span>
            </button>
          ))}

          {/* Biela sempre como saída */}
          <button
            onClick={() => go({ name: "biela", seed: bielaSeed })}
            className="flex w-full items-center gap-3 rounded-2xl bg-gradient-to-br from-amber/15 to-amber/5 px-3.5 py-3.5 text-left ring-1 ring-amber/25 hover:ring-amber/45"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-graphite-900/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/biela/biela-idle.png" alt="" className="h-full w-full object-contain" />
            </span>
            <span className="min-w-0 flex-1 text-sm text-cream/90">{t.askBiela.replace("{q}", q)}</span>
            <span className="shrink-0 text-amber">›</span>
          </button>
        </div>
      )}
    </div>
  );
}
