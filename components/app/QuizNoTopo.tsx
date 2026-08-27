"use client";

import { usePrototype } from "@/lib/app/store";
import { useNav } from "@/lib/app/nav";
import { QUIZ_ZERADO, diaLocal, respondeuHoje, sequenciaHoje } from "@/lib/app/quiz/sequencia";
import { useContent } from "./ui";

// A chamada do quiz, no topo, ao lado do sininho.
//
// Ela já foi uma faixa inteira no meio do Início e do Calendário
// (FaixaDoQuiz). Virou chip na barra de cima a pedido do dono (27/08, depois
// de aprovar o mesmo desenho para o carro): a Home tinha quatro cartões
// empilhados antes do carro, e a faixa era o mais alto deles. Como chip, a
// chamada aparece nas CINCO abas raiz de uma vez — mais presença com menos
// tela do que as duas faixas somavam.
//
// O que o chip precisa dizer em pouquíssimo espaço:
//
//   pendente  →  chama: fundo âmbar, "Quiz Diário", e a sequência em jogo
//   feito     →  confirma sem gritar: ✓ discreto, e a sequência conquistada
//
// A sequência (🔥 N) só aparece quando existe: "🔥 0" não motiva ninguém,
// anuncia um zero. E abaixo de 380px o rótulo escrito some — ficam o símbolo
// e o foguinho — porque a barra divide espaço com o seletor de carro, e chip
// por cima do sininho é pior que chip sem texto.
export function ChipDoQuiz() {
  const c = useContent();
  const q = c.quiz;
  const { s } = usePrototype();
  const { go } = useNav();

  const hoje = diaLocal();
  const estado = s.quiz ?? QUIZ_ZERADO;
  const feito = respondeuHoje(estado, hoje);
  const sequencia = sequenciaHoje(estado, hoje);

  const textoSequencia =
    sequencia === 1 ? q.sequenciaUm : q.sequenciaN.replace("{n}", String(sequencia));
  const rotulo = `${q.chipTitulo}: ${feito ? q.faixaFeito : q.abrirHomeSub}${sequencia > 0 ? `. ${textoSequencia}` : ""}`;

  return (
    <button
      onClick={() => go({ name: "quiz" })}
      aria-label={rotulo}
      className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 font-display text-xs font-semibold transition-colors ${
        feito
          ? "bg-graphite-800 text-cream/70 ring-1 ring-white/10"
          : "bg-amber/15 text-amber ring-1 ring-amber/30"
      }`}
    >
      <span aria-hidden className={feito ? "text-teal" : ""}>{feito ? "✓" : "?"}</span>
      <span aria-hidden className="hidden min-[380px]:inline">{q.chipTitulo}</span>
      {sequencia > 0 && (
        <span aria-hidden className="flex items-center gap-0.5">
          <span className="text-[13px] leading-none">🔥</span>
          <span className={`text-[13px] font-bold leading-none ${feito ? "text-amber" : ""}`}>{sequencia}</span>
        </span>
      )}
    </button>
  );
}
