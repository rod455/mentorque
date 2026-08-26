"use client";

import { useMemo, useState } from "react";
import { usePrototype } from "@/lib/app/store";
import { useI18n } from "@/lib/i18n";
import { perguntasDoQuiz } from "@/lib/app/quiz/perguntas";
import { perguntaDoOnboarding } from "@/lib/app/quiz/sequencia";
import { Button } from "@/components/ui/Button";
import { useContent } from "./ui";

// O primeiro quiz, dentro do onboarding.
//
// Não está aqui para ensinar (a explicação ajuda, mas é só uma). Está aqui por
// três motivos, nessa ordem:
//
//   1. mostrar o que é o quiz FAZENDO, em dez segundos, em vez de prometer numa
//      tela de apresentação que ninguém lê;
//   2. abrir a sequência em 1 no primeiro dia. Sequência que começa em zero não
//      existe para a pessoa; começando em 1 ela já tem algo a continuar amanhã;
//   3. dar sentido ao pedido de notificação que vem depois. "Ative os avisos"
//      não convence ninguém; "quer a de amanhã?" convence quem acabou de gostar
//      da de hoje.
//
// A pergunta é sempre a mesma, a primeira do banco, e ela fica FORA da rotação
// diária justamente por isso (ver quiz/sequencia.ts). É a mais mito-quebradora
// de todas de propósito: quem descobre no primeiro minuto que trocava óleo cedo
// demais entendeu, sozinho, para que serve o app inteiro.

export function QuizDeBoasVindas({ aoSeguir }: { aoSeguir: () => void }) {
  const c = useContent();
  const q = c.quiz;
  const { locale } = useI18n();
  const { responderQuiz } = usePrototype();

  const perguntas = useMemo(() => perguntasDoQuiz(locale), [locale]);
  const pergunta = perguntaDoOnboarding(perguntas);
  const [escolha, setEscolha] = useState<number | null>(null);

  if (!pergunta) {
    aoSeguir();
    return null;
  }

  const respondeu = escolha !== null;
  const acertou = escolha === pergunta.correta;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <p className="mt-1 font-display text-xs font-semibold uppercase tracking-[0.14em] text-amber">{q.titulo}</p>
      <h1 className="mt-2 text-balance font-serif text-[24px] font-bold leading-snug text-cream">
        {pergunta.pergunta}
      </h1>

      <div className="mt-5 space-y-2.5">
        {pergunta.opcoes.map((opcao, i) => {
          const certa = i === pergunta.correta;
          const minha = i === escolha;
          const cor = !respondeu
            ? "bg-graphite-800 ring-white/[0.08] text-cream/90"
            : certa
              ? "bg-teal/15 ring-teal/50 text-cream"
              : minha
                ? "bg-coral/10 ring-coral/40 text-cream/80"
                : "bg-graphite-800 ring-white/[0.05] text-cream/40";
          return (
            <button
              key={i}
              onClick={() => {
                if (respondeu) return;
                setEscolha(i);
                // A sequência começa AQUI, no primeiro dia, acertando ou não.
                responderQuiz(i === pergunta.correta);
              }}
              disabled={respondeu}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left ring-1 transition-colors ${cor}`}
            >
              <span
                aria-hidden
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px] font-bold ${
                  respondeu && certa
                    ? "bg-teal text-graphite"
                    : respondeu && minha
                      ? "bg-coral/70 text-graphite"
                      : "bg-white/10 text-cream/60"
                }`}
              >
                {respondeu && certa ? "✓" : respondeu && minha ? "✕" : String.fromCharCode(65 + i)}
              </span>
              <span className="min-w-0 flex-1 text-[15px] leading-snug">{opcao}</span>
            </button>
          );
        })}
      </div>

      {respondeu && (
        <div className={`mt-4 rounded-2xl p-5 ring-1 ${acertou ? "bg-teal/10 ring-teal/25" : "bg-graphite-800 ring-white/[0.08]"}`}>
          <p className={`font-display text-[15px] font-bold ${acertou ? "text-teal" : "text-cream"}`}>
            {acertou ? q.acertou : q.errou}
          </p>
          {!acertou && (
            <p className="mt-1.5 text-sm text-cream/80">
              <span className="text-cream/50">{q.aRespostaE} </span>
              {pergunta.opcoes[pergunta.correta]}
            </p>
          )}
          <p className="mt-2.5 text-sm leading-relaxed text-cream/70">{pergunta.porque}</p>
        </div>
      )}

      {/* O botão só aparece depois de responder: sem isso a pessoa pula sem
          jogar, e aí o passo não fez nada além de tomar o tempo dela. */}
      <div className="mt-auto pt-5">
        {respondeu ? (
          <Button size="lg" className="w-full" onClick={aoSeguir}>
            {c.splash.next}
          </Button>
        ) : (
          <p className="pb-3 text-center text-xs text-cream/40">{q.abrirHomeSub}</p>
        )}
      </div>
    </div>
  );
}
