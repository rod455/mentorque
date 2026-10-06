"use client";

import { ownedVehicles, usePrototype } from "@/lib/app/store";
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
// anuncia um zero. E o rótulo escrito some quando o espaço aperta, ficando o
// símbolo e o foguinho: abaixo de 430px com um carro (a marca por extenso ao
// lado precisa de ~427px de barra), e abaixo de 480px com o seletor de carro.
// Medido: o rótulo custa 67px, e é exatamente o que falta para "Golfinho
// 2014" inteiro num caso e para o lockup não ficar coberto no outro. Chip
// por cima da marca, ou carro ilegível, é pior que chip sem texto.
export function ChipDoQuiz() {
  const c = useContent();
  const q = c.quiz;
  const { s } = usePrototype();
  const { go } = useNav();

  const divideComSeletor = ownedVehicles(s).length >= 2;

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
      {/* A palavra "Quiz" SEMPRE, e sem o "?" (06/10/2026): o "?" era o mesmo
          sinal do botão flutuante de dúvida, com outro sentido. O rótulo
          comprido continua escondido onde não cabe; a palavra curta cabe em
          qualquer barra. A sequência vem como número, sem emoji. */}
      <span aria-hidden className={feito ? "text-teal" : ""}>{feito ? "✓" : "Quiz"}</span>
      <span aria-hidden className={divideComSeletor ? "hidden min-[480px]:inline" : "hidden min-[430px]:inline"}>
        {feito ? q.chipTitulo : q.chipTitulo.replace(/^Quiz\s*/i, "")}
      </span>
      {sequencia > 0 && (
        <span aria-hidden className={`text-[13px] font-bold leading-none ${feito ? "text-amber" : ""}`}>· {sequencia}</span>
      )}
    </button>
  );
}
