"use client";

import { usePrototype } from "@/lib/app/store";
import { useNav } from "@/lib/app/nav";
import { QUIZ_ZERADO, diaLocal, respondeuHoje, sequenciaHoje } from "@/lib/app/quiz/sequencia";
import { Icon, useContent } from "./ui";

// A chamada para a pergunta do dia.
//
// Aparece em dois lugares (Início e Calendário) e muda de cara conforme o dia
// já foi feito ou não. Feito, ela sai do caminho visualmente mas NÃO some: é
// ela que carrega a sequência, e a sequência é a recompensa.
//
// A SEQUÊNCIA VIVE À DIREITA, num selo, e não mais escondida no subtítulo em
// cinza. Um número que a pessoa constrói dia após dia é a coisa mais valiosa
// da faixa; enterrá-lo em texto pequeno do lado do rótulo é tratá-lo como
// legenda. À direita ele fica sozinho, no fim da linha, que é onde o olho
// para depois de ler o título.
//
// Sem sequência (nunca respondeu, ou perdeu a que tinha) o selo simplesmente
// não aparece. "🔥 0" não motiva ninguém: anuncia um zero.
export function FaixaDoQuiz({ compacta = false }: { compacta?: boolean }) {
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

  return (
    <button
      onClick={() => go({ name: "quiz" })}
      className={`mt-3 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left ring-1 active:scale-[0.99] ${
        feito
          ? "bg-graphite-800 ring-white/[0.06]"
          : "bg-gradient-to-r from-amber/20 to-amber/[0.06] ring-amber/25"
      }`}
    >
      {/* Ícone da esquerda: estado do dia, e só. A chama saiu daqui para o selo
          da direita — duas chamas na mesma linha competiam entre si e nenhuma
          das duas dizia o número. */}
      <span
        aria-hidden
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
          feito ? "bg-white/[0.07] text-lg text-teal" : "bg-amber/20 text-amber"
        }`}
      >
        {feito ? "✓" : <Icon name="calendar" className="h-5 w-5" />}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-display text-[15px] font-semibold text-cream">
          {feito ? q.faixaFeito : compacta ? q.faixaResponder : q.abrirHome}
        </span>
        <span className="block truncate text-xs text-cream/55">
          {feito ? q.faixaFeitoSub : q.abrirHomeSub}
        </span>
      </span>

      {sequencia > 0 && (
        // O selo. `aria-label` com o texto por extenso porque emoji mais número
        // solto não se lê em voz alta como "1 dia seguido".
        <span
          role="img"
          aria-label={textoSequencia}
          className="flex shrink-0 items-center gap-1 rounded-full bg-amber/15 py-1 pl-1.5 pr-2.5 ring-1 ring-amber/30"
        >
          <span aria-hidden className="text-[15px] leading-none">🔥</span>
          <span aria-hidden className="font-display text-[15px] font-bold leading-none text-amber">
            {sequencia}
          </span>
        </span>
      )}

      <span aria-hidden className={`shrink-0 text-lg ${feito ? "text-cream/25" : "text-amber"}`}>›</span>
    </button>
  );
}
