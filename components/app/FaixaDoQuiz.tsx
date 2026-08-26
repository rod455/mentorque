"use client";

import { usePrototype } from "@/lib/app/store";
import { useNav } from "@/lib/app/nav";
import { QUIZ_ZERADO, diaLocal, respondeuHoje, sequenciaHoje } from "@/lib/app/quiz/sequencia";
import { useContent } from "./ui";

// A chamada para a pergunta do dia.
//
// Aparece em dois lugares e muda de cara conforme o dia já foi feito ou não.
// Feito, ela vira placar: some do caminho, mas continua mostrando a sequência,
// porque o número é a recompensa e escondê-lo tira o motivo de voltar.
export function FaixaDoQuiz({ compacta = false }: { compacta?: boolean }) {
  const c = useContent();
  const q = c.quiz;
  const { s } = usePrototype();
  const { go } = useNav();

  const hoje = diaLocal();
  const estado = s.quiz ?? QUIZ_ZERADO;
  const feito = respondeuHoje(estado, hoje);
  const sequencia = sequenciaHoje(estado, hoje);

  return (
    <button
      onClick={() => go({ name: "quiz" })}
      className={`mt-3 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left ring-1 active:scale-[0.99] ${
        feito
          ? "bg-graphite-800 ring-white/[0.06]"
          : "bg-gradient-to-r from-amber/20 to-amber/[0.06] ring-amber/25"
      }`}
    >
      <span
        aria-hidden
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg ${
          feito ? "bg-white/[0.07]" : "bg-amber/20"
        }`}
      >
        {feito ? "✓" : "🔥"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[15px] font-semibold text-cream">
          {feito ? q.faixaFeito : compacta ? q.faixaResponder : q.abrirHome}
        </span>
        <span className="block truncate text-xs text-cream/55">
          {sequencia > 0
            ? sequencia === 1
              ? q.sequenciaUm
              : q.sequenciaN.replace("{n}", String(sequencia))
            : q.abrirHomeSub}
        </span>
      </span>
      <span aria-hidden className={`shrink-0 text-lg ${feito ? "text-cream/25" : "text-amber"}`}>›</span>
    </button>
  );
}
