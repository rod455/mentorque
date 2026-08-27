"use client";

import { useEffect, useMemo, useState } from "react";
import { usePrototype } from "@/lib/app/store";
import { useAuth } from "@/lib/app/auth";
import { useI18n } from "@/lib/i18n";
import { useNav, type View } from "@/lib/app/nav";
import { ownedVehicles } from "@/lib/app/store";
import { diaLocal, diasEntre, perguntaDoOnboarding } from "@/lib/app/quiz/sequencia";
import { perguntasDoQuiz } from "@/lib/app/quiz/perguntas";
import { enviarResposta } from "@/lib/app/quiz/placar";
import { useContent } from "./ui";

// A primeira pergunta, apresentada uma vez só.
//
// ONDE ELA NÃO FICA MAIS, e por quê: estava dentro do onboarding, como uma
// página entre os cards e a prova social. Saiu de lá porque competia com o
// que o onboarding existe para fazer, que é levar a pessoa a cadastrar o
// carro. Um quiz no meio do caminho ou rouba a atenção do cadastro, ou é
// pulado no impulso de terminar as telas.
//
// ONDE ELA FICA AGORA, dois gatilhos:
//
//   1. logo depois do PRIMEIRO CARRO cadastrado. É o melhor momento do app:
//      a pessoa acabou de investir alguma coisa, está satisfeita, e uma
//      pergunta de dez segundos sobre o carro que ela acabou de cadastrar cai
//      no lugar certo;
//   2. quem NÃO cadastrou carro recebe no dia seguinte. Sem isso, quem só
//      espiou o app nunca descobriria que o quiz existe, e é justamente essa
//      pessoa que precisa de um motivo para voltar.
//
// A pergunta é sempre a primeira do banco, que fica fora da rotação diária
// justamente por isso (ver quiz/sequencia.ts). É a mais mito-quebradora de
// todas de propósito: quem descobre no primeiro minuto que trocava óleo cedo
// demais entendeu, sozinho, para que serve o app inteiro.

/** Só interrompe onde a pessoa não está no meio de uma tarefa. */
const TELAS_PERMITIDAS = new Set<View["name"]>(["home", "car"]);

const CHAVE_DISPENSA = "mq-primeiro-quiz-nao";

export function PrimeiroQuiz() {
  const c = useContent();
  const q = c.quiz;
  const { locale } = useI18n();
  const { s, responderQuiz } = usePrototype();
  const { user } = useAuth();
  const { view, go } = useNav();

  const [dispensou, setDispensou] = useState(true); // pessimista até ler o aparelho
  const [escolha, setEscolha] = useState<number | null>(null);
  const [fechado, setFechado] = useState(false);

  useEffect(() => {
    try { setDispensou(!!window.localStorage.getItem(CHAVE_DISPENSA)); } catch { setDispensou(false); }
  }, []);

  const perguntas = useMemo(() => perguntasDoQuiz(locale), [locale]);
  const pergunta = perguntaDoOnboarding(perguntas);

  const hoje = diaLocal();
  const jaRespondeuAlgumDia = !!s.quiz?.ultimoDia;
  const temCarro = ownedVehicles(s).length > 0;
  // "No dia seguinte": um dia inteiro depois do primeiro acesso. `startedAt` é
  // gravado quando o onboarding termina, então isto conta a partir de quando a
  // pessoa realmente entrou no app, não de quando instalou.
  const passouUmDia = !!s.startedAt && diasEntre(s.startedAt, hoje) >= 1;

  const respondeu = escolha !== null;

  // Depois de responder, a folha FICA, e só sai pelo botão ou pelo X.
  //
  // Sem essa exceção ela se fecharia sozinha no instante do toque: responder
  // grava `s.quiz`, `jaRespondeuAlgumDia` vira verdadeiro e a condição de
  // baixo deixa de valer. A pessoa tocaria numa opção e a tela sumiria antes
  // de ela ler a explicação, que é a única coisa que o quiz entrega.
  const cabe =
    !!pergunta &&
    !fechado &&
    (respondeu ||
      (!dispensou &&
        !jaRespondeuAlgumDia &&
        TELAS_PERMITIDAS.has(view.name) &&
        (temCarro || passouUmDia)));

  if (!cabe || !pergunta) return null;
  const acertou = escolha === pergunta.correta;

  const dispensar = () => {
    setFechado(true);
    // Só marca quando a pessoa SAI SEM responder. Quem respondeu já não volta
    // a ver isto (o `s.quiz` passa a existir), e aí a marca é ruído.
    if (!respondeu) {
      try { window.localStorage.setItem(CHAVE_DISPENSA, "1"); } catch { /* modo privado */ }
    }
  };

  return (
    <div className="fixed inset-0 z-[65] flex items-end justify-center" role="dialog" aria-modal="true">
      <button aria-label={q.avisoNao} className="absolute inset-0 bg-black/70" onClick={dispensar} />
      <div className="relative app-col max-h-[92dvh] overflow-y-auto rounded-t-3xl bg-graphite-800 p-5 pb-[calc(1.75rem+env(safe-area-inset-bottom))] ring-1 ring-white/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={dispensar}
          aria-label={q.avisoNao}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-graphite-700 text-cream/70"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="h-4 w-4">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-amber">{q.titulo}</p>
        <p className="mt-1 pr-12 text-sm text-cream/60">
          {temCarro ? q.primeiroComCarro : q.primeiroSemCarro}
        </p>

        <h2 className="mt-4 text-balance font-serif text-[21px] font-bold leading-snug text-cream">
          {pergunta.pergunta}
        </h2>

        <div className="mt-4 space-y-2.5">
          {pergunta.opcoes.map((opcao, i) => {
            const certa = i === pergunta.correta;
            const minha = i === escolha;
            const cor = !respondeu
              ? "bg-graphite-700 ring-white/[0.08] text-cream/90"
              : certa
                ? "bg-teal/15 ring-teal/50 text-cream"
                : minha
                  ? "bg-coral/10 ring-coral/40 text-cream/80"
                  : "bg-graphite-700 ring-white/[0.05] text-cream/40";
            return (
              <button
                key={i}
                onClick={() => {
                  if (respondeu) return;
                  setEscolha(i);
                  const certo = i === pergunta.correta;
                  // A sequência começa AQUI, acertando ou não.
                  responderQuiz({ perguntaId: pergunta.id, escolha: i, acertou: certo });
                  enviarResposta({ dia: hoje, perguntaId: pergunta.id, acertou: certo, userId: user?.id ?? null });
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
          <>
            <div className={`mt-4 rounded-2xl p-5 ring-1 ${acertou ? "bg-teal/10 ring-teal/25" : "bg-graphite-700 ring-white/[0.08]"}`}>
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
              <button
                onClick={() => { setFechado(true); go({ name: "content", id: pergunta.aula }); }}
                className="mt-4 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-amber"
              >
                {q.verAula}
                <span aria-hidden>›</span>
              </button>
            </div>

            {/* A explicação do combinado, uma vez só. É aqui que a pessoa
                entende que existe uma amanhã, e é por isso que a frase vem
                depois de ela ter gostado da de hoje, não antes. */}
            <p className="mx-auto mt-4 max-w-[19rem] text-center text-[13px] leading-relaxed text-cream/55">
              {q.primeiroFecho}
            </p>

            <button
              onClick={() => setFechado(true)}
              className="mt-4 w-full rounded-xl bg-amber px-4 py-3.5 font-display text-[15px] font-semibold text-graphite active:scale-[0.99]"
            >
              {q.seguir}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
