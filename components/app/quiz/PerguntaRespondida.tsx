"use client";

import type { Pergunta } from "@/lib/app/quiz/perguntas";
import { useContent } from "../ui";

// A pergunta REVISTA: como ela ficou depois de respondida.
//
// Existe porque a tela de "você já respondeu hoje" mostrava só a confirmação e
// a sequência, e escondia justamente o que a pessoa foi buscar ao voltar: qual
// era a pergunta, o que ela marcou, e o porquê. Quem revisita um quiz não quer
// saber que respondeu, quer reler a explicação.
//
// O mesmo bloco serve o dia de hoje e qualquer dia do calendário, e é de
// propósito: a resposta de três semanas atrás precisa aparecer exatamente como
// apareceu no dia, senão o histórico vira outra coisa.
export function PerguntaRespondida({
  pergunta,
  escolha,
  aoAbrirAula,
}: {
  pergunta: Pergunta;
  /** Índice que a pessoa marcou. */
  escolha: number;
  aoAbrirAula: () => void;
}) {
  const c = useContent();
  const q = c.quiz;
  const acertou = escolha === pergunta.correta;

  return (
    <div>
      <h2 className="text-balance font-serif text-[19px] font-bold leading-snug text-cream">
        {pergunta.pergunta}
      </h2>

      <div className="mt-4 space-y-2">
        {pergunta.opcoes.map((opcao, i) => {
          const certa = i === pergunta.correta;
          const minha = i === escolha;
          // A certa em verde SEMPRE, inclusive quando a pessoa errou: é o que
          // ela precisa ver. A que ela marcou fica identificada sem estardalhaço.
          const cor = certa
            ? "bg-teal/15 ring-teal/50 text-cream"
            : minha
              ? "bg-coral/10 ring-coral/40 text-cream/80"
              : "bg-graphite-700 ring-white/[0.05] text-cream/40";
          return (
            <div key={i} className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 ring-1 ${cor}`}>
              <span
                aria-hidden
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px] font-bold ${
                  certa ? "bg-teal text-graphite" : minha ? "bg-coral/70 text-graphite" : "bg-white/10 text-cream/60"
                }`}
              >
                {certa ? "✓" : minha ? "✕" : String.fromCharCode(65 + i)}
              </span>
              <span className="min-w-0 flex-1 text-[14px] leading-snug">{opcao}</span>
              {minha && (
                <span className="shrink-0 text-[11px] uppercase tracking-wide text-cream/45">{q.suaResposta}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className={`mt-4 rounded-2xl p-4 ring-1 ${acertou ? "bg-teal/10 ring-teal/25" : "bg-graphite-700 ring-white/[0.08]"}`}>
        <p className={`font-display text-[14px] font-bold ${acertou ? "text-teal" : "text-cream"}`}>
          {acertou ? q.acertou : q.errou}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-cream/70">{pergunta.porque}</p>
        <button
          onClick={aoAbrirAula}
          className="mt-3 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-amber"
        >
          {q.verAula}
          <span aria-hidden>›</span>
        </button>
      </div>
    </div>
  );
}
